import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 1;
    
    const result = await query(
      `SELECT code, name, type FROM accounts WHERE company_id = $1 ORDER BY code`,
      [companyId]
    );
    
    return NextResponse.json({ success: true, accounts: result.rows });
  } catch (error) {
    console.error('Get accounts error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { code, name, type, companyId = 1, userName } = await request.json();
    
    await query(
      `INSERT INTO accounts (code, name, type, company_id) VALUES ($1, $2, $3, $4)`,
      [code, name, type, companyId]
    );
    
    // Audit log
    await query(
      `INSERT INTO audit_log (action, user_name, company_id) VALUES ($1, $2, $3)`,
      [`Cuenta ${code} - ${name} creada`, userName || 'Sistema', companyId]
    );
    
    return NextResponse.json({ success: true, account: { code, name, type } });
  } catch (error) {
    console.error('Add account error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { code, name, type, companyId = 1, userName } = await request.json();
    
    await query(
      `UPDATE accounts SET name = $1, type = $2 WHERE code = $3 AND company_id = $4`,
      [name, type, code, companyId]
    );
    
    // Audit log
    await query(
      `INSERT INTO audit_log (action, user_name, company_id) VALUES ($1, $2, $3)`,
      [`Cuenta ${code} modificada`, userName || 'Sistema', companyId]
    );
    
    return NextResponse.json({ success: true, account: { code, name, type } });
  } catch (error) {
    console.error('Update account error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

