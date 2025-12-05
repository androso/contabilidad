import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    const result = await query(
      `SELECT u.id, u.name, u.email, u.role, u.company_id,
              c.name as company_name, c.fiscal_year
       FROM users u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.email = $1 AND u.password = $2`,
      [email, password]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
    
    const user = result.rows[0];
    
    // Log the login
    await query(
      `INSERT INTO audit_log (action, user_name, company_id) VALUES ($1, $2, $3)`,
      [`Usuario ${user.name} inició sesión`, user.name, user.company_id]
    );
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      company: {
        id: user.company_id,
        name: user.company_name,
        fiscalYear: user.fiscal_year
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

