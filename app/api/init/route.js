import { initializeDatabase, seedInitialData, query } from '@/lib/db';
import { NextResponse } from 'next/server';

async function initAndGetCompany() {
  await initializeDatabase();
  await seedInitialData();
  
  // Return the demo company info
  const result = await query(`SELECT id, name, fiscal_year FROM companies LIMIT 1`);
  return result.rows[0] || null;
}

export async function POST() {
  try {
    const company = await initAndGetCompany();
    return NextResponse.json({ success: true, message: 'Database initialized', company });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const company = await initAndGetCompany();
    return NextResponse.json({ success: true, message: 'Database initialized', company });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

