import { EvidenceItem, Source } from '../schemas/evidence.js';

export interface ParsedTable {
  headers: string[];
  rows: Record<string, any>[];
  rawRows: string[][];
  summaryStats: Record<string, { min: number; max: number; sum: number; count: number; avg: number }>;
}

export function parseCSVString(csvContent: string): ParsedTable {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    return { headers: [], rows: [], rawRows: [], summaryStats: {} };
  }

  // Handle commas or tabs or semicolons
  const delimiter = lines[0].includes('\t') ? '\t' : lines[0].includes(';') ? ';' : ',';
  const headers = lines[0].split(delimiter).map((h) => h.trim().replace(/^["']|["']$/g, ''));

  const rows: Record<string, any>[] = [];
  const rawRows: string[][] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ''));
    rawRows.push(rawCols);
    const rowObj: Record<string, any> = {};
    headers.forEach((header, colIndex) => {
      const val = rawCols[colIndex] ?? '';
      // Parse numeric values if clean
      const numericVal = val.replace(/[$,]/g, '');
      if (val !== '' && !isNaN(Number(numericVal))) {
        rowObj[header] = Number(numericVal);
      } else {
        rowObj[header] = val;
      }
    });
    rows.push(rowObj);
  }

  // Compute summary stats for numerical columns
  const summaryStats: Record<string, { min: number; max: number; sum: number; count: number; avg: number }> = {};
  headers.forEach((header) => {
    const numbers = rows.map((r) => r[header]).filter((v) => typeof v === 'number' && !isNaN(v));
    if (numbers.length > 0) {
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);
      const sum = numbers.reduce((acc, curr) => acc + curr, 0);
      const count = numbers.length;
      summaryStats[header] = {
        min,
        max,
        sum: Math.round(sum * 100) / 100,
        count,
        avg: Math.round((sum / count) * 100) / 100,
      };
    }
  });

  return { headers, rows, rawRows, summaryStats };
}

export function analyzeTable(source: Source): { evidenceList: EvidenceItem[]; parsedTable: ParsedTable } {
  const content = source.content || '';
  const parsedTable = parseCSVString(content);
  const evidenceList: EvidenceItem[] = [];

  // 1. Row-level structured evidence
  parsedTable.rows.forEach((row, rowIndex) => {
    // Determine entity name (e.g. from Model, Entity, Name, ID, or Product column)
    const entityKey = Object.keys(row).find((k) =>
      /^(model|product|drone|entity|device|unit|id|name|item)/i.test(k)
    );
    const entity = entityKey ? String(row[entityKey]) : `Row ${rowIndex + 1}`;

    Object.entries(row).forEach(([colHeader, val]) => {
      if (val === undefined || val === null || val === '') return;
      if (colHeader === entityKey) return; // Skip identity column itself

      evidenceList.push({
        id: `tab-ev-${source.id}-r${rowIndex + 1}-${colHeader.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        entity,
        claim: `${entity} ${colHeader} is recorded as ${val}`,
        value: val,
        unit: colHeader.includes('($') || colHeader.includes('(USD') || colHeader.includes('Revenue') ? 'USD' : undefined,
        sourceId: source.id,
        sourceFileName: source.fileName,
        sourceType: source.type,
        location: `Row ${rowIndex + 1}, Column '${colHeader}'`,
        extractionMethod: 'Deterministic Table Parser',
        confidence: 1.0,
        relationships: [entity, colHeader],
      });
    });
  });

  // 2. Aggregate deterministic calculations (Max, Min, Sum per column)
  Object.entries(parsedTable.summaryStats).forEach(([column, stats]) => {
    evidenceList.push({
      id: `tab-agg-${source.id}-max-${column.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      entity: `Table Aggregate (${column})`,
      claim: `Maximum ${column} in dataset is ${stats.max}`,
      value: stats.max,
      sourceId: source.id,
      sourceFileName: source.fileName,
      sourceType: source.type,
      location: `Computed Aggregate from ${parsedTable.rows.length} rows in '${column}'`,
      extractionMethod: 'Deterministic Mathematical Aggregate (Max)',
      confidence: 1.0,
      relationships: [column, 'aggregate_max'],
    });

    evidenceList.push({
      id: `tab-agg-${source.id}-sum-${column.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
      entity: `Table Aggregate (${column})`,
      claim: `Total sum of ${column} across all ${stats.count} recorded entries is ${stats.sum}`,
      value: stats.sum,
      sourceId: source.id,
      sourceFileName: source.fileName,
      sourceType: source.type,
      location: `Computed Aggregate from ${parsedTable.rows.length} rows in '${column}'`,
      extractionMethod: 'Deterministic Mathematical Aggregate (Sum)',
      confidence: 1.0,
      relationships: [column, 'aggregate_sum'],
    });
  });

  return { evidenceList, parsedTable };
}
