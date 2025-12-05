import { query, getClient } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 1;
    
    // Get transactions
    const txResult = await query(
      `SELECT id, date, description FROM transactions WHERE company_id = $1 ORDER BY date DESC, id DESC`,
      [companyId]
    );
    
    // Get entries for all transactions
    const transactions = await Promise.all(
      txResult.rows.map(async (tx) => {
        const entriesResult = await query(
          `SELECT account_code as account, debe, haber FROM transaction_entries WHERE transaction_id = $1`,
          [tx.id]
        );
        
        const movementsResult = await query(
          `SELECT sku, quantity, unit_cost as "unitCost" FROM inventory_movements WHERE transaction_id = $1`,
          [tx.id]
        );
        
        return {
          id: tx.id,
          date: tx.date.toISOString().split('T')[0],
          description: tx.description,
          entries: entriesResult.rows.map(e => ({
            account: e.account,
            debe: parseFloat(e.debe),
            haber: parseFloat(e.haber)
          })),
          inventoryMovements: movementsResult.rows.length > 0 
            ? movementsResult.rows.map(m => ({
                sku: m.sku,
                quantity: m.quantity,
                unitCost: parseFloat(m.unitCost)
              }))
            : undefined
        };
      })
    );
    
    return NextResponse.json({ success: true, transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const client = await getClient();
  
  try {
    const { date, description, entries, inventoryMovements, companyId = 1, userName } = await request.json();
    
    await client.query('BEGIN');
    
    // Insert transaction
    const txResult = await client.query(
      `INSERT INTO transactions (date, description, company_id) VALUES ($1, $2, $3) RETURNING id`,
      [date, description, companyId]
    );
    const transactionId = txResult.rows[0].id;
    
    // Insert entries
    for (const entry of entries) {
      await client.query(
        `INSERT INTO transaction_entries (transaction_id, account_code, debe, haber) VALUES ($1, $2, $3, $4)`,
        [transactionId, entry.account, entry.debe || 0, entry.haber || 0]
      );
    }
    
    // Insert inventory movements and update inventory
    if (inventoryMovements && inventoryMovements.length > 0) {
      for (const movement of inventoryMovements) {
        await client.query(
          `INSERT INTO inventory_movements (transaction_id, sku, quantity, unit_cost) VALUES ($1, $2, $3, $4)`,
          [transactionId, movement.sku, movement.quantity, movement.unitCost]
        );
        
        // Update inventory
        if (movement.quantity > 0) {
          // Adding to inventory - recalculate average cost
          await client.query(`
            UPDATE inventory 
            SET stock = stock + $1,
                avg_cost = (stock * avg_cost + $1 * $2) / NULLIF(stock + $1, 0)
            WHERE sku = $3 AND company_id = $4
          `, [movement.quantity, movement.unitCost, movement.sku, companyId]);
        } else {
          // Removing from inventory
          await client.query(`
            UPDATE inventory 
            SET stock = GREATEST(0, stock - $1)
            WHERE sku = $2 AND company_id = $3
          `, [Math.abs(movement.quantity), movement.sku, companyId]);
        }
      }
    }
    
    // Audit log
    await client.query(
      `INSERT INTO audit_log (action, user_name, company_id) VALUES ($1, $2, $3)`,
      [`Transacción #${transactionId} creada: ${description}`, userName || 'Sistema', companyId]
    );
    
    await client.query('COMMIT');
    
    return NextResponse.json({
      success: true,
      transaction: {
        id: transactionId,
        date,
        description,
        entries,
        inventoryMovements
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Add transaction error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    client.release();
  }
}

