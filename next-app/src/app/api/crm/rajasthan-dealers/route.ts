import { NextRequest, NextResponse } from 'next/server';
import { queryCSV } from '@/lib/csvDataBridge';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const result = await queryCSV('rajasthan-dealers', {
      page: Number(sp.get('page')) || 1,
      pageSize: Number(sp.get('pageSize')) || 50,
      search: sp.get('search') || '',
      filters: {
        district: sp.get('district') || '',
        primary_category: sp.get('primary_category') || '',
      },
      sortBy: sp.get('sortBy') || '',
      sortOrder: (sp.get('sortOrder') as 'asc' | 'desc') || 'asc',
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
