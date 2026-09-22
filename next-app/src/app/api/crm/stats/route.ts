import { NextResponse } from 'next/server';
import { countCSVRows, CSV_FILES, type CSVFileKey } from '@/lib/csvDataBridge';

export async function GET() {
  try {
    const keys = Object.keys(CSV_FILES) as CSVFileKey[];
    const counts = await Promise.all(keys.map(async (key) => {
      const count = await countCSVRows(key);
      return { key, count };
    }));

    const stats: Record<string, number> = {};
    for (const { key, count } of counts) {
      stats[key] = count;
    }

    return NextResponse.json({ success: true, stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
