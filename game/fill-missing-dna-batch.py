#!/usr/bin/env python3

import argparse
import json
import re
import time
import urllib.parse
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path('/workspaces/Cycles-of-Survival')
ORGS_PATH = ROOT / 'game' / 'config' / 'organisms.json'
REPORT_PATH = ROOT / 'output' / 'dna-batch-report.json'

NCBI_ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
NCBI_ESUMMARY = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
NCBI_EFETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'


def http_get(url, timeout=60, retries=5):
    delay = 1.2
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Cycles-of-Survival-DNA-Batch/1.0'})
            with urllib.request.urlopen(req, timeout=timeout) as r:
                return r.read()
        except urllib.error.HTTPError as exc:
            if exc.code == 429:
                retry_after = exc.headers.get('Retry-After') if exc.headers else None
                if retry_after and str(retry_after).isdigit():
                    delay = max(delay, float(retry_after))
            if attempt == retries:
                raise
            time.sleep(delay)
            delay *= 1.9
        except Exception:
            if attempt == retries:
                raise
            time.sleep(delay)
            delay *= 1.9


def normalize_letters(seq):
    return re.sub(r'[^A-Za-z]', '', seq or '').upper()


def is_ambiguous_name(name):
    n = (name or '').strip().lower()
    return (not n) or bool(re.search(r'\bsp\.?\b', n))


def score_docsum(d):
    title = str(d.get('title', '')).lower()
    score = 0
    if 'complete genome' in title:
        score += 80
    if 'chromosome' in title:
        score += 20
    if 'genome' in title:
        score += 10
    for bad, penalty in [
        ('mitochond', 120), ('chloroplast', 120), ('plastid', 120),
        ('ribosomal', 100), ('rrna', 100), ('16s', 100), ('18s', 100), ('28s', 100), ('its', 80),
    ]:
        if bad in title:
            score -= penalty
    return score


def ncbi_search_ids(term, retmax=20):
    q = urllib.parse.urlencode({'db': 'nuccore', 'retmode': 'json', 'retmax': str(retmax), 'term': term})
    url = f'{NCBI_ESEARCH}?{q}'
    data = json.loads(http_get(url).decode('utf-8', errors='ignore'))
    return data.get('esearchresult', {}).get('idlist', [])


def ncbi_summaries(ids):
    if not ids:
        return []
    q = urllib.parse.urlencode({'db': 'nuccore', 'retmode': 'json', 'id': ','.join(ids)})
    url = f'{NCBI_ESUMMARY}?{q}'
    data = json.loads(http_get(url).decode('utf-8', errors='ignore'))
    result = data.get('result', {})
    uids = result.get('uids', [])
    return [result[u] for u in uids if u in result]


def exact_species_filter(scientific_name, docsums):
    sn = (scientific_name or '').strip().lower()
    out = []
    for d in docsums:
        org = (d.get('organism') or '').strip().lower()
        title = (d.get('title') or '').strip().lower()
        if org == sn or title.startswith(sn + ' ') or f' {sn} ' in title:
            out.append(d)
    return out


def ncbi_best_record(scientific_name):
    terms = [
        f'{scientific_name}[Organism] AND biomol_genomic[prop] AND srcdb_refseq[prop]',
        f'{scientific_name}[Organism] AND biomol_genomic[prop]',
        f'{scientific_name}[Organism]',
    ]
    for term in terms:
        ids = ncbi_search_ids(term)
        if not ids:
            continue
        sums = ncbi_summaries(ids)
        if not sums:
            continue
        sums = exact_species_filter(scientific_name, sums)
        if not sums:
            continue
        sums = sorted(sums, key=score_docsum, reverse=True)
        best = sums[0]
        acc = best.get('accessionversion') or best.get('caption') or best.get('uid')
        if not acc:
            continue
        return {
            'search_term': term,
            'accession': acc,
            'title': best.get('title', ''),
            'organism': best.get('organism', ''),
        }
    return None


def ncbi_best_from_term(term):
    ids = ncbi_search_ids(term)
    if not ids:
        return None
    sums = ncbi_summaries(ids)
    if not sums:
        return None
    sums = sorted(sums, key=score_docsum, reverse=True)
    best = sums[0]
    acc = best.get('accessionversion') or best.get('caption') or best.get('uid')
    if not acc:
        return None
    return {
        'search_term': term,
        'accession': acc,
        'title': best.get('title', ''),
        'organism': best.get('organism', ''),
    }


def ncbi_genus_proxy_record(genus):
    if not genus:
        return None
    terms = [
        f'{genus}[Organism] AND biomol_genomic[prop] AND srcdb_refseq[prop]',
        f'{genus}[Organism] AND biomol_genomic[prop]',
        f'{genus}[Organism]',
    ]
    for term in terms:
        best = ncbi_best_from_term(term)
        if best:
            return best
    return None


def ncbi_fetch_first1000(accession):
    q = urllib.parse.urlencode({
        'db': 'nuccore',
        'id': accession,
        'rettype': 'fasta',
        'retmode': 'text',
        'seq_start': '1',
        'seq_stop': '1000',
    })
    url = f'{NCBI_EFETCH}?{q}'
    txt = http_get(url).decode('utf-8', errors='ignore')
    seq = ''.join(line.strip() for line in txt.splitlines() if line and not line.startswith('>'))
    return normalize_letters(seq)[:1000]


def load_report():
    if REPORT_PATH.exists():
        try:
            return json.loads(REPORT_PATH.read_text())
        except Exception:
            pass
    return {'runs': []}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--start', type=int, default=0, help='0-based index into missing-only list')
    ap.add_argument('--count', type=int, default=8, help='number of missing species to process in this run')
    ap.add_argument('--apply', action='store_true', help='write updates to organisms.json')
    ap.add_argument('--pad-n', action='store_true', help='pad short sequences with N to 1000')
    ap.add_argument('--allow-genus-proxy', action='store_true', help='allow fallback to genus-level proxy sequence')
    args = ap.parse_args()

    data = json.loads(ORGS_PATH.read_text())
    organisms = data.get('organisms', [])

    missing = [o for o in organisms if not (o.get('dna_sequence') or '').strip()]
    end = min(args.start + args.count, len(missing))
    subset = missing[args.start:end]

    run = {
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'start': args.start,
        'count': args.count,
        'processed': len(subset),
        'apply': args.apply,
        'pad_n': args.pad_n,
        'items': []
    }

    by_sci = {(o.get('scientific_name') or '').strip(): o for o in organisms}

    for i, org in enumerate(subset, start=1):
        sci = (org.get('scientific_name') or '').strip()
        print(f'[{i}/{len(subset)}] {sci}')
        item = {'card_label': org.get('card_label', ''), 'scientific_name': sci, 'status': None}

        if is_ambiguous_name(sci):
            if not args.allow_genus_proxy:
                item['status'] = 'skipped_ambiguous'
                run['items'].append(item)
                continue

        try:
            best = ncbi_best_record(sci)
            fallback_level = 'exact_species'
            proxy_scientific_name = None
            if not best:
                if args.allow_genus_proxy:
                    genus = (org.get('genus') or '').strip()
                    best = ncbi_genus_proxy_record(genus)
                    if best:
                        fallback_level = 'genus_proxy'
                        proxy_scientific_name = (best.get('organism') or '').strip()

            if not best:
                item['status'] = 'no_exact_ncbi_record'
                run['items'].append(item)
                time.sleep(0.6)
                continue

            seq = ncbi_fetch_first1000(best['accession'])
            if not seq:
                item['status'] = 'no_letters_from_fetch'
                item['accession'] = best['accession']
                run['items'].append(item)
                time.sleep(0.6)
                continue

            original_len = len(seq)
            if len(seq) < 1000 and args.pad_n:
                seq = seq + ('N' * (1000 - len(seq)))

            item.update({
                'status': 'candidate_ready' if len(seq) == 1000 else 'candidate_short',
                'accession': best['accession'],
                'fallback_level': fallback_level,
                'proxy_scientific_name': proxy_scientific_name,
                'fetched_len': original_len,
                'final_len': len(seq),
                'n_count': seq.count('N'),
            })

            if args.apply and len(seq) == 1000:
                target = by_sci.get(sci)
                if target is not None and not (target.get('dna_sequence') or '').strip():
                    target['dna_sequence'] = seq
                    item['applied'] = True
                else:
                    item['applied'] = False
            run['items'].append(item)

        except Exception as exc:
            item['status'] = 'error'
            item['error'] = str(exc)
            run['items'].append(item)

        time.sleep(0.8)

    if args.apply:
        ORGS_PATH.write_text(json.dumps(data, indent=2) + '\n')

    rep = load_report()
    rep['runs'].append(run)
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(rep, indent=2) + '\n')

    status_counts = {}
    for it in run['items']:
        s = it.get('status', 'unknown')
        status_counts[s] = status_counts.get(s, 0) + 1

    print('\nBatch complete')
    print('range', args.start, end - 1 if end > args.start else args.start)
    print('status_counts', status_counts)
    print('report', REPORT_PATH)


if __name__ == '__main__':
    main()
