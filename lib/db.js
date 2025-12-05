import { Pool } from 'pg';

let pool;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set. Please create a .env file with DATABASE_URL=postgresql://user:password@host:port/database');
    }
    
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      connectionTimeoutMillis: 10000, // 10 second timeout
    });
    
    // Log connection attempt (hide password)
    const safeUrl = connectionString.replace(/:([^:@]+)@/, ':****@');
    console.log('Connecting to database:', safeUrl);
  }
  return pool;
}

export async function query(text, params) {
  const pool = getPool();
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

export async function getClient() {
  const pool = getPool();
  const client = await pool.connect();
  return client;
}

// Initialize database tables
export async function initializeDatabase() {
  const pool = getPool();
  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS companies (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      fiscal_year VARCHAR(4) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'user',
      company_id INTEGER REFERENCES companies(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      company_id INTEGER REFERENCES companies(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(code, company_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      description TEXT,
      company_id INTEGER REFERENCES companies(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS transaction_entries (
      id SERIAL PRIMARY KEY,
      transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
      account_code VARCHAR(50) NOT NULL,
      debe DECIMAL(15, 2) DEFAULT 0,
      haber DECIMAL(15, 2) DEFAULT 0
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      product VARCHAR(255) NOT NULL,
      sku VARCHAR(100) UNIQUE NOT NULL,
      stock INTEGER DEFAULT 0,
      avg_cost DECIMAL(15, 2) DEFAULT 0,
      company_id INTEGER REFERENCES companies(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS inventory_movements (
      id SERIAL PRIMARY KEY,
      transaction_id INTEGER REFERENCES transactions(id) ON DELETE CASCADE,
      sku VARCHAR(100) NOT NULL,
      quantity INTEGER NOT NULL,
      unit_cost DECIMAL(15, 2) NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      action TEXT NOT NULL,
      user_name VARCHAR(255),
      company_id INTEGER REFERENCES companies(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Database tables initialized');
}

// Seed initial data if tables are empty
export async function seedInitialData() {
  const pool = getPool();
  
  // Check if demo company exists
  let companyResult = await pool.query(`SELECT id FROM companies WHERE name = 'Demo Company SA de CV' LIMIT 1`);
  let companyId;
  
  if (companyResult.rows.length === 0) {
    // Insert demo company
    const insertResult = await pool.query(`
      INSERT INTO companies (name, fiscal_year) 
      VALUES ('Demo Company SA de CV', '2025')
      RETURNING id
    `);
    companyId = insertResult.rows[0].id;
    console.log('Demo company created with id:', companyId);
  } else {
    companyId = companyResult.rows[0].id;
    console.log('Demo company already exists with id:', companyId);
  }

  // Check if demo user exists
  const userExists = await pool.query(`SELECT id FROM users WHERE email = 'admin@demo.com' LIMIT 1`);
  if (userExists.rows.length === 0) {
    await pool.query(`
      INSERT INTO users (name, email, password, role, company_id)
      VALUES ('Admin User', 'admin@demo.com', 'admin', 'admin', $1)
    `, [companyId]);
    console.log('Demo user created');
  } else {
    // Update user's company_id if it was null
    await pool.query(`UPDATE users SET company_id = $1 WHERE email = 'admin@demo.com' AND company_id IS NULL`, [companyId]);
  }
  
  // Check if accounts need to be seeded
  const accountsCount = await pool.query(`SELECT COUNT(*) FROM accounts WHERE company_id = $1`, [companyId]);
  if (parseInt(accountsCount.rows[0].count) === 0) {

    // Insert default accounts - Catálogo de Cuentas El Salvador
    const accounts = [
      // 1 - ACTIVO
      { code: '1', name: 'ACTIVO', type: 'Activo' },
      { code: '1101', name: 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', type: 'Activo' },
      { code: '110101', name: 'Caja General', type: 'Activo' },
      { code: '110102', name: 'Caja Chica', type: 'Activo' },
      { code: '110103', name: 'Bancos', type: 'Activo' },
      { code: '1101030101', name: 'Cuenta Corriente', type: 'Activo' },
      { code: '1101030102', name: 'Cuenta Ahorro', type: 'Activo' },
      { code: '1102', name: 'CUENTAS Y DOCUMENTOS POR COBRAR', type: 'Activo' },
      { code: '110201', name: 'Cuentas por Cobrar Clientes', type: 'Activo' },
      { code: '110202', name: 'Anticipos a Empleados', type: 'Activo' },
      { code: '110203', name: 'Préstamos a Empleados', type: 'Activo' },
      { code: '110206', name: 'Documentos por Cobrar', type: 'Activo' },
      { code: '1103', name: 'PROVISIÓN PARA CUENTAS INCOBRABLES', type: 'Activo' },
      { code: '1104', name: 'INVENTARIOS', type: 'Activo' },
      { code: '110401', name: 'Mercaderías para la Venta', type: 'Activo' },
      { code: '110402', name: 'Costo de Servicios en Proceso', type: 'Activo' },
      { code: '110406', name: 'Inventario de Productos en Proceso', type: 'Activo' },
      { code: '110407', name: 'Inventario de Productos Terminados', type: 'Activo' },
      { code: '1106', name: 'GASTOS PAGADOS POR ANTICIPADO', type: 'Activo' },
      { code: '110601', name: 'Seguros Pagados por Anticipado', type: 'Activo' },
      { code: '110602', name: 'Papelería y Útiles', type: 'Activo' },
      { code: '110603', name: 'Alquileres Pagados por Anticipado', type: 'Activo' },
      { code: '1107', name: 'PAGO A CUENTA IMPUESTO SOBRE LA RENTA', type: 'Activo' },
      { code: '110701', name: 'Pago a Cuenta ISR del Periodo Corriente', type: 'Activo' },
      { code: '1108', name: 'CRÉDITO FISCAL - IVA', type: 'Activo' },
      { code: '110801', name: 'Crédito Fiscal sobre Compras - IVA', type: 'Activo' },
      { code: '1109', name: 'IVA PERCIBIDO', type: 'Activo' },
      { code: '110901', name: 'IVA Percibido del 1%', type: 'Activo' },
      // 12 - ACTIVO NO CORRIENTE
      { code: '12', name: 'ACTIVO NO CORRIENTE', type: 'Activo' },
      { code: '1201', name: 'PROPIEDAD, PLANTA Y EQUIPO', type: 'Activo' },
      { code: '120101', name: 'Terrenos', type: 'Activo' },
      { code: '120102', name: 'Edificios', type: 'Activo' },
      { code: '120103', name: 'Mobiliario y Equipo', type: 'Activo' },
      { code: '120104', name: 'Equipo de Transporte', type: 'Activo' },
      { code: '120105', name: 'Equipo de Computación', type: 'Activo' },
      { code: '120106', name: 'Maquinaria', type: 'Activo' },
      { code: '1202', name: 'DEPRECIACIÓN ACUMULADA', type: 'Activo' },
      { code: '120201', name: 'Depreciación Acumulada Edificios', type: 'Activo' },
      { code: '120202', name: 'Depreciación Acumulada Mobiliario y Equipo', type: 'Activo' },
      { code: '120203', name: 'Depreciación Acumulada Equipo de Transporte', type: 'Activo' },
      { code: '120204', name: 'Depreciación Acumulada Equipo de Computación', type: 'Activo' },
      // 2 - PASIVO
      { code: '2', name: 'PASIVO', type: 'Pasivo' },
      { code: '2101', name: 'PROVEEDORES', type: 'Pasivo' },
      { code: '210101', name: 'Proveedores Locales', type: 'Pasivo' },
      { code: '210102', name: 'Proveedores Extranjeros', type: 'Pasivo' },
      { code: '2102', name: 'PRÉSTAMOS A CORTO PLAZO Y SOBREGIROS', type: 'Pasivo' },
      { code: '210201', name: 'Sobregiros Bancarios', type: 'Pasivo' },
      { code: '210202', name: 'Préstamos Bancarios', type: 'Pasivo' },
      { code: '2103', name: 'CUENTAS Y DOCUMENTOS POR PAGAR', type: 'Pasivo' },
      { code: '210301', name: 'Documentos por Pagar', type: 'Pasivo' },
      { code: '210302', name: 'Cuentas por Pagar', type: 'Pasivo' },
      { code: '210303', name: 'Gastos Acumulados por Pagar', type: 'Pasivo' },
      { code: '21030501', name: 'Sueldos y Comisiones por Pagar', type: 'Pasivo' },
      { code: '21030502', name: 'Vacaciones por Pagar', type: 'Pasivo' },
      { code: '21030503', name: 'Aguinaldos por Pagar', type: 'Pasivo' },
      { code: '2104', name: 'PROVISIONES', type: 'Pasivo' },
      { code: '210401', name: 'Cuota Patronal ISSS', type: 'Pasivo' },
      { code: '210402', name: 'Cuota Patronal AFP', type: 'Pasivo' },
      { code: '210403', name: 'Intereses por Pagar', type: 'Pasivo' },
      { code: '210405', name: 'IVA por Pagar', type: 'Pasivo' },
      { code: '210407', name: 'Pago a Cuenta ISR por Pagar', type: 'Pasivo' },
      { code: '210409', name: 'Impuesto sobre la Renta Retenido', type: 'Pasivo' },
      // 3 - PATRIMONIO
      { code: '3', name: 'PATRIMONIO', type: 'Patrimonio' },
      { code: '3101', name: 'CAPITAL LIQUIDO', type: 'Patrimonio' },
      { code: '3102', name: 'CAPITAL SOCIAL', type: 'Patrimonio' },
      { code: '3103', name: 'UTILIDADES DE EJERCICIOS ANTERIORES', type: 'Patrimonio' },
      { code: '3104', name: 'UTILIDAD DEL EJERCICIO ACTUAL', type: 'Patrimonio' },
      { code: '3105', name: 'PÉRDIDAS DE EJERCICIOS ANTERIORES', type: 'Patrimonio' },
      { code: '3106', name: 'PÉRDIDAS DEL EJERCICIO ACTUAL', type: 'Patrimonio' },
      { code: '3108', name: 'RESERVA LEGAL', type: 'Patrimonio' },
      // 4 - CUENTAS DE RESULTADO DEUDOR (Gastos)
      { code: '4', name: 'CUENTAS DE RESULTADO DEUDOR', type: 'Gasto' },
      { code: '4101', name: 'COMPRAS', type: 'Gasto' },
      { code: '410101', name: 'Mercadería', type: 'Gasto' },
      { code: '4102', name: 'GASTOS DE VENTAS', type: 'Gasto' },
      { code: '410201', name: 'Sueldos y Comisiones', type: 'Gasto' },
      { code: '410203', name: 'Vacaciones', type: 'Gasto' },
      { code: '410204', name: 'Aguinaldos', type: 'Gasto' },
      { code: '410207', name: 'Cuota Patronal ISSS', type: 'Gasto' },
      { code: '410208', name: 'Cuota Patronal AFP', type: 'Gasto' },
      { code: '4103', name: 'GASTOS DE ADMINISTRACIÓN', type: 'Gasto' },
      { code: '410301', name: 'Sueldos', type: 'Gasto' },
      { code: '410302', name: 'Horas Extras', type: 'Gasto' },
      { code: '410303', name: 'Vacaciones', type: 'Gasto' },
      { code: '410304', name: 'Aguinaldos', type: 'Gasto' },
      { code: '410307', name: 'Cuota Patronal ISSS', type: 'Gasto' },
      { code: '410308', name: 'Cuota Patronal AFP', type: 'Gasto' },
      { code: '410309', name: 'Papelería y Útiles', type: 'Gasto' },
      { code: '410310', name: 'Depreciaciones', type: 'Gasto' },
      { code: '410311', name: 'Mantenimiento y Reparaciones', type: 'Gasto' },
      { code: '410312', name: 'Combustible y Lubricantes', type: 'Gasto' },
      { code: '410313', name: 'Servicios Públicos', type: 'Gasto' },
      { code: '410314', name: 'Alquileres', type: 'Gasto' },
      { code: '4104', name: 'GASTOS FINANCIEROS', type: 'Gasto' },
      { code: '410401', name: 'Intereses Bancarios', type: 'Gasto' },
      { code: '410402', name: 'Comisiones Bancarias', type: 'Gasto' },
      { code: '4105', name: 'GASTOS NO OPERACIONALES', type: 'Gasto' },
      { code: '410501', name: 'Pérdida en Venta de Activos Fijos', type: 'Gasto' },
      // 5 - CUENTAS DE RESULTADO ACREEDOR (Ingresos)
      { code: '5', name: 'CUENTAS DE RESULTADO ACREEDOR', type: 'Ingreso' },
      { code: '5101', name: 'INGRESOS POR SERVICIOS', type: 'Ingreso' },
      { code: '5102', name: 'VENTAS', type: 'Ingreso' },
      { code: '510201', name: 'Ventas al Contado', type: 'Ingreso' },
      { code: '510202', name: 'Ventas al Crédito', type: 'Ingreso' },
      { code: '5201', name: 'INGRESOS FINANCIEROS', type: 'Ingreso' },
      { code: '520101', name: 'Intereses Bancarios', type: 'Ingreso' },
      { code: '5202', name: 'GANANCIA EN VENTA DE ACTIVOS FIJOS', type: 'Ingreso' },
      // 6 - CUENTA DE CIERRE
      { code: '6', name: 'CUENTA DE CIERRE', type: 'Cierre' },
      { code: '6101', name: 'PÉRDIDAS Y GANANCIAS', type: 'Cierre' }
    ];

    for (const acc of accounts) {
      await pool.query(`
        INSERT INTO accounts (code, name, type, company_id)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (code, company_id) DO NOTHING
      `, [acc.code, acc.name, acc.type, companyId]);
    }
    console.log('Accounts seeded');
  }

  // Check if inventory needs to be seeded
  const inventoryCount = await pool.query(`SELECT COUNT(*) FROM inventory WHERE company_id = $1`, [companyId]);
  if (parseInt(inventoryCount.rows[0].count) === 0) {
    const inventoryItems = [
      { product: 'Producto X', sku: 'PRODX001', stock: 40, avgCost: 60.00 },
      { product: 'Producto Y', sku: 'PRODY001', stock: 50, avgCost: 120.00 }
    ];

    for (const item of inventoryItems) {
      await pool.query(`
        INSERT INTO inventory (product, sku, stock, avg_cost, company_id)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (sku) DO NOTHING
      `, [item.product, item.sku, item.stock, item.avgCost, companyId]);
    }
    console.log('Inventory seeded');
  }

  console.log('Initial data seeding complete');
}

export default { query, getClient, initializeDatabase, seedInitialData };

