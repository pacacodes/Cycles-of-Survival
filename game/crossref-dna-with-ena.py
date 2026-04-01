#!/usr/bin/env python3

import json
import re
import time
import gzip
import io
from pathlib import Path
from urllib.parse import quote
import urllib.request
import urllib.error

ROOT = Path('/workspaces/ELPACA')
ORGS_PATH = ROOT / 'game' / 'config' / 'organisms.json'
OUT_REPORT = ROOT / 'output' / 'ena-crossref-report.json'

ENA_SEARCH = 'https://www.ebi.ac.uk/ena/portal/api/search'
ENA_FASTA = 'https://www.ebi.ac.uk/ena/browser/api/fasta/{accession}?download=true'


def http_get(url, timeout=60, retries=4, backoff=1.6):
    delay = 1.2
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'ELPACA-ENA-Crossref/1.0'})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                data = resp.read()
                encoding = (resp.headers.get('Content-Encoding') or '').lower()
                ctype = (resp.headers.get('Content-Type') or '').lower()
                return data, encoding, ctype
        except Exception as exc:
            if attempt == retries:
                raise
            time.sleep(delay)
            delay *= backoff


def maybe_decompress(data, encoding_hint=''):
    # ENA sometimes returns gzip payload without content-encoding header.
    if encoding_hint == 'gzip' or (len(data) >= 2 and data[0] == 0x1F and data[1] == 0x8B):
        try:
            return gzip.decompress(data)
        except Exception:
            return data
    return data


def normalize_letters(seq):
    return re.sub(r'[^A-Za-z]', '', seq or '').upper()


def parse_fasta_letters(raw_bytes, encoding_hint=''):
    payload = maybe_decompress(raw_bytes, encoding_hint)
    text = payload.decode('utf-8', errors='ignore')
    lines = [ln.strip() for ln in text.splitlines() if ln.strip() and not ln.startswith('>')]
    return normalize_letters(''.join(lines))


def ena_search_exact_species(scientific_name, limit=20):
    # exact quoted scientific_name in ENA portal search
    query = f'scientific_name="{scientific_name}"'
    fields = 'accession,scientific_name,description,sequence_length,tax_id'
    url = (
        f"{ENA_SEARCH}?result=sequence&query={quote(query)}&fields={quote(fields)}"
        f"&format=json&limit={limit}"
    )
    data, _, _ = http_get(url)
    text = data.decode('utf-8', errors='ignore').strip()
    if not text:
        return []
    try:
        rows = json.loads(text)
        if isinstance(rows, list):
            return rows
        return []
    except Exception:
        return []


def score_record(rec):
    desc = (rec.get('description') or '').lower()
    score = 0
    if 'complete genome' in desc:
        score += 80
    if 'chromosome' in desc:
        score += 20
    if 'genome' in desc:
        score += 10

    # penalize organelles/amplicons/markers for whole-genome intent
    for bad, penalty in [
        ('mitochond', 120), ('chloroplast', 120), ('plastid', 120),
        ('ribosomal', 100), ('rrna', 100), ('16s', 100), ('18s', 100),
        ('28s', 100), ('its', 80), ('amplicon', 80)
    ]:
        if bad in desc:
            score -= penalty

    try:
        slen = int(rec.get('sequence_length') or 0)
    except Exception:
        slen = 0

    if slen >= 1000:
        score += 20
    if slen >= 100000:
        score += 10

    return score


def pick_best_record(records, scientific_name):
    if not records:
        return None
    snorm = (scientific_name or '').strip().lower()
    exact = [r for r in records if (r.get('scientific_name') or '').strip().lower() == snorm]
    candidates = exact if exact else records
    candidates = sorted(candidates, key=score_record, reverse=True)
    return candidates[0] if candidates else None


def fetch_first1000_from_accession(accession):
    url = ENA_FASTA.format(accession=quote(accession))
    data, enc, _ = http_get(url)
    letters = parse_fasta_letters(data, enc)
    return letters[:1000], len(letters)


def main():
    data = json.loads(ORGS_PATH.read_text())
    orgs = data.get('organisms', [])

    filled = [o for o in orgs if (o.get('dna_sequence') or '').strip()]
    blank = [o for o in orgs if not (o.get('dna_sequence') or '').strip()]

    report = {
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'source': 'ENA Browser/Portal',
        'filled_count': len(filled),
        'blank_count': len(blank),
        'filled_audit': [],
        'blank_availability': [],
        'summary': {}
    }

    for idx, org in enumerate(filled, 1):
        sci = (org.get('scientific_name') or '').strip()
        dna = normalize_letters(org.get('dna_sequence') or '')
        print(f"[filled {idx}/{len(filled)}] {sci}")

        item = {
            'card_label': org.get('card_label', ''),
            'scientific_name': sci,
            'status': 'unknown'
        }

        try:
            records = ena_search_exact_species(sci)
            if not records:
                item['status'] = 'no_ena_record'
                report['filled_audit'].append(item)
                time.sleep(0.25)
                continue

            best = pick_best_record(records, sci)
            if not best:
                item['status'] = 'no_ena_record'
                report['filled_audit'].append(item)
                time.sleep(0.25)
                continue

            acc = best.get('accession', '')
            first1000, total_letters = fetch_first1000_from_accession(acc)

            item.update({
                'ena_accession': acc,
                'ena_scientific_name': best.get('scientific_name', ''),
                'ena_description': best.get('description', ''),
                'ena_sequence_letters': total_letters,
                'stored_dna_len': len(dna),
            })

            if len(first1000) < 1000:
                item['status'] = 'ena_sequence_short'
            elif first1000 == dna:
                item['status'] = 'exact_first1000_match'
            else:
                item['status'] = 'species_found_but_sequence_diff'

            report['filled_audit'].append(item)
        except Exception as exc:
            item['status'] = 'error'
            item['error'] = str(exc)
            report['filled_audit'].append(item)

        time.sleep(0.25)

    for idx, org in enumerate(blank, 1):
        sci = (org.get('scientific_name') or '').strip()
        print(f"[blank {idx}/{len(blank)}] {sci}")
        item = {
            'card_label': org.get('card_label', ''),
            'scientific_name': sci,
            'available_on_ena': False,
            'status': 'unknown'
        }

        try:
            records = ena_search_exact_species(sci)
            if not records:
                item['status'] = 'no_ena_record'
                report['blank_availability'].append(item)
                time.sleep(0.25)
                continue

            best = pick_best_record(records, sci)
            if not best:
                item['status'] = 'no_ena_record'
                report['blank_availability'].append(item)
                time.sleep(0.25)
                continue

            acc = best.get('accession', '')
            first1000, total_letters = fetch_first1000_from_accession(acc)
            item.update({
                'ena_accession': acc,
                'ena_scientific_name': best.get('scientific_name', ''),
                'ena_description': best.get('description', ''),
                'ena_sequence_letters': total_letters,
            })

            if len(first1000) >= 1000:
                item['available_on_ena'] = True
                item['status'] = 'ena_sequence_available'
                item['candidate_first1000_preview'] = first1000[:60]
            else:
                item['status'] = 'ena_sequence_short'

            report['blank_availability'].append(item)
        except Exception as exc:
            item['status'] = 'error'
            item['error'] = str(exc)
            report['blank_availability'].append(item)

        time.sleep(0.25)

    def count_status(items):
        out = {}
        for it in items:
            s = it.get('status', 'unknown')
            out[s] = out.get(s, 0) + 1
        return out

    report['summary'] = {
        'filled_status_counts': count_status(report['filled_audit']),
        'blank_status_counts': count_status(report['blank_availability']),
        'blank_available_count': sum(1 for x in report['blank_availability'] if x.get('available_on_ena')),
    }

    OUT_REPORT.parent.mkdir(parents=True, exist_ok=True)
    OUT_REPORT.write_text(json.dumps(report, indent=2) + '\n')

    print('\nENA cross-reference complete')
    print(json.dumps(report['summary'], indent=2))
    print(f'Report: {OUT_REPORT}')


if __name__ == '__main__':
    main()
