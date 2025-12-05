import { query, seedInitialData } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Delete all data in reverse order of dependencies
    await query('DELETE FROM inventory_movements');
    await query('DELETE FROM transaction_entries');
    await query('DELETE FROM transactions');
    await query('DELETE FROM inventory');
    await query('DELETE FROM accounts');
    await query('DELETE FROM audit_log');
    await query('DELETE FROM users');
    await query('DELETE FROM companies');
    
    // Reset sequences
    await query('ALTER SEQUENCE companies_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE accounts_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE transactions_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE transaction_entries_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE inventory_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE inventory_movements_id_seq RESTART WITH 1');
    await query('ALTER SEQUENCE audit_log_id_seq RESTART WITH 1');
    
    // Re-seed initial data
    await seedInitialData();
    
    // Get the new company info
    const companyResult = await query('SELECT id, name, fiscal_year FROM companies LIMIT 1');
    const company = companyResult.rows[0];
    
    console.log('Database reset successfully');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database reset successfully',
      company
    });
  } catch (error) {
    console.error('Reset database error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

