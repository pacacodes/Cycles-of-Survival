#!/usr/bin/env python3

import argparse
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path('/workspaces/ELPACA')
ORGS_PATH = ROOT / 'game' / 'config' / 'organisms.json'
REPORT_PATH = ROOT / 'output' / 'dna-4000-batch-report.json'

NCBI_ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
NCBI_ESUMMARY = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
NCBI_EFETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
ENA_FASTA = 'https://www.ebi.ac.uk/ena/browser/api/fasta/{acc}?download=true'
WIKIPEDIA_SUMMARY = 'https://en.wikipedia.org/api/rest_v1/page/summary/{title}'
ENSEMBL_PAGE = 'https://www.ensembl.org/{species}/Info/Index'


def normalize_letters(seq):
    return re.sub(r'[^ACGTNacgtn]', '', seq or '').upper()


def is_ambiguous_name(name):
    n = (name or '').strip().lower()
    if not n:
        return True
    return bool(re.search(r'\bsp\.?\b', n) or 'incertae sedis' in n)


def read_json(path):
    return json.loads(path.read_text())


def write_json(path, payload):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + '\n')


def http_get(url, timeout=60, retries=5):
    delay = 1.2
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'ELPACA-DNA-4000/1.0'})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read(), resp.status
        except urllib.error.HTTPError as exc:
            if attempt == retries:
                raise
            if exc.code == 429 and exc.headers:
                retry_after = exc.headers.get('Retry-After')
                if retry_after and str(retry_after).isdigit():
                    delay = max(delay, float(retry_after))
            time.sleep(delay)
            delay *= 1.7
        except Exception:
            if attempt == retries:
                raise
            time.sleep(delay)
            delay *= 1.7


def http_get_json(url, timeout=60, retries=5):
    data, _ = http_get(url, timeout=timeout, retries=retries)
    return json.loads(data.decode('utf-8', errors='ignore'))


def parse_fasta_letters(fasta_text):
    seq = ''.join(line.strip() for line in fasta_text.splitlines() if line and not line.startswith('>'))
    return normalize_letters(seq)


def score_docsum(doc):
    title = str(doc.get('title', '')).lower()
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


def search_ncbi_ids(term, retmax=25):
    q = urllib.parse.urlencode({'db': 'nuccore', 'retmode': 'json', 'retmax': str(retmax), 'term': term})
    obj = http_get_json(f'{NCBI_ESEARCH}?{q}')
    return obj.get('esearchresult', {}).get('idlist', [])


def summarize_ncbi_ids(ids):
    if not ids:
        return []
    q = urllib.parse.urlencode({'db': 'nuccore', 'retmode': 'json', 'id': ','.join(ids)})
    obj = http_get_json(f'{NCBI_ESUMMARY}?{q}')
    result = obj.get('result', {})
    uids = result.get('uids', [])
    return [result[u] for u in uids if u in result]


def exact_species_filter(scientific_name, docs):
    sn = (scientific_name or '').strip().lower()
    out = []
    for d in docs:
        org = (d.get('organism') or '').strip().lower()
        title = (d.get('title') or '').strip().lower()
        if org == sn or title.startswith(sn + ' ') or f' {sn} ' in title:
            out.append(d)
    return out


def best_ncbi_record(scientific_name):
    terms = [
        f'{scientific_name}[Organism] AND biomol_genomic[prop] AND srcdb_refseq[prop]',
        f'{scientific_name}[Organism] AND biomol_genomic[prop]',
        f'{scientific_name}[Organism]',
    ]
    for term in terms:
        ids = search_ncbi_ids(term)
        if not ids:
            continue
        sums = summarize_ncbi_ids(ids)
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


def fetch_ncbi_prefix(accession, length):
    q = urllib.parse.urlencode({
        'db': 'nuccore',
        'id': accession,
        'rettype': 'fasta',
        'retmode': 'text',
        'seq_start': '1',
        'seq_stop': str(length),
    })
    data, _ = http_get(f'{NCBI_EFETCH}?{q}')
    letters = parse_fasta_letters(data.decode('utf-8', errors='ignore'))
    return letters[:length]


def fetch_ena_prefix(accession, length):
    candidates = [accession]
    if '.' in accession:
        candidates.append(accession.split('.')[0])

    for acc in candidates:
        try:
            data, _ = http_get(ENA_FASTA.format(acc=urllib.parse.quote(acc)), retries=3)
            letters = parse_fasta_letters(data.decode('utf-8', errors='ignore'))
            if letters:
                return {
                    'accession': acc,
                    'sequence': letters[:length],
                    'total_letters': len(letters),
                }
        except Exception:
            continue
    return {
        'accession': None,
        'sequence': '',
        'total_letters': 0,
    }


def check_wikipedia(scientific_name):
    title = scientific_name.replace(' ', '_')
    url = WIKIPEDIA_SUMMARY.format(title=urllib.parse.quote(title))
    try:
        obj = http_get_json(url, retries=2)
        if obj.get('type') == 'https://mediawiki.org/wiki/HyperSwitch/errors/not_found':
            return {'available': False, 'title': title}
        return {'available': True, 'title': obj.get('title', title), 'page': obj.get('content_urls', {}).get('desktop', {}).get('page', '')}
    except Exception:
        return {'available': False, 'title': title}


def check_ensembl(scientific_name):
    species_key = scientific_name.lower().replace(' ', '_')
    url = ENSEMBL_PAGE.format(species=urllib.parse.quote(species_key))
    try:
        _, status = http_get(url, retries=2, timeout=25)
        return {'available': 200 <= status < 400, 'species_key': species_key, 'url': url}
    except Exception:
        return {'available': False, 'species_key': species_key, 'url': url}


def load_report():
    if REPORT_PATH.exists():
        try:
            return read_json(REPORT_PATH)
        except Exception:
            pass
    return {'runs': []}


def collect_attempted_indexes(report):
    attempted = set()
    terminal_statuses = {
        'skipped_ambiguous',
        'no_ncbi_record',
        'insufficient_length',
    }
    for run in report.get('runs', []):
        for item in run.get('items', []):
            idx = item.get('organism_index')
            status = item.get('status')
            if isinstance(idx, int) and status in terminal_statuses:
                attempted.add(idx)
    return attempted


def sequence_quality_status(ncbi_seq, ena_seq, min_length):
    ncbi_ok = len(ncbi_seq) >= min_length
    ena_ok = len(ena_seq) >= min_length

    if ncbi_ok and ena_ok:
        return 'cross_source_match' if ncbi_seq == ena_seq else 'cross_source_mismatch'
    if ncbi_ok:
        return 'ncbi_only'
    if ena_ok:
        return 'ena_only'
    return 'insufficient_length'


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--start', type=int, default=0, help='0-based index in candidates list')
    ap.add_argument('--count', type=int, default=10, help='Number of organisms per batch')
    ap.add_argument('--min-length', type=int, default=4000, help='Minimum DNA letters to store')
    ap.add_argument('--sleep-ms', type=int, default=350, help='Delay between organisms')
    ap.add_argument('--apply', action='store_true', help='Write changes to organisms.json')
    ap.add_argument('--include-ambiguous', action='store_true', help='Attempt ambiguous species names')
    ap.add_argument('--skip-attempted', action='store_true', help='Skip indices already marked terminal in previous runs')
    args = ap.parse_args()

    data = read_json(ORGS_PATH)
    organisms = data.get('organisms', [])

    report = load_report()
    attempted = collect_attempted_indexes(report) if args.skip_attempted else set()

    candidates = []
    for idx, org in enumerate(organisms):
        dna = normalize_letters(org.get('dna_sequence') or '')
        if idx in attempted:
            continue
        if len(dna) < args.min_length:
            candidates.append((idx, org))

    end = min(args.start + args.count, len(candidates))
    subset = candidates[args.start:end]

    run = {
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'start': args.start,
        'count': args.count,
        'processed': len(subset),
        'apply': args.apply,
        'min_length': args.min_length,
        'items': [],
    }

    for n, (org_idx, org) in enumerate(subset, start=1):
        sci = (org.get('scientific_name') or '').strip()
        print(f'[{n}/{len(subset)}] idx={org_idx} {sci}')

        item = {
            'organism_index': org_idx,
            'card_label': org.get('card_label', ''),
            'scientific_name': sci,
            'status': None,
        }

        if is_ambiguous_name(sci) and not args.include_ambiguous:
            item['status'] = 'skipped_ambiguous'
            run['items'].append(item)
            continue

        try:
            ncbi = best_ncbi_record(sci)
            if not ncbi:
                item['status'] = 'no_ncbi_record'
                run['items'].append(item)
                time.sleep(args.sleep_ms / 1000.0)
                continue

            ncbi_seq = fetch_ncbi_prefix(ncbi['accession'], args.min_length)
            ena = fetch_ena_prefix(ncbi['accession'], args.min_length)
            ena_seq = ena['sequence']
            wiki = check_wikipedia(sci)
            ensembl = check_ensembl(sci)

            verification = sequence_quality_status(ncbi_seq, ena_seq, args.min_length)
            chosen = ''
            source = ''

            if verification == 'cross_source_match':
                chosen = ncbi_seq
                source = 'NCBI+ENA'
            elif verification in ('ncbi_only', 'cross_source_mismatch'):
                chosen = ncbi_seq
                source = 'NCBI'
            elif verification == 'ena_only':
                chosen = ena_seq
                source = 'ENA'

            item.update({
                'status': verification,
                'ncbi_accession': ncbi['accession'],
                'ncbi_title': ncbi['title'],
                'ncbi_len': len(ncbi_seq),
                'ena_accession': ena['accession'],
                'ena_len': len(ena_seq),
                'wiki_available': wiki['available'],
                'wiki_title': wiki.get('title', ''),
                'ensembl_available': ensembl['available'],
            })

            if args.apply and len(chosen) >= args.min_length:
                org['dna_sequence'] = chosen
                org['dna_source'] = {
                    'sequence_source': source,
                    'ncbi_accession': ncbi['accession'],
                    'ena_accession': ena['accession'],
                    'verification': verification,
                    'wikipedia_available': wiki['available'],
                    'wikipedia_title': wiki.get('title', ''),
                    'wikipedia_url': wiki.get('page', ''),
                    'ensembl_available': ensembl['available'],
                    'ensembl_url': ensembl['url'],
                    'length': len(chosen),
                    'updated_utc': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
                }
                item['applied'] = True
            else:
                item['applied'] = False

        except Exception as exc:
            item['status'] = 'error'
            item['error'] = str(exc)

        run['items'].append(item)
        time.sleep(args.sleep_ms / 1000.0)

    if args.apply:
        write_json(ORGS_PATH, data)

    report['runs'].append(run)
    write_json(REPORT_PATH, report)

    status_counts = {}
    for it in run['items']:
        status = it.get('status', 'unknown')
        status_counts[status] = status_counts.get(status, 0) + 1

    print('\nBatch complete')
    print(f'Candidate range: {args.start}..{max(args.start, end - 1)}')
    print('Status counts:', status_counts)
    print(f'Report: {REPORT_PATH}')


if __name__ == '__main__':
    main()
