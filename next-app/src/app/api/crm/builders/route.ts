import { NextRequest, NextResponse } from 'next/server';
import { queryCSV } from '@/lib/csvDataBridge';

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const result = await queryCSV('india-builders', {
      page: Number(sp.get('page')) || 1,
      pageSize: Number(sp.get('pageSize')) || 50,
      search: sp.get('search') || '',
      filters: {
        state: sp.get('state') || '',
        city: sp.get('city') || '',
        company_scale: sp.get('company_scale') || '',
        project_focus: sp.get('project_focus') || '',
      },
      sortBy: sp.get('sortBy') || '',
      sortOrder: (sp.get('sortOrder') as 'asc' | 'desc') || 'asc',
    });
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
