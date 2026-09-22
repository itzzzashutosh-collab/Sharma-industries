import { NextRequest, NextResponse } from 'next/server';
import { queryCSV } from '@/lib/csvDataBridge';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const result = await queryCSV('verified-dealers', {
      page: Number(sp.get('page')) || 1,
      pageSize: Number(sp.get('pageSize')) || 50,
      search: sp.get('search') || '',
      filters: {
        city: sp.get('city') || '',
        business_type: sp.get('business_type') || '',
      },
      sortBy: sp.get('sortBy') || '',
      sortOrder: (sp.get('sortOrder') as 'asc' | 'desc') || 'asc',
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
