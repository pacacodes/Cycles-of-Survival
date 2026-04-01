#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const zlib = require('zlib');

const INPUT_PATH = path.resolve(process.cwd(), 'game/config/organisms.json');
const OUTPUT_PATH = path.resolve(process.cwd(), 'game/config/organisms.json');
const REPORT_PATH = path.resolve(process.cwd(), 'output/dna-fetch-report.json');
const ENA_SEARCH_URL = 'https://www.ebi.ac.uk/ena/portal/api/search';
const ENA_FASTA_URL = 'https://www.ebi.ac.uk/ena/browser/api/fasta';
const NCBI_ESEARCH_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const NCBI_ESUMMARY_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
const WIKIPEDIA_SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const TARGET_BASES = 4000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetries(fn, options = {}) {
  const maxAttempts = options.maxAttempts || 5;
  const initialDelayMs = options.initialDelayMs || 1200;
  let delayMs = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const msg = String(err && err.message ? err.message : err);
      const retriable = /HTTP 429|HTTP 5\d\d|ECONNRESET|ETIMEDOUT|ENOTFOUND/i.test(msg);
      if (!retriable || attempt === maxAttempts) {
        throw err;
      }
      await sleep(delayMs);
      delayMs *= 1.7;
    }
  }
}

function getJson(url) {
  return getText(url).then((text) => JSON.parse(text));
}

function getText(url) {
  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        {
          headers: {
            'User-Agent': 'Cycles-of-Survival-DNA-Fetcher/2.0',
            'Accept-Encoding': 'gzip,deflate'
          }
        },
        (res) => {
        const chunks = [];
        res.on('data', (chunk) => {
          chunks.push(chunk);
        });
        res.on('end', () => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`HTTP ${res.statusCode} for ${url}`));
            return;
          }

          const raw = Buffer.concat(chunks);
          const contentEncoding = String(res.headers['content-encoding'] || '').toLowerCase();

          try {
            const decoded = maybeDecompress(raw, contentEncoding);
            resolve(decoded.toString('utf8'));
          } catch (err) {
            reject(new Error(`Failed to decode response from ${url}: ${err.message}`));
          }
        });
        }
      )
      .on('error', reject);
  });
}

function maybeDecompress(buffer, contentEncoding) {
  if (!buffer || !buffer.length) return buffer;

  if (contentEncoding.includes('gzip')) {
    return zlib.gunzipSync(buffer);
  }

  if (contentEncoding.includes('deflate')) {
    return zlib.inflateSync(buffer);
  }

  const isGzipMagic = buffer.length > 2 && buffer[0] === 0x1f && buffer[1] === 0x8b;
  if (isGzipMagic) {
    return zlib.gunzipSync(buffer);
  }

  return buffer;
}

function isAmbiguousScientificName(name) {
  if (!name) return true;
  const n = name.trim().toLowerCase();
  return /\bsp\.?\b/.test(n) || /incertae sedis/.test(n);
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isExactSpeciesMatch(scientificName, docsum) {
  const species = normalizeText(scientificName);
  if (!species) return false;

  const fields = [
    normalizeText(docsum.scientific_name || ''),
    normalizeText(docsum.description || '')
  ];

  return fields.some((field) => {
    if (!field) return false;
    return field === species || field.startsWith(`${species} `) || field.includes(` ${species} `);
  });
}

function scoreDocsum(docsum) {
  const title = String(docsum.description || '').toLowerCase();
  let score = 0;

  // ENA "result=sequence" maps to Sequence (standard) entries.
  if (title.includes('complete genome')) score += 80;
  if (title.includes('chromosome')) score += 20;
  if (title.includes('genome')) score += 10;

  if (title.includes('mitochond')) score -= 120;
  if (title.includes('chloroplast')) score -= 120;
  if (title.includes('plastid')) score -= 120;
  if (title.includes('ribosomal')) score -= 100;
  if (title.includes('rrna')) score -= 100;
  if (title.includes('16s')) score -= 100;
  if (title.includes('28s')) score -= 100;
  if (title.includes('its region')) score -= 100;
  if (title.includes('amplicon')) score -= 120;

  const seqLen = Number(docsum.base_count || 0);
  if (seqLen >= TARGET_BASES) score += 40;
  if (seqLen >= 100000) score += 10;

  return score;
}

function tieBreakCandidate(a, b) {
  const aTitle = String(a.description || '').toLowerCase();
  const bTitle = String(b.description || '').toLowerCase();
  const aHasStrain = aTitle.includes('strain');
  const bHasStrain = bTitle.includes('strain');

  // Only prefer explicit strain labels as a final disambiguation step.
  if (aHasStrain !== bHasStrain) {
    return aHasStrain ? -1 : 1;
  }

  const aLen = Number(a.base_count || 0);
  const bLen = Number(b.base_count || 0);
  return bLen - aLen;
}

async function searchEnaSequenceRecords(scientificName) {
  const normalized = scientificName.replace(/\s+/g, ' ').trim();
  const query = `scientific_name="${normalized}" OR description="${normalized}"`;
  const fields = [
    'accession',
    'scientific_name',
    'description',
    'base_count',
    'tax_id'
  ].join(',');

  const url = `${ENA_SEARCH_URL}?result=sequence&query=${encodeURIComponent(query)}&fields=${encodeURIComponent(fields)}&format=json&limit=50`;
  const rows = await withRetries(() => getJson(url));
  if (!Array.isArray(rows)) return [];
  return rows;
}

function parseFastaToSequence(text) {
  const lines = String(text || '').split(/\r?\n/);
  const seq = lines
    .filter((line) => line && !line.startsWith('>'))
    .join('')
    .replace(/[^A-Za-z]/g, '')
    .toUpperCase();
  return seq;
}

async function fetchSequenceLetters(accession) {
  const url = `${ENA_FASTA_URL}/${encodeURIComponent(accession)}?download=true`;
  const text = await withRetries(() => getText(url));
  return parseFastaToSequence(text);
}

async function findBestRecord(scientificName) {
  const records = await searchEnaSequenceRecords(scientificName);
  if (!records.length) return null;

  const exactMatches = records.filter((r) => isExactSpeciesMatch(scientificName, r));
  const candidates = exactMatches.length ? exactMatches : records;
  const sorted = candidates
    .map((d) => ({ doc: d, score: scoreDocsum(d) }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return tieBreakCandidate(a.doc, b.doc);
    });

  const best = sorted[0] && sorted[0].doc;
  if (!best || !best.accession) return null;

  return {
    accession: best.accession,
    scientific_name: best.scientific_name || '',
    title: best.description || '',
    sequence_length: Number(best.base_count || 0)
  };
}

async function findNcbiAccession(scientificName) {
  const term = `${scientificName}[Organism] AND biomol_genomic[prop]`;
  const searchUrl = `${NCBI_ESEARCH_URL}?db=nuccore&retmode=json&retmax=5&term=${encodeURIComponent(term)}`;
  const searchJson = await withRetries(() => getJson(searchUrl));
  const ids = (searchJson && searchJson.esearchresult && searchJson.esearchresult.idlist) || [];
  if (!ids.length) return null;

  const summaryUrl = `${NCBI_ESUMMARY_URL}?db=nuccore&retmode=json&id=${ids.join(',')}`;
  const summaryJson = await withRetries(() => getJson(summaryUrl));
  const result = summaryJson && summaryJson.result ? summaryJson.result : {};
  const uids = Array.isArray(result.uids) ? result.uids : [];

  for (const uid of uids) {
    const rec = result[uid] || {};
    const candidate = rec.accessionversion || rec.caption || '';
    const organism = normalizeText(rec.organism || '');
    if (candidate && (!organism || organism.includes(normalizeText(scientificName)))) {
      return candidate;
    }
  }

  return null;
}

function scientificNameToSlug(scientificName) {
  return String(scientificName || '').trim().replace(/\s+/g, '_');
}

async function findWikipediaInfo(scientificName) {
  const raw = String(scientificName || '').trim();
  const slug = scientificNameToSlug(raw);
  const candidates = [raw, slug];

  for (const title of candidates) {
    if (!title) continue;
    const url = `${WIKIPEDIA_SUMMARY_URL}/${encodeURIComponent(title)}`;
    try {
      const json = await withRetries(() => getJson(url), { maxAttempts: 2, initialDelayMs: 600 });
      if (json && !json.type) {
        const pageTitle = json.title || raw;
        const pageSlug = scientificNameToSlug(pageTitle);
        return {
          wikipedia_available: true,
          wikipedia_title: pageTitle,
          wikipedia_url: `https://en.wikipedia.org/wiki/${encodeURIComponent(pageSlug)}`
        };
      }
    } catch (_) {
      // Ignore lookup failures and fall back to defaults below.
    }
  }

  return {
    wikipedia_available: false,
    wikipedia_title: raw,
    wikipedia_url: `https://en.wikipedia.org/wiki/${encodeURIComponent(slug)}`
  };
}

function buildEnsemblInfo(scientificName) {
  const slug = String(scientificName || '').trim().toLowerCase().replace(/\s+/g, '_');
  return {
    ensembl_available: false,
    ensembl_url: `https://www.ensembl.org/${slug}/Info/Index`
  };
}

function withDefaultDnaSource(dnaSource) {
  const base = dnaSource && typeof dnaSource === 'object' ? { ...dnaSource } : {};
  return {
    sequence_source: base.sequence_source || null,
    ncbi_accession: base.ncbi_accession || null,
    ena_accession: base.ena_accession || null,
    verification: base.verification || null,
    wikipedia_available: typeof base.wikipedia_available === 'boolean' ? base.wikipedia_available : false,
    wikipedia_title: base.wikipedia_title || null,
    wikipedia_url: base.wikipedia_url || null,
    ensembl_available: typeof base.ensembl_available === 'boolean' ? base.ensembl_available : false,
    ensembl_url: base.ensembl_url || null,
    length: Number(base.length || 0),
    updated_utc: base.updated_utc || null
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--write');
  const onlyMissing = !args.includes('--all');

  const raw = fs.readFileSync(INPUT_PATH, 'utf8');
  const data = JSON.parse(raw);
  const organisms = data.organisms || [];

  const report = {
    timestamp: new Date().toISOString(),
    dryRun,
    source: 'ENA sequence (standard)',
    targetBases: TARGET_BASES,
    onlyMissing,
    total: organisms.length,
    considered: 0,
    updated: 0,
    skippedExisting: [],
    skippedAmbiguous: [],
    failed: [],
    records: []
  };

  for (let i = 0; i < organisms.length; i++) {
    const org = organisms[i];
    const scientificName = (org.scientific_name || '').trim();
    const existingDna = String(org.dna_sequence || '').replace(/[^A-Za-z]/g, '').toUpperCase();

    process.stdout.write(`[${i + 1}/${organisms.length}] ${scientificName || '(missing scientific_name)'} ... `);

    if (onlyMissing && existingDna && existingDna.length >= TARGET_BASES) {
      report.skippedExisting.push({
        index: i,
        card_label: org.card_label || '',
        scientific_name: scientificName,
        reason: `Existing dna_sequence already has >= ${TARGET_BASES} bases`
      });
      console.log('skipped (already populated)');
      continue;
    }

    if (!scientificName || isAmbiguousScientificName(scientificName)) {
      report.skippedAmbiguous.push({
        index: i,
        card_label: org.card_label || '',
        scientific_name: scientificName,
        reason: 'Ambiguous scientific name (e.g., sp.)'
      });
      console.log('skipped (ambiguous)');
      continue;
    }

    report.considered += 1;

    try {
      const best = await findBestRecord(scientificName);
      if (!best) {
        report.failed.push({
          index: i,
          card_label: org.card_label || '',
          scientific_name: scientificName,
          reason: 'No ENA sequence-standard record found'
        });
        console.log('failed (no record)');
        await sleep(350);
        continue;
      }

      const fullSeq = await fetchSequenceLetters(best.accession);
      if (!fullSeq || fullSeq.length < TARGET_BASES) {
        report.failed.push({
          index: i,
          card_label: org.card_label || '',
          scientific_name: scientificName,
          reason: `Sequence too short or missing (length=${fullSeq ? fullSeq.length : 0})`,
          accession: best.accession,
          title: best.title
        });
        console.log('failed (short/missing sequence)');
        await sleep(350);
        continue;
      }

      const [ncbiAccession, wikiInfo] = await Promise.all([
        findNcbiAccession(scientificName).catch(() => null),
        findWikipediaInfo(scientificName)
      ]);

      const ensemblInfo = buildEnsemblInfo(scientificName);
      const first4000 = fullSeq.slice(0, TARGET_BASES);
      if (!dryRun) {
        org.dna_sequence = first4000;

        const dnaSource = withDefaultDnaSource(org.dna_source);
        dnaSource.sequence_source = 'ENA';
        dnaSource.ncbi_accession = ncbiAccession || dnaSource.ncbi_accession || null;
        dnaSource.ena_accession = best.accession;
        dnaSource.verification = dnaSource.ncbi_accession ? 'ena_ncbi_crossref' : 'ena_only';
        dnaSource.wikipedia_available = wikiInfo.wikipedia_available;
        dnaSource.wikipedia_title = wikiInfo.wikipedia_title;
        dnaSource.wikipedia_url = wikiInfo.wikipedia_url;
        dnaSource.ensembl_available = ensemblInfo.ensembl_available;
        dnaSource.ensembl_url = ensemblInfo.ensembl_url;
        dnaSource.length = TARGET_BASES;
        dnaSource.updated_utc = new Date().toISOString();
        org.dna_source = dnaSource;
      }

      report.updated += 1;
      report.records.push({
        index: i,
        card_label: org.card_label || '',
        scientific_name: scientificName,
        accession: best.accession,
        ncbiAccession: ncbiAccession || null,
        title: best.title,
        enaScientificName: best.scientific_name,
        enaLength: best.sequence_length,
        wikipediaAvailable: wikiInfo.wikipedia_available,
        ensemblUrl: ensemblInfo.ensembl_url,
        dnaPreview: first4000.slice(0, 40),
        dnaLength: first4000.length
      });

      console.log(`ok (${best.accession})`);
    } catch (err) {
      report.failed.push({
        index: i,
        card_label: org.card_label || '',
        scientific_name: scientificName,
        reason: err.message
      });
      console.log(`failed (${err.message})`);
    }

    await sleep(1200);
  }

  if (!dryRun) {
    fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log('\nDone.');
  console.log(`Dry run: ${dryRun}`);
  console.log(`Only missing: ${onlyMissing}`);
  console.log(`Considered: ${report.considered}/${report.total}`);
  console.log(`Updated: ${report.updated}/${report.considered || report.total}`);
  console.log(`Skipped existing: ${report.skippedExisting.length}`);
  console.log(`Skipped ambiguous: ${report.skippedAmbiguous.length}`);
  console.log(`Failed: ${report.failed.length}`);
  console.log(`Report: ${REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
