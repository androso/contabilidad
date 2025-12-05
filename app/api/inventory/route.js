import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId') || 1;
    
    const result = await query(
      `SELECT product, sku, stock, avg_cost as "avgCost" FROM inventory WHERE company_id = $1 ORDER BY product`,
      [companyId]
    );
    
    return NextResponse.json({
      success: true,
      inventory: result.rows.map(item => ({
        product: item.product,
        sku: item.sku,
        stock: item.stock,
        avgCost: parseFloat(item.avgCost)
      }))
    });
  } catch (error) {
    console.error('Get inventory error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { product, sku, stock = 0, avgCost = 0, companyId, userName } = await request.json();
    
    // Validate companyId exists
    if (!companyId) {
      return NextResponse.json({ success: false, error: 'Company ID is required' }, { status: 400 });
    }
    
    // Ensure stock is an integer
    const stockInt = Math.floor(Number(stock) || 0);
    const avgCostNum = Number(avgCost) || 0;
    
    await query(
      `INSERT INTO inventory (product, sku, stock, avg_cost, company_id) VALUES ($1, $2, $3, $4, $5)`,
      [product, sku, stockInt, avgCostNum, companyId]
    );
    
    // Audit log
    await query(
      `INSERT INTO audit_log (action, user_name, company_id) VALUES ($1, $2, $3)`,
      [`Producto ${product} agregado al inventario`, userName || 'Sistema', companyId]
    );
    
    return NextResponse.json({ success: true, item: { product, sku, stock: stockInt, avgCost: avgCostNum } });
  } catch (error) {
    console.error('Add inventory error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { sku, product, stock, avgCost, companyId = 1 } = await request.json();
    
    await query(
      `UPDATE inventory SET product = $1, stock = $2, avg_cost = $3 WHERE sku = $4 AND company_id = $5`,
      [product, stock, avgCost, sku, companyId]
    );
    
    return NextResponse.json({ success: true, item: { product, sku, stock, avgCost } });
  } catch (error) {
    console.error('Update inventory error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

