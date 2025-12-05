import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 1;
    const limit = searchParams.get('limit') || 100;
    
    const result = await query(
      `SELECT action, user_name as "user", created_at as "timestamp" 
       FROM audit_log 
       WHERE company_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2`,
      [companyId, limit]
    );
    
    return NextResponse.json({
      success: true,
      auditLog: result.rows.map(log => ({
        action: log.action,
        user: log.user,
        timestamp: log.timestamp.toISOString()
      }))
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { action, userName, companyId = 1 } = await request.json();
    
    await query(
      `INSERT INTO audit_log (action, user_name, company_id) VALUES ($1, $2, $3)`,
      [action, userName, companyId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add audit log error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

