import { NextRequest, NextResponse } from 'next/server';
import { queryCSV } from '@/lib/csvDataBridge';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const result = await queryCSV('india-tenders', {
      page: Number(sp.get('page')) || 1,
      pageSize: Number(sp.get('pageSize')) || 50,
      search: sp.get('search') || '',
      filters: {
        status: sp.get('status') || '',
        work_type: sp.get('work_type') || '',
      },
      sortBy: sp.get('sortBy') || 'deadline',
      sortOrder: (sp.get('sortOrder') as 'asc' | 'desc') || 'asc',
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
