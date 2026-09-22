import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import path from 'path';

// ─── Types ──────────────────────────────────────────────────────────────────
export interface CSVQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  filters?: Record<string, string>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CSVQueryResult {
  data: Record<string, string>[];
  headers: string[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── CSV Data Directory ─────────────────────────────────────────────────────
const DATA_DIR = path.join('D:', 'Sharma Industries', 'Jarvis Agent', 'data');

// ─── CSV File Map ───────────────────────────────────────────────────────────
export const CSV_FILES = {
  'india-dealers':        'india_dealers_master.csv',
  'india-architects':     'india_architects_master.csv',
  'india-builders':       'india_builders_master.csv',
  'india-designers':      'india_interior_designers_master.csv',
  'india-tenders':        'india_paint_tenders_master.csv',
  'rajasthan-dealers':    'rajasthan_dealers_master.csv',
  'rajasthan-builders':   'rajasthan_builders_master.csv',
  'verified-dealers':     'verified_dealers_directory.csv',
} as const;

export type CSVFileKey = keyof typeof CSV_FILES;

// ─── Stats Cache ────────────────────────────────────────────────────────────
const statsCache: Record<string, { count: number; timestamp: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// ─── Core CSV Reader ────────────────────────────────────────────────────────
export async function queryCSV(
  fileKey: CSVFileKey,
  params: CSVQueryParams = {}
): Promise<CSVQueryResult> {
  const {
    page = 1,
    pageSize = 50,
    search = '',
    filters = {},
    sortBy,
    sortOrder = 'asc',
  } = params;

  const filePath = path.join(DATA_DIR, CSV_FILES[fileKey]);
  const searchLower = search.toLowerCase().trim();
  const filterEntries = Object.entries(filters).filter(([, v]) => v && v.trim());

  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, { encoding: 'utf-8' });
    const rl = createInterface({ input: stream, crlfDelay: Infinity });

    let headers: string[] = [];
    let isFirstLine = true;
    const matchingRows: Record<string, string>[] = [];

    rl.on('line', (line: string) => {
      if (isFirstLine) {
        headers = parseCSVLine(line);
        isFirstLine = false;
        return;
      }

      const values = parseCSVLine(line);
      if (values.length !== headers.length) return;

      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = values[i] || ''; });

      // Apply filters
      let passesFilter = true;
      for (const [key, val] of filterEntries) {
        const rowVal = (row[key] || '').toLowerCase();
        if (!rowVal.includes(val.toLowerCase())) {
          passesFilter = false;
          break;
        }
      }
      if (!passesFilter) return;

      // Apply search
      if (searchLower) {
        const rowText = Object.values(row).join(' ').toLowerCase();
        if (!rowText.includes(searchLower)) return;
      }

      matchingRows.push(row);
    });

    rl.on('close', () => {
      // Sort if requested
      if (sortBy && headers.includes(sortBy)) {
        matchingRows.sort((a, b) => {
          const aVal = a[sortBy] || '';
          const bVal = b[sortBy] || '';
          const numA = Number(aVal);
          const numB = Number(bVal);
          if (!isNaN(numA) && !isNaN(numB)) {
            return sortOrder === 'asc' ? numA - numB : numB - numA;
          }
          return sortOrder === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        });
      }

      const total = matchingRows.length;
      const totalPages = Math.ceil(total / pageSize) || 1;
      const safePage = Math.max(1, Math.min(page, totalPages));
      const start = (safePage - 1) * pageSize;
      const data = matchingRows.slice(start, start + pageSize);

      resolve({ data, headers, total, page: safePage, pageSize, totalPages });
    });

    rl.on('error', reject);
    stream.on('error', reject);
  });
}

// ─── Count rows (cached) ───────────────────────────────────────────────────
export async function countCSVRows(fileKey: CSVFileKey): Promise<number> {
  const cached = statsCache[fileKey];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.count;
  }

  const filePath = path.join(DATA_DIR, CSV_FILES[fileKey]);

  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, { encoding: 'utf-8' });
    const rl = createInterface({ input: stream, crlfDelay: Infinity });
    let count = -1; // Skip header

    rl.on('line', () => { count++; });
    rl.on('close', () => {
      statsCache[fileKey] = { count, timestamp: Date.now() };
      resolve(count);
    });
    rl.on('error', reject);
    stream.on('error', reject);
  });
}

// ─── Get unique values for a column (for filter dropdowns) ──────────────────
export async function getUniqueValues(
  fileKey: CSVFileKey,
  column: string,
  limit: number = 100
): Promise<string[]> {
  const filePath = path.join(DATA_DIR, CSV_FILES[fileKey]);

  return new Promise((resolve, reject) => {
    const stream = createReadStream(filePath, { encoding: 'utf-8' });
    const rl = createInterface({ input: stream, crlfDelay: Infinity });

    let headers: string[] = [];
    let isFirstLine = true;
    const uniqueSet = new Set<string>();

    rl.on('line', (line: string) => {
      if (isFirstLine) {
        headers = parseCSVLine(line);
        isFirstLine = false;
        return;
      }

      const colIdx = headers.indexOf(column);
      if (colIdx === -1) return;

      const values = parseCSVLine(line);
      const val = (values[colIdx] || '').trim();
      if (val) uniqueSet.add(val);
    });

    rl.on('close', () => {
      const sorted = Array.from(uniqueSet).sort().slice(0, limit);
      resolve(sorted);
    });

    rl.on('error', reject);
    stream.on('error', reject);
  });
}

// ─── CSV Line Parser (handles quoted fields with commas) ────────────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  result.push(current.trim());
  return result;
}
