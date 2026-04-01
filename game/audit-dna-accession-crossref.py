#!/usr/bin/env python3

import json
import re
import time
import gzip
import urllib.request
import urllib.parse
from pathlib import Path

ROOT = Path('/workspaces/ELPACA')
ORGS_PATH = ROOT / 'game' / 'config' / 'organisms.json'
OUT_PATH = ROOT / 'output' / 'dna-accession-crossref.json'

NCBI_ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
NCBI_ESUMMARY = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
NCBI_EFETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
ENA_FASTA = 'https://www.ebi.ac.uk/ena/browser/api/fasta/{acc}?download=true'


def sleep(ms):
    time.sleep(ms / 1000.0)


def http_get(url, timeout=60, retries=5):
    delay = 1.2
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'ELPACA-DNA-Audit/1.0'})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = resp.read()
                return data, (resp.headers.get('Content-Encoding') or '').lower()
        except Exception:
            if attempt == retries:
                raise
            time.sleep(delay)
            delay *= 1.7


def maybe_gunzip(data, encoding=''):
    if encoding == 'gzip' or (len(data) >= 2 and data[0] == 0x1F and data[1] == 0x8B):
        try:
            return gzip.decompress(data)
        except Exception:
            return data
    return data


def normalize_letters(s):
    return re.sub(r'[^A-Za-z]', '', s or '').upper()


def parse_fasta_letters(payload_bytes, encoding=''):
    text = maybe_gunzip(payload_bytes, encoding).decode('utf-8', errors='ignore')
    seq = ''.join(line.strip() for line in text.splitlines() if line and not line.startswith('>'))
    return normalize_letters(seq)


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
        ('ribosomal', 100), ('rrna', 100), ('16s', 100), ('18s', 100), ('28s', 100),
        ('its region', 80),
    ]:
        if bad in title:
            score -= penalty
    return score


def ncbi_search_ids(term, retmax=20):
    q = urllib.parse.urlencode({
        'db': 'nuccore',
        'retmode': 'json',
        'retmax': str(retmax),
        'term': term,
    })
    url = f'{NCBI_ESEARCH}?{q}'
    data, _ = http_get(url)
    obj = json.loads(data.decode('utf-8', errors='ignore'))
    return obj.get('esearchresult', {}).get('idlist', [])


def ncbi_summaries(ids):
    if not ids:
        return []
    q = urllib.parse.urlencode({
        'db': 'nuccore',
        'retmode': 'json',
        'id': ','.join(ids),
    })
    url = f'{NCBI_ESUMMARY}?{q}'
    data, _ = http_get(url)
    obj = json.loads(data.decode('utf-8', errors='ignore'))
    result = obj.get('result', {})
    uids = result.get('uids', [])
    return [result[u] for u in uids if u in result]


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

        sn = scientific_name.strip().lower()
        exact = []
        for d in sums:
            org = (d.get('organism') or '').strip().lower()
            title = (d.get('title') or '').strip().lower()
            if org == sn or title.startswith(sn + ' ') or f' {sn} ' in title:
                exact.append(d)
        candidates = exact if exact else sums
        candidates = sorted(candidates, key=score_docsum, reverse=True)
        if not candidates:
            continue
        best = candidates[0]
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


def ncbi_first1000(accession):
    q = urllib.parse.urlencode({
        'db': 'nuccore',
        'id': accession,
        'rettype': 'fasta',
        'retmode': 'text',
        'seq_start': '1',
        'seq_stop': '1000',
    })
    url = f'{NCBI_EFETCH}?{q}'
    data, enc = http_get(url)
    letters = parse_fasta_letters(data, enc)
    return letters[:1000], len(letters)


def ena_fetch_first1000(accession):
    variants = [accession]
    if '.' in accession:
        variants.append(accession.split('.')[0])

    for acc in variants:
        url = ENA_FASTA.format(acc=urllib.parse.quote(acc))
        try:
            data, enc = http_get(url, timeout=45, retries=2)
            letters = parse_fasta_letters(data, enc)
            if letters:
                return {
                    'available': True,
                    'accession_used': acc,
                    'first1000': letters[:1000],
                    'letters_total': len(letters),
                }
        except Exception:
            pass
    return {
        'available': False,
        'accession_used': None,
        'first1000': '',
        'letters_total': 0,
    }


def main():
    data = json.loads(ORGS_PATH.read_text())
    orgs = data.get('organisms', [])

    report = {
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'total': len(orgs),
        'items': [],
        'summary': {},
    }

    for idx, org in enumerate(orgs, start=1):
        sci = (org.get('scientific_name') or '').strip()
        stored = normalize_letters(org.get('dna_sequence') or '')
        print(f'[{idx}/{len(orgs)}] {sci}')

        item = {
            'card_label': org.get('card_label', ''),
            'scientific_name': sci,
            'stored_len': len(stored),
            'stored_has_dna': bool(stored),
            'ambiguous_name': is_ambiguous_name(sci),
            'ncbi': None,
            'ena': None,
            'status': None,
        }

        try:
            if item['ambiguous_name']:
                item['status'] = 'ambiguous_name'
                report['items'].append(item)
                sleep(250)
                continue

            best = ncbi_best_record(sci)
            if not best:
                item['status'] = 'no_ncbi_record'
                report['items'].append(item)
                sleep(250)
                continue

            ncbi_1000, ncbi_len = ncbi_first1000(best['accession'])
            item['ncbi'] = {
                'accession': best['accession'],
                'title': best['title'],
                'organism': best['organism'],
                'search_term': best['search_term'],
                'letters_first_fetch': ncbi_len,
                'first1000_len': len(ncbi_1000),
            }

            ena = ena_fetch_first1000(best['accession'])
            item['ena'] = {
                'available': ena['available'],
                'accession_used': ena['accession_used'],
                'letters_total': ena['letters_total'],
                'first1000_len': len(ena['first1000']),
            }

            if stored:
                if len(ncbi_1000) < 1000:
                    item['status'] = 'stored_present_ncbi_short'
                elif stored == ncbi_1000:
                    item['status'] = 'stored_matches_ncbi'
                else:
                    item['status'] = 'stored_differs_from_ncbi'
            else:
                if len(ncbi_1000) >= 1000:
                    item['status'] = 'blank_but_ncbi_available'
                else:
                    item['status'] = 'blank_ncbi_short'

            if item['ena']['available']:
                if len(ena['first1000']) >= 1000 and len(ncbi_1000) >= 1000:
                    item['ena_vs_ncbi_first1000_match'] = (ena['first1000'] == ncbi_1000)
                else:
                    item['ena_vs_ncbi_first1000_match'] = None
            else:
                item['ena_vs_ncbi_first1000_match'] = None

        except Exception as exc:
            item['status'] = 'error'
            item['error'] = str(exc)

        report['items'].append(item)
        sleep(300)

    counts = {}
    for it in report['items']:
        st = it.get('status') or 'unknown'
        counts[st] = counts.get(st, 0) + 1

    report['summary'] = {
        'status_counts': counts,
        'ena_available_count': sum(1 for x in report['items'] if (x.get('ena') or {}).get('available')),
        'blank_with_ncbi_available': sum(1 for x in report['items'] if x.get('status') == 'blank_but_ncbi_available'),
        'stored_differs_from_ncbi': sum(1 for x in report['items'] if x.get('status') == 'stored_differs_from_ncbi'),
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(report, indent=2) + '\n')

    print('\nAudit complete')
    print(json.dumps(report['summary'], indent=2))
    print(f'Report: {OUT_PATH}')


if __name__ == '__main__':
    main()
