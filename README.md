# Sistema de Contabilidad - El Salvador

Sistema de contabilidad de partida doble con método perpetuo de inventario, diseñado según las normas contables de El Salvador.

## Credenciales de Acceso

```
Email: admin@demo.com
Contraseña: admin
```

---

## Estado Inicial del Sistema

Al crear o reiniciar la base de datos, el sistema se inicializa con los siguientes datos:

### Inventario Inicial

| SKU | Producto | Stock | Costo Promedio | Valor Total |
|-----|----------|-------|----------------|-------------|
| PRODX001 | Producto X | 40 | $60.00 | $2,400.00 |
| PRODY001 | Producto Y | 50 | $120.00 | $6,000.00 |
| **Total** | | **90** | | **$8,400.00** |

### Dashboard Inicial

```
┌─────────────────────┬─────────────────────┐
│ Transacciones Hoy   │ Total Activos       │
│        0            │      $0.00          │
│                     │ Pasivos: $0.00      │
│                     │ Patrimonio: $0.00   │
├─────────────────────┼─────────────────────┤
│ Inventario Total    │ Estado              │
│    $8,400.00        │ Sistema Operativo ✓ │
│ 2 productos en stock│                     │
└─────────────────────┴─────────────────────┘
```

**Nota:** "Total Activos" se calcula desde las transacciones contables. "Inventario Total" se calcula desde la tabla de inventario físico.

---

## Workflow 1: Venta al Contado

### Escenario
Vendemos 1 unidad de Producto X a $100.00 (sin IVA).

### Datos de entrada
- **Plantilla:** Venta al Contado + IVA
- **Producto:** Producto X (Costo: $60.00)
- **Cantidad:** 1
- **Precio venta (sin IVA):** $100.00

### Cálculos automáticos
```
Subtotal:     $100.00
IVA (13%):    $13.00
Total:        $113.00
Costo venta:  $60.00 (1 × $60.00)
```

### Asientos Contables Generados

| # | Cuenta | Nombre | Debe | Haber |
|---|--------|--------|------|-------|
| 1 | 110101 | Caja General | $113.00 | - |
| 2 | 510201 | Ventas al Contado | - | $100.00 |
| 3 | 210405 | IVA por Pagar | - | $13.00 |
| 4 | 410101 | Mercadería (Costo de Ventas) | $60.00 | - |
| 5 | 110401 | Mercaderías para la Venta | - | $60.00 |
| | | **TOTALES** | **$173.00** | **$173.00** |

### Resultado en Dashboard

```
┌─────────────────────┬─────────────────────┐
│ Transacciones Hoy   │ Total Activos       │
│        1            │     $53.00          │
│                     │ Pasivos: $13.00     │
│                     │ Patrimonio: $0.00   │
├─────────────────────┼─────────────────────┤
│ Inventario Total    │ Estado              │
│    $8,340.00        │ Sistema Operativo ✓ │
│ 2 productos en stock│                     │
└─────────────────────┴─────────────────────┘
```

### Explicación de Total Activos = $53.00
```
Caja General (110101):           +$113.00 (Activo ↑)
Mercaderías (110401):            -$60.00  (Activo ↓)
─────────────────────────────────────────────
Total Activos:                   $53.00
```

### Inventario Actualizado

| SKU | Producto | Stock | Costo Promedio | Valor Total |
|-----|----------|-------|----------------|-------------|
| PRODX001 | Producto X | **39** | $60.00 | $2,340.00 |
| PRODY001 | Producto Y | 50 | $120.00 | $6,000.00 |
| **Total** | | **89** | | **$8,340.00** |

### Libro Mayor - 1101 EFECTIVO Y EQUIVALENTES

| Fecha | Asiento | Descripción | Subcuenta | Debe | Haber | Saldo |
|-------|---------|-------------|-----------|------|-------|-------|
| 05/12/2025 | 1 | Venta Producto X | Caja General | $113.00 | - | $113.00 |

---

## Workflow 2: Venta al Crédito

### Escenario
Vendemos 2 unidades de Producto Y a $200.00 c/u (sin IVA) a crédito.

### Datos de entrada
- **Plantilla:** Venta al Crédito + IVA
- **Producto:** Producto Y (Costo: $120.00)
- **Cantidad:** 2
- **Precio venta (sin IVA):** $200.00

### Cálculos automáticos
```
Subtotal:     $400.00 (2 × $200.00)
IVA (13%):    $52.00
Total:        $452.00
Costo venta:  $240.00 (2 × $120.00)
```

### Asientos Contables Generados

| # | Cuenta | Nombre | Debe | Haber |
|---|--------|--------|------|-------|
| 1 | 110201 | Cuentas por Cobrar Clientes | $452.00 | - |
| 2 | 510202 | Ventas al Crédito | - | $400.00 |
| 3 | 210405 | IVA por Pagar | - | $52.00 |
| 4 | 410101 | Mercadería (Costo de Ventas) | $240.00 | - |
| 5 | 110401 | Mercaderías para la Venta | - | $240.00 |
| | | **TOTALES** | **$692.00** | **$692.00** |

### Resultado Acumulado en Dashboard (después de Workflow 1 y 2)

```
┌─────────────────────┬─────────────────────┐
│ Transacciones Hoy   │ Total Activos       │
│        2            │    $265.00          │
│                     │ Pasivos: $65.00     │
│                     │ Patrimonio: $0.00   │
├─────────────────────┼─────────────────────┤
│ Inventario Total    │ Estado              │
│    $8,100.00        │ Sistema Operativo ✓ │
│ 2 productos en stock│                     │
└─────────────────────┴─────────────────────┘
```

### Explicación de Total Activos = $265.00
```
Transacción 1:
  Caja (110101):        +$113.00
  Mercaderías (110401): -$60.00
  Subtotal:             +$53.00

Transacción 2:
  Clientes (110201):    +$452.00
  Mercaderías (110401): -$240.00
  Subtotal:             +$212.00

─────────────────────────────────────────────
Total Activos:          $265.00
```

### Inventario Actualizado

| SKU | Producto | Stock | Costo Promedio | Valor Total |
|-----|----------|-------|----------------|-------------|
| PRODX001 | Producto X | 39 | $60.00 | $2,340.00 |
| PRODY001 | Producto Y | **48** | $120.00 | $5,760.00 |
| **Total** | | **87** | | **$8,100.00** |

---

## Workflow 3: Compra al Crédito

### Escenario
Compramos 10 unidades de Producto X a $55.00 c/u (sin IVA) a crédito.

### Datos de entrada
- **Plantilla:** Compra al Crédito + IVA
- **Producto:** Producto X
- **Cantidad:** 10
- **Costo unitario (sin IVA):** $55.00

### Cálculos automáticos
```
Subtotal:     $550.00 (10 × $55.00)
IVA (13%):    $71.50
Total:        $621.50
```

### Asientos Contables Generados

| # | Cuenta | Nombre | Debe | Haber |
|---|--------|--------|------|-------|
| 1 | 110401 | Mercaderías para la Venta | $550.00 | - |
| 2 | 110801 | Crédito Fiscal sobre Compras - IVA | $71.50 | - |
| 3 | 210101 | Proveedores Locales | - | $621.50 |
| | | **TOTALES** | **$621.50** | **$621.50** |

### Resultado Acumulado en Dashboard (después de Workflows 1, 2 y 3)

```
┌─────────────────────┬─────────────────────┐
│ Transacciones Hoy   │ Total Activos       │
│        3            │    $886.50          │
│                     │ Pasivos: $686.50    │
│                     │ Patrimonio: $0.00   │
├─────────────────────┼─────────────────────┤
│ Inventario Total    │ Estado              │
│    $8,637.55        │ Sistema Operativo ✓ │
│ 2 productos en stock│                     │
└─────────────────────┴─────────────────────┘
```

### Explicación de Total Activos = $886.50
```
Acumulado anterior:     $265.00

Transacción 3:
  Mercaderías (110401): +$550.00
  IVA Crédito (110801): +$71.50
  Subtotal:             +$621.50

─────────────────────────────────────────────
Total Activos:          $886.50
```

### Inventario Actualizado (con nuevo costo promedio)

| SKU | Producto | Stock | Costo Promedio | Valor Total |
|-----|----------|-------|----------------|-------------|
| PRODX001 | Producto X | **49** | **$58.98*** | $2,890.02 |
| PRODY001 | Producto Y | 48 | $120.00 | $5,760.00 |
| **Total** | | **97** | | **$8,650.02** |

*Nuevo costo promedio de Producto X:
```
Costo promedio = (39 × $60.00 + 10 × $55.00) / 49
               = ($2,340.00 + $550.00) / 49
               = $2,890.00 / 49
               = $58.98
```

---

## Workflow 4: Cobro a Cliente

### Escenario
El cliente de la Transacción 2 nos paga $200.00 de los $452.00 que debe.

### Datos de entrada
- **Plantilla:** Cobro a Cliente
- **Monto:** $200.00

### Asientos Contables (editados manualmente)

| # | Cuenta | Nombre | Debe | Haber |
|---|--------|--------|------|-------|
| 1 | 110101 | Caja General | $200.00 | - |
| 2 | 110201 | Cuentas por Cobrar Clientes | - | $200.00 |
| | | **TOTALES** | **$200.00** | **$200.00** |

### Resultado en Dashboard

**Total Activos permanece igual** porque:
```
Caja (110101):     +$200.00 (Activo ↑)
Clientes (110201): -$200.00 (Activo ↓)
─────────────────────────────────────────────
Cambio neto:       $0.00
```

Solo cambia la composición de los activos (menos cuentas por cobrar, más efectivo).

---

## Workflow 5: Pago a Proveedor

### Escenario
Pagamos $300.00 al proveedor de la Transacción 3.

### Datos de entrada
- **Plantilla:** Pago a Proveedor
- **Monto:** $300.00

### Asientos Contables (editados manualmente)

| # | Cuenta | Nombre | Debe | Haber |
|---|--------|--------|------|-------|
| 1 | 210101 | Proveedores Locales | $300.00 | - |
| 2 | 110101 | Caja General | - | $300.00 |
| | | **TOTALES** | **$300.00** | **$300.00** |

### Resultado en Dashboard

```
Total Activos:    $886.50 - $300.00 = $586.50
Pasivos:          $686.50 - $300.00 = $386.50
```

---

## Balance de Comprobación (después de todos los workflows)

```
✓ Balance cuadrado correctamente.
Movimientos: Debe = Haber = $1,986.50
Saldos: Deudor = Acreedor = $1,186.50
```

| Código | Cuenta | Tipo | Debe | Haber | Saldo Deudor | Saldo Acreedor |
|--------|--------|------|------|-------|--------------|----------------|
| 1101 | EFECTIVO Y EQUIVALENTES | Activo | $313.00 | $300.00 | $13.00 | - |
| 1102 | CUENTAS POR COBRAR | Activo | $452.00 | $200.00 | $252.00 | - |
| 1104 | INVENTARIOS | Activo | $550.00 | $300.00 | $250.00 | - |
| 1108 | CRÉDITO FISCAL IVA | Activo | $71.50 | - | $71.50 | - |
| 2101 | PROVEEDORES | Pasivo | $300.00 | $621.50 | - | $321.50 |
| 2104 | IVA POR PAGAR | Pasivo | - | $65.00 | - | $65.00 |
| 4101 | COMPRAS/COSTO VENTAS | Gasto | $300.00 | - | $300.00 | - |
| 5102 | VENTAS | Ingreso | - | $500.00 | - | $500.00 |
| | **TOTALES** | | **$1,986.50** | **$1,986.50** | **$886.50** | **$886.50** |

---

## Libro Mayor - Ejemplo: 1101 EFECTIVO Y EQUIVALENTES

| Fecha | Asiento | Descripción | Subcuenta | Debe | Haber | Saldo |
|-------|---------|-------------|-----------|------|-------|-------|
| 05/12/2025 | 1 | Venta Producto X | Caja General | $113.00 | - | $113.00 |
| 05/12/2025 | 4 | Cobro cliente | Caja General | $200.00 | - | $313.00 |
| 05/12/2025 | 5 | Pago proveedor | Caja General | - | $300.00 | $13.00 |

---

## Resumen de Fórmulas

### Cálculo de Total Activos
```
Total Activos = Σ (Debe - Haber) para todas las cuentas tipo "Activo"
```

### Cálculo de Total Pasivos
```
Total Pasivos = Σ (Haber - Debe) para todas las cuentas tipo "Pasivo"
```

### Cálculo de Inventario Total
```
Inventario Total = Σ (Stock × Costo Promedio) para cada producto
```

### Cálculo de Costo Promedio (al comprar)
```
Nuevo Costo Promedio = (Stock Actual × Costo Actual + Cantidad Comprada × Costo Compra) / (Stock Actual + Cantidad Comprada)
```

### IVA El Salvador
```
IVA = 13% del subtotal (según Decreto 296)
```

---

## Catálogo de Cuentas

El sistema utiliza el catálogo de cuentas estándar de El Salvador:

| Código | Categoría | Tipo |
|--------|-----------|------|
| 1xxx | ACTIVO | Activo |
| 2xxx | PASIVO | Pasivo |
| 3xxx | PATRIMONIO | Patrimonio |
| 4xxx | CUENTAS DE RESULTADO DEUDOR | Gasto |
| 5xxx | CUENTAS DE RESULTADO ACREEDOR | Ingreso |
| 6xxx | CUENTA DE CIERRE | Cierre |

---

## Tecnologías

- **Frontend:** Next.js 14, React
- **Backend:** Next.js API Routes
- **Base de datos:** PostgreSQL
- **Estilos:** CSS custom properties

---

## Instalación

```bash
# Clonar el repositorio
git clone <repo-url>
cd contabilidad

# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env con:
DATABASE_URL=postgresql://user:password@host:port/database

# Iniciar en desarrollo
npm run dev
```

---

## Licencia

MIT

