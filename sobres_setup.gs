/**
 * SOBRES DIGITALES — Google Apps Script v2
 * ─────────────────────────────────────────
 * 1. Abre tu Google Sheet vacío
 * 2. Extensiones → Apps Script
 * 3. Borra el contenido y pega este código
 * 4. Guarda (Ctrl+S) → Ejecutar → setupCompleto
 * 5. Acepta los permisos
 */

// ══════════════════════════════════════════════
// MENÚ — se crea automáticamente al abrir el Sheet
// ══════════════════════════════════════════════
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('💰 Sobres')
    .addItem('▶ Crear sistema completo (primera vez)', 'setupCompleto')
    .addSeparator()
    .addItem('📅 Abrir nuevo mes', 'abrirNuevoMes')
    .addItem('🔄 Recrear Dashboard', 'crearDashboard')
    .addItem('📋 Recrear Plantilla', 'crearPlantilla')
    .addSeparator()
    .addItem('ℹ️ Ver Sheet ID (para la app)', 'mostrarSheetId')
    .addToUi();
}

function mostrarSheetId() {
  var id = SpreadsheetApp.getActiveSpreadsheet().getId();
  SpreadsheetApp.getUi().alert(
    '🔗 Tu Sheet ID:\n\n' + id + '\n\n' +
    'Cópialo y pégalo en la app HTML → pantalla de configuración → campo "Sheet ID".'
  );
}

// ── Detectar separador de fórmulas del locale del usuario ──
// Google Sheets usa "," en locale en-US y ";" en es-* y otros.
// setFormula() con notación inglesa (coma) funciona en AMBOS casos
// cuando se usa la API de Apps Script — Google lo convierte internamente.
// Sin embargo, cuando usamos setFormula con strings que contienen
// funciones anidadas con comas, puede fallar en locales con punto y coma.
// Solución: detectar y reemplazar el separador dinámicamente.
function getSep() {
  // Insertamos una fórmula de prueba y leemos cómo la almacena el sistema
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var locale = ss.getSpreadsheetLocale();
  // Locales que usan punto y coma: es_*, fr_*, de_*, pt_*, it_*, nl_*, ru_*, etc.
  var semicolonLocales = ['es_','fr_','de_','pt_','it_','nl_','ru_','pl_','tr_','ar_'];
  for (var i = 0; i < semicolonLocales.length; i++) {
    if (locale.indexOf(semicolonLocales[i]) === 0) return ';';
  }
  return ',';
}

// Convierte una fórmula escrita con comas al separador correcto del locale
function f(formula) {
  var sep = getSep();
  if (sep === ',') return formula;
  // Reemplaza comas dentro de funciones (no las que están en strings entre comillas)
  return formula.replace(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/g, ';');
}

// ── COLORES ──
var BG_DARK   = '#1A1917';
var ACCENT    = '#C8B97A';
var GREEN     = '#7AB89E';
var DANGER    = '#C87A7A';
var WARN      = '#C8A07A';
var MUTED     = '#A09C90';
var WHITE     = '#FFFFFF';
var ALT_ROW   = '#FAFAF8';
var EMERALD   = '#E8F5E9';
var AMBER     = '#FFF8E1';
var PRIO1     = '#F8D7DA';
var PRIO2     = '#FFF3CD';
var PRIO3     = '#D4EDDA';
var BORDER_C  = '#DDDAD3';

// ── HELPER: aplica estilo de encabezado a un rango ya obtenido ──
function applyHeader(range, bg, fg) {
  if (!range) return;
  range
    .setBackground(bg || BG_DARK)
    .setFontColor(fg || WHITE)
    .setFontWeight('bold')
    .setFontFamily('Arial')
    .setFontSize(10)
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setBorder(true, true, true, true, true, true,
               BORDER_C, SpreadsheetApp.BorderStyle.SOLID);
}

// ── HELPER: título de sección ──
function secTitle(ws, row, fromCol, toCol, text, bg) {
  var range = ws.getRange(row, fromCol, 1, toCol - fromCol + 1);
  range.merge()
    .setValue(text)
    .setBackground(bg || ACCENT)
    .setFontColor(BG_DARK)
    .setFontWeight('bold')
    .setFontSize(10)
    .setFontFamily('Arial')
    .setHorizontalAlignment('left')
    .setVerticalAlignment('middle');
  ws.setRowHeight(row, 22);
}

// ── HELPER: eliminar pestaña si existe ──
function dropSheet(ss, name) {
  var s = ss.getSheetByName(name);
  if (s) ss.deleteSheet(s);
}

// ── HELPER: estilo de fila de datos ──
function styleDataRow(ws, row, numCols, bg) {
  ws.getRange(row, 1, 1, numCols)
    .setFontFamily('Arial')
    .setFontSize(10)
    .setVerticalAlignment('middle')
    .setBackground(bg || WHITE)
    .setBorder(true, true, true, true, true, true,
               BORDER_C, SpreadsheetApp.BorderStyle.SOLID);
}

// ══════════════════════════════════════════════
// PLANTILLA
// ══════════════════════════════════════════════
function crearPlantilla(ss) {
  dropSheet(ss, 'Plantilla');
  var ws = ss.insertSheet('Plantilla');
  ws.setFrozenRows(3);

  // Fila 1 — título
  ws.getRange(1, 1, 1, 12).merge()
    .setValue('💰 PLANTILLA MENSUAL — SOBRES DIGITALES')
    .setBackground(BG_DARK).setFontColor(ACCENT)
    .setFontWeight('bold').setFontSize(14).setFontFamily('Arial')
    .setHorizontalAlignment('center');
  ws.setRowHeight(1, 32);

  // Fila 2 — subtítulo
  ws.getRange(2, 1, 1, 12).merge()
    .setValue('Campos en AZUL son editables. Monto/mes en USD equivalente.')
    .setBackground(BG_DARK).setFontColor(MUTED)
    .setFontSize(9).setFontFamily('Arial').setHorizontalAlignment('center');
  ws.setRowHeight(2, 16);

  // Fila 3 — headers
  var hdrs = ['#','Grupo','Sub-sobre','Categoría','Prioridad','Día',
              'Moneda','Monto/mes','Bolsa','Tipo','Anual','Notas'];
  var hdrRange = ws.getRange(3, 1, 1, hdrs.length);
  hdrRange.setValues([hdrs]);
  applyHeader(hdrRange);
  ws.setRowHeight(3, 20);

  // Anchos de columna
  [4,22,20,16,14,6,10,12,22,12,10,28].forEach(function(w, i) {
    ws.setColumnWidth(i + 1, w * 7);
  });

  // Datos
  var data = getPlantilla();
  var prioColors  = { 1: PRIO1, 2: PRIO2, 3: PRIO3 };
  var prioLabels  = { 1: '🔴 Crítico', 2: '🟡 Importante', 3: '🟢 Flexible' };
  var prioBgs     = { 1: ACCENT, 2: WARN, 3: GREEN };
  var lastPrio    = null;
  var r = 4;

  data.forEach(function(d, idx) {
    var prio = d[3];
    if (prio !== lastPrio) {
      lastPrio = prio;
      secTitle(ws, r, 1, 12,
        '  PRIORIDAD ' + prio + ' — ' + prioLabels[prio].toUpperCase(),
        prioBgs[prio]);
      r++;
    }

    var bg = idx % 2 === 0 ? ALT_ROW : WHITE;
    var vals = [idx + 1, d[0], d[1], d[2], prioLabels[prio],
                d[4], d[5], d[6], d[7], d[8], d[9] || '', d[10]];
    styleDataRow(ws, r, 12, bg);
    ws.getRange(r, 1, 1, 12).setValues([vals]);
    ws.setRowHeight(r, 18);

    // Prioridad — color especial
    ws.getRange(r, 5)
      .setBackground(prioColors[prio])
      .setFontWeight('bold').setHorizontalAlignment('center');

    // Monto en azul
    ws.getRange(r, 8)
      .setFontColor('#0000FF')
      .setHorizontalAlignment('right')
      .setNumberFormat('$#,##0.00');

    // Monto anual en azul
    if (d[9]) {
      ws.getRange(r, 11)
        .setFontColor('#0000FF')
        .setHorizontalAlignment('right')
        .setNumberFormat('$#,##0.00');
    }
    r++;
  });

  // Total
  ws.getRange(r, 1, 1, 7).merge()
    .setValue('TOTAL MENSUAL COMPROMETIDO')
    .setBackground(BG_DARK).setFontColor(WHITE)
    .setFontWeight('bold').setFontFamily('Arial').setFontSize(10)
    .setHorizontalAlignment('right');
  ws.getRange(r, 8)
    .setFormula(f('=SUM(H4:H' + (r - 1) + '))')
    .setBackground(BG_DARK).setFontColor(ACCENT)
    .setFontWeight('bold').setFontSize(12)
    .setNumberFormat('$#,##0.00').setHorizontalAlignment('center');
  ws.getRange(r, 9, 1, 4).setBackground(BG_DARK);
  ws.setRowHeight(r, 26);
}

// ── Datos de la plantilla ──
function getPlantilla() {
  // [Grupo, SubSobre, Cat, Prio, Dia, Moneda, Monto, Bolsa, Tipo, AnualTotal, Notas]
  return [
    // PRIORIDAD 1
    ['Hogar','Inter','🏠 Hogar',1,5,'VES-BCV',40,'Binance Earn USDt','Fijo','','Internet fibra'],
    ['Hogar','Condominio','🏠 Hogar',1,1,'VES-BCV',65,'Binance Earn USDt','Fijo','',''],
    ['Hogar','Corpoelec','🏠 Hogar',1,3,'VES-BCV',5,'Binance Earn USDt','Fijo','',''],
    ['Hogar','Aseo','🏠 Hogar',1,3,'VES-BCV',5,'Banesco','Fijo','',''],
    ['Hogar','CANTV ABA','🏠 Hogar',1,5,'VES-BCV',25,'Binance Earn USDt','Fijo','',''],
    ['Hogar','CANTV Teléfono','🏠 Hogar',1,5,'VES-BCV',5,'Binance Earn USDt','Fijo','',''],
    ['Hogar','Movistar YG','🏠 Hogar',1,5,'VES-BCV',10,'Binance Earn USDt','Fijo','',''],
    ['Hogar','Movistar YL','🏠 Hogar',1,25,'VES-BCV',10,'Binance Earn USDt','Fijo','',''],
    ['Hogar','Movistar JG','🏠 Hogar',1,25,'VES-BCV',10,'Binance Earn USDt','Fijo','',''],
    ['Hogar','Digitel YG','🏠 Hogar',1,5,'VES-BCV',2,'Binance Earn USDt','Fijo','',''],
    ['Hogar','Gastos corrientes VZ','🏠 Hogar',1,1,'VES-BCV',170,'Banesco','Variable','','Ajustar según mes'],
    ['Obligaciones','IVSS','📋 Obligaciones',1,1,'VES-BCV',1,'Banesco','Fijo','','Seguro social'],
    ['Obligaciones','ISLR','📋 Obligaciones',1,1,'VES-BCV',5,'Banesco','Variable','','Impuesto renta'],
    ['Obligaciones','Abono TDC Visa','📋 Obligaciones',1,11,'VES-BCV',30,'Banesco','Fijo','',''],
    ['Obligaciones','Abono TDC Master','📋 Obligaciones',1,11,'VES-BCV',30,'Banesco','Fijo','',''],
    ['Obligaciones','Facebank mantenimiento','📋 Obligaciones',1,1,'USD',6.67,'Facebank','Fijo',20,'Trimestral $20'],
    ['Familia','Diezmo','🎁 Familia',1,1,'VES-BCV',170,'Banesco','Fijo','',''],
    // PRIORIDAD 2
    ['Fondo de Emergencia','Emergencia USD','💰 Ahorro',2,1,'USDC',20,'Facebank','Ahorro','',''],
    ['Fondo de Emergencia','Emergencia DOC','💰 Ahorro',2,1,'USDC',50,'Belo','Ahorro','',''],
    ['Fondo de Emergencia','Emergencia USDC','💰 Ahorro',2,1,'USDC',20,'Bitget Earn USDC','Ahorro','',''],
    ['Bitcoin','Reto Bitcoin 365 (Binance)','📈 Inversiones',2,1,'USDC',31,'Binance','Inversión','',''],
    ['Bitcoin','Reto Bitcoin 365 (Belo)','📈 Inversiones',2,1,'USDC',31,'Belo','Inversión','',''],
    ['Suscripciones digitales','Netflix','📱 Subs digitales',2,1,'USD',15,'Zinli','Fijo','',''],
    ['Suscripciones digitales','HBO','📱 Subs digitales',2,1,'USD',5.99,'Zinli','Fijo','',''],
    ['Suscripciones digitales','Claude AI','📱 Subs digitales',2,1,'USD',20,'Zinli','Fijo','',''],
    ['Suscripciones digitales','Google One','📱 Subs digitales',2,1,'USD',19.99,'Facebank','Fijo','',''],
    ['Suscripciones digitales','Amazon Prime','📱 Subs digitales',2,1,'USD',7.99,'Zinli','Fijo','',''],
    ['Suscripciones digitales','Zinli sub','📱 Subs digitales',2,1,'USD',0.99,'Zinli','Fijo','',''],
    ['Suscripciones anuales','Canva','📅 Subs anuales',2,1,'USDt',2,'Bitget Earn USDt','Anual',24,'Pago anual $24'],
    ['Suscripciones anuales','Proton VPN','📅 Subs anuales',2,1,'USDt',8.99,'Bitget Earn USDt','Anual',107.88,'Pago anual $107.88'],
    ['Suscripciones anuales','Platzi','📅 Subs anuales',2,1,'USDt',5,'Bitget Earn USDt','Anual',60,'Pago anual $60'],
    ['Suscripciones anuales','Impuestos casa','📅 Subs anuales',2,1,'USDt',7,'Bitget Earn USDt','Anual',84,'Pago anual $84'],
    ['Cuidado personal','Entrenamientos','💆 Cuidado',2,1,'USDt',50,'Binance Earn USDt','Fijo','',''],
    ['Cuidado personal','English course','💆 Cuidado',2,1,'USDt',160,'Binance Earn USDt','Fijo','',''],
    ['Gastos personales','','👤 Personal',2,1,'VES-BCV',100,'Banesco','Presupuesto','','Monto fijo, uso variable'],
    // PRIORIDAD 3
    ['Comida','Mercado','🍽️ Comida',3,1,'VES-BCV',400,'Banesco','Presupuesto','','Ajustar según semanas'],
    ['Comida','Comer afuera','🍽️ Comida',3,1,'VES-BCV',30,'Banesco','Presupuesto','',''],
    ['Cuidado personal','Dermatologo','💆 Cuidado',3,1,'VES-BCV',100,'Banesco','Variable','','Ocasional'],
    ['Cuidado personal','Manicure','💆 Cuidado',3,1,'USDt',30,'Binance Earn USDt','Variable','',''],
    ['Bitcoin','Ahorro BTC','📈 Inversiones',3,1,'USDC',0,'Binance','Ocasional','','Monto variable'],
    ['Inversiones VZ','PerCapital','📈 Inversiones',3,1,'VES-BCV',25,'PerCapital','Inversión','','Casa de bolsa VZ'],
    ['Inversiones VZ','Mercosur','📈 Inversiones',3,1,'VES-BCV',25,'Mercosur','Inversión','','Casa de bolsa VZ'],
    ['Inversiones VZ','Rendivalores','📈 Inversiones',3,1,'VES-BCV',25,'Rendivalores','Inversión','','Casa de bolsa VZ'],
    ['Viaje Europa','','💰 Ahorro',3,1,'USDC',50,'Belo','Ahorro','','Meta largo plazo'],
  ];
}

// ══════════════════════════════════════════════
// GASTOS
// ══════════════════════════════════════════════
function crearGastos(ss) {
  dropSheet(ss, 'Gastos');
  var ws = ss.insertSheet('Gastos');
  ws.setFrozenRows(3);

  // Fila 1
  ws.getRange(1, 1, 1, 15).merge()
    .setValue('📋 REGISTRO DE GASTOS')
    .setBackground(BG_DARK).setFontColor(ACCENT)
    .setFontWeight('bold').setFontSize(14).setFontFamily('Arial')
    .setHorizontalAlignment('center');
  ws.setRowHeight(1, 32);

  // Fila 2 — controles
  ws.getRange(2, 1, 1, 3).merge().setValue('MES ACTIVO:')
    .setBackground(BG_DARK).setFontColor(MUTED).setFontWeight('bold')
    .setFontFamily('Arial').setFontSize(10).setHorizontalAlignment('right');

  ws.getRange(2, 4).setValue('2025-06')
    .setBackground(BG_DARK).setFontColor(ACCENT).setFontWeight('bold')
    .setFontSize(11).setFontFamily('Arial').setHorizontalAlignment('center');

  ws.getRange(2, 5, 1, 4).merge().setValue('← Cambia aquí (YYYY-MM)')
    .setBackground(BG_DARK).setFontColor(MUTED).setFontSize(9).setFontFamily('Arial');

  ws.getRange(2, 9, 1, 2).merge().setValue('INGRESO MES (USD):')
    .setBackground(BG_DARK).setFontColor(MUTED).setFontWeight('bold')
    .setFontFamily('Arial').setFontSize(10).setHorizontalAlignment('right');

  ws.getRange(2, 11).setValue(1700)
    .setBackground(BG_DARK).setFontColor(ACCENT).setFontWeight('bold')
    .setFontSize(12).setFontFamily('Arial').setHorizontalAlignment('center')
    .setNumberFormat('$#,##0.00');

  ws.getRange(2, 12, 1, 4).setBackground(BG_DARK);
  ws.setRowHeight(2, 22);

  // Fila 3 — headers
  var hdrs = ['Fecha','Descripción','Grupo','Sub-sobre','Categoría','Prioridad',
              'Bolsa','Moneda','Monto orig','Tasa','Total VES','Monto USD','Estado','Tipo','Notas'];
  var hdrRange = ws.getRange(3, 1, 1, 15);
  hdrRange.setValues([hdrs]);
  applyHeader(hdrRange);
  ws.setRowHeight(3, 20);

  // Validaciones
  var dvEstado = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Apartado','Pagado','Anulado'], true).build();
  ws.getRange('M4:M2000').setDataValidation(dvEstado);

  var dvPrio = SpreadsheetApp.newDataValidation()
    .requireValueInList(['🔴 Crítico','🟡 Importante','🟢 Flexible'], true).build();
  ws.getRange('F4:F2000').setDataValidation(dvPrio);

  // Formato condicional Estado
  var estadoRange = ws.getRange('M4:M2000');
  var rules = [];
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Pagado').setBackground(EMERALD).setRanges([estadoRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Apartado').setBackground(AMBER).setRanges([estadoRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Anulado').setBackground('#F5F5F5').setRanges([estadoRange]).build());
  ws.setConditionalFormatRules(rules);

  // Anchos
  [12,30,24,22,16,14,22,10,14,12,14,12,11,12,24].forEach(function(w, i) {
    ws.setColumnWidth(i + 1, w * 7);
  });

  // Demo data
  var gastos = [
    ['01/06/2025','Netflix junio','Suscripciones digitales','Netflix','📱 Subs digitales','🟡 Importante','Zinli','USD',15,1,'',15,'Pagado','Fijo',''],
    ['01/06/2025','HBO junio','Suscripciones digitales','HBO','📱 Subs digitales','🟡 Importante','Zinli','USD',5.99,1,'',5.99,'Pagado','Fijo',''],
    ['01/06/2025','Claude AI junio','Suscripciones digitales','Claude AI','📱 Subs digitales','🟡 Importante','Zinli','USD',20,1,'',20,'Pagado','Fijo',''],
    ['01/06/2025','Diezmo junio','Familia','Diezmo','🎁 Familia','🔴 Crítico','Banesco','VES-BCV',170,54.90,'',170,'Pagado','Fijo',''],
    ['01/06/2025','Emergencia USD — aporte','Fondo de Emergencia','Emergencia USD','💰 Ahorro','🟡 Importante','Facebank','USDC',20,1,'',20,'Pagado','Ahorro',''],
    ['03/06/2025','CANTV ABA junio','Hogar','CANTV ABA','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',25,54.90,'',25,'Pagado','Fijo',''],
    ['03/06/2025','Corpoelec junio','Hogar','Corpoelec','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',5,54.90,'',5,'Pagado','Fijo',''],
    ['03/06/2025','Movistar YG junio','Hogar','Movistar YG','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',10,54.90,'',10,'Pagado','Fijo',''],
    ['05/06/2025','Inter junio','Hogar','Inter','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',40,54.90,'',40,'Pagado','Fijo',''],
    ['05/06/2025','Digitel YG junio','Hogar','Digitel YG','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',2,54.90,'',2,'Pagado','Fijo',''],
    ['05/06/2025','Mercado semana 1','Comida','Mercado','🍽️ Comida','🟢 Flexible','Banesco','VES-BCV',120,54.90,'',120,'Pagado','Presupuesto',''],
    ['08/06/2025','Canva — reserva','Suscripciones anuales','Canva','📅 Subs anuales','🟡 Importante','Bitget Earn USDt','USDt',2,1,'',2,'Pagado','Anual',''],
    ['08/06/2025','Proton VPN — reserva','Suscripciones anuales','Proton VPN','📅 Subs anuales','🟡 Importante','Bitget Earn USDt','USDt',8.99,1,'',8.99,'Pagado','Anual',''],
    ['08/06/2025','Platzi — reserva','Suscripciones anuales','Platzi','📅 Subs anuales','🟡 Importante','Bitget Earn USDt','USDt',5,1,'',5,'Pagado','Anual',''],
    ['10/06/2025','Entrenamientos junio','Cuidado personal','Entrenamientos','💆 Cuidado','🟡 Importante','Binance Earn USDt','USDt',50,1,'',50,'Pagado','Fijo',''],
    ['10/06/2025','Reto Bitcoin (Binance)','Bitcoin','Reto Bitcoin 365 (Binance)','📈 Inversiones','🟡 Importante','Binance','USDC',31,1,'',31,'Pagado','Inversión',''],
    ['10/06/2025','Reto Bitcoin (Belo)','Bitcoin','Reto Bitcoin 365 (Belo)','📈 Inversiones','🟡 Importante','Belo','USDC',31,1,'',31,'Pagado','Inversión',''],
    ['11/06/2025','Abono TDC Visa','Obligaciones','Abono TDC Visa','📋 Obligaciones','🔴 Crítico','Banesco','VES-BCV',30,55.20,'',30,'Pagado','Fijo',''],
    ['11/06/2025','Abono TDC Master','Obligaciones','Abono TDC Master','📋 Obligaciones','🔴 Crítico','Banesco','VES-BCV',30,55.20,'',30,'Pagado','Fijo',''],
    ['12/06/2025','English course','Cuidado personal','English course','💆 Cuidado','🟡 Importante','Binance Earn USDt','USDt',110,1,'',110,'Pagado','Fijo','Parcial'],
    ['12/06/2025','Mercado semana 2','Comida','Mercado','🍽️ Comida','🟢 Flexible','Banesco','VES-BCV',90,55.20,'',90,'Pagado','Presupuesto',''],
    ['12/06/2025','PerCapital junio','Inversiones VZ','PerCapital','📈 Inversiones','🟢 Flexible','PerCapital','VES-BCV',25,55.20,'',25,'Pagado','Inversión',''],
    ['17/06/2025','Condominio junio','Hogar','Condominio','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',65,55.20,'',65,'Apartado','Fijo',''],
    ['20/06/2025','Impuestos casa — reserva','Suscripciones anuales','Impuestos casa','📅 Subs anuales','🟡 Importante','Bitget Earn USDt','USDt',7,1,'',7,'Apartado','Anual',''],
    ['22/06/2025','Mercado semana 3','Comida','Mercado','🍽️ Comida','🟢 Flexible','Banesco','VES-BCV',120,'','',120,'Apartado','Presupuesto','Tasa pendiente'],
    ['25/06/2025','Movistar YL junio','Hogar','Movistar YL','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',10,'','',10,'Apartado','Fijo',''],
    ['28/06/2025','Dermatologo','Cuidado personal','Dermatologo','💆 Cuidado','🟢 Flexible','Banesco','VES-BCV',100,'','',100,'Apartado','Variable',''],
  ];

  var estadoBgs = {'Pagado': EMERALD, 'Apartado': AMBER, 'Anulado': '#F5F5F5'};
  var prioBgs   = {'🔴 Crítico':'#FFF5F5','🟡 Importante':'#FFFEF0','🟢 Flexible':'#F0FFF5'};

  gastos.forEach(function(g, i) {
    var row = i + 4;
    var bg  = i % 2 === 0 ? ALT_ROW : WHITE;
    ws.getRange(row, 1, 1, 15).setValues([g]);
    styleDataRow(ws, row, 15, bg);
    ws.setRowHeight(row, 18);
    ws.getRange(row, 1).setNumberFormat('DD/MM/YYYY');
    ws.getRange(row, 9).setNumberFormat('$#,##0.00').setFontColor('#0000FF');
    ws.getRange(row, 10).setNumberFormat('#,##0.00').setFontColor('#0000FF');
    ws.getRange(row, 12).setNumberFormat('$#,##0.00');
    ws.getRange(row, 13)
      .setBackground(estadoBgs[g[12]] || WHITE)
      .setFontWeight('bold').setHorizontalAlignment('center');
    ws.getRange(row, 6)
      .setBackground(prioBgs[g[5]] || WHITE)
      .setFontWeight('bold').setHorizontalAlignment('center');
  });
}

// ══════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════
function crearDashboard(ss) {
  dropSheet(ss, 'Dashboard');
  var ws = ss.insertSheet('Dashboard');

  // Título
  ws.getRange(1, 1, 1, 12).merge()
    .setValue('📊 DASHBOARD MENSUAL')
    .setBackground(BG_DARK).setFontColor(ACCENT)
    .setFontWeight('bold').setFontSize(16).setFontFamily('Arial')
    .setHorizontalAlignment('center');
  ws.setRowHeight(1, 36);

  ws.setRowHeight(2, 6);

  // ── KPI cards (filas 3-4, 4 tarjetas) ──
  var kpis = [
    {lr:'A3:C3', vr:'A4:C4', label:'INGRESO MES',  formula:'=Gastos!K2'},
    {lr:'D3:F3', vr:'D4:F4', label:'PAGADO',        formula:'=SUMIF(Gastos!M4:M2000,"Pagado",Gastos!L4:L2000)'},
    {lr:'G3:I3', vr:'G4:I4', label:'APARTADO',      formula:'=SUMIF(Gastos!M4:M2000,"Apartado",Gastos!L4:L2000)'},
    {lr:'J3:L3', vr:'J4:L4', label:'LIBRE',
     formula:'=Gastos!K2-SUMIF(Gastos!M4:M2000,"Pagado",Gastos!L4:L2000)-SUMIF(Gastos!M4:M2000,"Apartado",Gastos!L4:L2000)'},
  ];

  ws.setRowHeight(3, 20);
  ws.setRowHeight(4, 34);

  kpis.forEach(function(k) {
    ws.getRange(k.lr).merge()
      .setValue(k.label)
      .setBackground(BG_DARK).setFontColor(MUTED)
      .setFontWeight('bold').setFontSize(9).setFontFamily('Arial')
      .setHorizontalAlignment('center').setVerticalAlignment('middle');

    ws.getRange(k.vr).merge()
      .setFormula(f(k.formula))
      .setBackground('#1A1917').setFontColor(ACCENT)
      .setFontWeight('bold').setFontSize(20).setFontFamily('Arial')
      .setHorizontalAlignment('center').setVerticalAlignment('middle')
      .setNumberFormat('$#,##0.00');
  });

  ws.setRowHeight(5, 10);

  // ── Resumen por categoría (fila 6+) ──
  secTitle(ws, 6, 1, 7, '  RESUMEN POR CATEGORÍA');

  var catHdrs = ['Categoría','Asignado','Pagado','Apartado','Disponible','% Ejec.','Estado'];
  var catHdrRange = ws.getRange(7, 1, 1, 7);
  catHdrRange.setValues([catHdrs]);
  applyHeader(catHdrRange, '#2E2D2A');
  ws.setRowHeight(7, 20);

  var cats = [
    ['🏠 Hogar',347], ['🍽️ Comida',430], ['📱 Subs digitales',75.95],
    ['📅 Subs anuales',22.99], ['💆 Cuidado',340], ['💰 Ahorro',206],
    ['📈 Inversiones',112], ['📋 Obligaciones',96.67], ['🎁 Familia',170],
    ['👤 Personal',100]
  ];

  cats.forEach(function(cat, i) {
    var r   = 8 + i;
    var bg  = i % 2 === 0 ? ALT_ROW : WHITE;
    var cs  = cat[0];
    ws.setRowHeight(r, 18);

    ws.getRange(r,1).setValue(cs).setFontWeight('bold').setFontFamily('Arial').setFontSize(10)
      .setBackground(bg).setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,2).setValue(cat[1]).setFontColor('#0000FF').setNumberFormat('$#,##0.00')
      .setHorizontalAlignment('right').setBackground(bg)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,3).setFormula(f('=SUMPRODUCT((Gastos!E4:E2000="'+cs+'")*(Gastos!M4:M2000="Pagado")*(Gastos!L4:L2000))'))
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground(EMERALD)
      .setHorizontalAlignment('right')
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,4).setFormula(f('=SUMPRODUCT((Gastos!E4:E2000="'+cs+'")*(Gastos!M4:M2000="Apartado")*(Gastos!L4:L2000))'))
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground(AMBER)
      .setHorizontalAlignment('right')
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,5).setFormula(f('=B'+r+'-C'+r+'-D'+r))
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground('#F0F4FF')
      .setHorizontalAlignment('right')
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,6).setFormula(f('=IF(B'+r+'>0,C'+r+'/B'+r+',0)'))
      .setFontColor('#000000').setNumberFormat('0%').setBackground(bg)
      .setHorizontalAlignment('center')
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,7).setFormula(f('=IF(C'+r+'>=B'+r+',"✅ OK",IF(D'+r+'>0,"🕐 Pendiente",IF(C'+r+'>0,"⏳ En curso","⬜ Sin iniciar")))'))
      .setHorizontalAlignment('center').setBackground(bg).setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
  });

  // Fila de totales
  var tr = 8 + cats.length;
  ws.getRange(tr, 1).setValue('TOTAL').setFontWeight('bold')
    .setBackground(BG_DARK).setFontColor(WHITE).setFontFamily('Arial').setFontSize(10)
    .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
  ['=SUM(B8:B'+(tr-1)+')','=SUM(C8:C'+(tr-1)+')','=SUM(D8:D'+(tr-1)+')','=SUM(E8:E'+(tr-1)+')']
    .forEach(function(formula, i) {
      ws.getRange(tr, 2+i).setFormula(f(formula)).setBackground(BG_DARK).setFontColor(ACCENT)
        .setFontWeight('bold').setNumberFormat('$#,##0.00').setHorizontalAlignment('right')
        .setFontFamily('Arial').setFontSize(10)
        .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    });
  ws.getRange(tr, 6, 1, 2).setBackground(BG_DARK);
  ws.setRowHeight(tr, 22);

  // ── Fondo de Emergencia consolidado ──
  var er = tr + 2;
  secTitle(ws, er, 1, 7, '  FONDO DE EMERGENCIA — TOTAL CONSOLIDADO', GREEN);

  var eHdrs = ['Moneda','Bolsa','Acumulado (USD)'];
  var eHdrRange = ws.getRange(er + 1, 1, 1, 3);
  eHdrRange.setValues([eHdrs]);
  applyHeader(eHdrRange, '#2E6B5E');
  ws.setRowHeight(er + 1, 18);

  var eFondos = [
    ['USD', 'Facebank', '=SUMPRODUCT((Gastos!D4:D2000="Emergencia USD")*(Gastos!L4:L2000))'],
    ['DOC', 'Belo',     '=SUMPRODUCT((Gastos!D4:D2000="Emergencia DOC")*(Gastos!L4:L2000))'],
    ['USDC','Bitget Earn USDC','=SUMPRODUCT((Gastos!D4:D2000="Emergencia USDC")*(Gastos!L4:L2000))'],
  ];
  eFondos.forEach(function(e, i) {
    var r  = er + 2 + i;
    var bg = i % 2 === 0 ? '#F0FFF8' : WHITE;
    ws.getRange(r, 1).setValue(e[0]).setFontFamily('Arial').setFontSize(10).setBackground(bg)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r, 2).setValue(e[1]).setFontFamily('Arial').setFontSize(10).setBackground(bg)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r, 3).setFormula(f(e[2])).setFontColor('#000000').setNumberFormat('$#,##0.00')
      .setHorizontalAlignment('right').setBackground(EMERALD).setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.setRowHeight(r, 18);
  });

  var totalER = er + 2 + eFondos.length;
  ws.getRange(totalER, 1, 1, 2).merge().setValue('TOTAL EMERGENCIA (USD equiv.)')
    .setFontWeight('bold').setBackground(BG_DARK).setFontColor(WHITE)
    .setFontFamily('Arial').setFontSize(10)
    .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
  ws.getRange(totalER, 3)
    .setFormula(f('=SUM(C' + (er+2) + ':C' + (totalER-1) + '))')
    .setFontWeight('bold').setFontColor(ACCENT).setBackground(BG_DARK)
    .setNumberFormat('$#,##0.00').setHorizontalAlignment('right')
    .setFontFamily('Arial').setFontSize(11)
    .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
  ws.setRowHeight(totalER, 22);

  // ── Suscripciones anuales ──
  var ar = totalER + 2;
  secTitle(ws, ar, 1, 7, '  ACUMULADO — SUSCRIPCIONES ANUALES', '#7AB89E');

  var aHdrs = ['Suscripción','Reserva/mes','Meta anual','Acumulado','Faltan','Progreso','Estado'];
  var aHdrRange = ws.getRange(ar + 1, 1, 1, 7);
  aHdrRange.setValues([aHdrs]);
  applyHeader(aHdrRange, '#2E6B5E');
  ws.setRowHeight(ar + 1, 18);

  var anuals = [['Canva',2,24],['Proton VPN',8.99,107.88],['Platzi',5,60],['Impuestos casa',7,84]];
  anuals.forEach(function(a, i) {
    var r  = ar + 2 + i;
    var bg = i % 2 === 0 ? '#F0FFF8' : WHITE;
    ws.setRowHeight(r, 18);
    ws.getRange(r,1).setValue(a[0]).setFontWeight('bold').setBackground(bg)
      .setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,2).setValue(a[1]).setFontColor('#0000FF').setNumberFormat('$#,##0.00')
      .setBackground(bg).setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,3).setValue(a[2]).setFontColor('#0000FF').setNumberFormat('$#,##0.00')
      .setBackground(bg).setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,4).setFormula(f('=SUMPRODUCT((Gastos!D4:D2000="'+a[0]+'")*(Gastos!L4:L2000))'))
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground(EMERALD)
      .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,5).setFormula(f('=C'+r+'-D'+r))
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground(bg)
      .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,6).setFormula(f('=IF(C'+r+'>0,D'+r+'/C'+r+',0)'))
      .setFontColor('#000000').setNumberFormat('0.0%').setBackground(bg)
      .setHorizontalAlignment('center').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,7).setFormula(f('=IF(D'+r+'>=C'+r+',"✅ Listo","⏳ Acumulando")'))
      .setHorizontalAlignment('center').setBackground(bg).setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
  });

  // Anchos Dashboard
  [22,14,14,14,14,12,16].forEach(function(w, i) {
    ws.setColumnWidth(i + 1, w * 7);
  });
}

// ══════════════════════════════════════════════
// TASAS
// ══════════════════════════════════════════════
function crearTasas(ss) {
  dropSheet(ss, 'Tasas');
  var ws = ss.insertSheet('Tasas');

  ws.getRange(1, 1, 1, 6).merge()
    .setValue('💱 REGISTRO DE TASAS DE CAMBIO')
    .setBackground(BG_DARK).setFontColor(ACCENT)
    .setFontWeight('bold').setFontSize(13).setFontFamily('Arial')
    .setHorizontalAlignment('center');
  ws.setRowHeight(1, 28);

  var hdrs = ['Fecha','BCV USD/VES','BCV EUR/VES','USDt/VES (P2P)','Fuente','Notas'];
  var hdrRange = ws.getRange(2, 1, 1, 6);
  hdrRange.setValues([hdrs]);
  applyHeader(hdrRange);
  ws.setRowHeight(2, 20);

  var tasas = [
    ['14/06/2025',55.20,60.10,56.80,'BCV oficial',''],
    ['07/06/2025',54.90,59.80,56.50,'BCV oficial',''],
    ['01/06/2025',54.20,59.10,55.90,'BCV oficial','Inicio mes'],
  ];
  tasas.forEach(function(t, i) {
    var r  = i + 3;
    var bg = i % 2 === 0 ? ALT_ROW : WHITE;
    ws.getRange(r, 1, 1, 6).setValues([t]);
    styleDataRow(ws, r, 6, bg);
    ws.getRange(r, 1).setNumberFormat('DD/MM/YYYY');
    ws.getRange(r, 2, 1, 3).setFontColor('#0000FF').setNumberFormat('#,##0.00').setHorizontalAlignment('right');
    ws.setRowHeight(r, 18);
  });

  ws.getRange(7, 1, 1, 6).merge()
    .setValue('💡 USDC, USDt y DOC se tratan 1:1 con USD en toda la contabilidad.')
    .setBackground('#FFF8E1').setFontColor(MUTED).setFontSize(9).setFontFamily('Arial');
  ws.setRowHeight(7, 18);

  [14,16,16,16,18,28].forEach(function(w, i) { ws.setColumnWidth(i + 1, w * 7); });
}

// ══════════════════════════════════════════════
// BOLSAS
// ══════════════════════════════════════════════
function crearBolsas(ss) {
  dropSheet(ss, 'Bolsas');
  var ws = ss.insertSheet('Bolsas');

  ws.getRange(1, 1, 1, 8).merge()
    .setValue('💳 REGISTRO DE BOLSAS')
    .setBackground(BG_DARK).setFontColor(ACCENT)
    .setFontWeight('bold').setFontSize(13).setFontFamily('Arial')
    .setHorizontalAlignment('center');
  ws.setRowHeight(1, 28);

  var hdrs = ['ID','Nombre','Plataforma','Moneda','Saldo actual','Propósito','Actualizado','Notas'];
  var hdrRange = ws.getRange(2, 1, 1, 8);
  hdrRange.setValues([hdrs]);
  applyHeader(hdrRange);
  ws.setRowHeight(2, 20);

  var bolsas = [
    ['B01','Earn USDC','Binance','USDC',245,'Servicios operativos','14/06/2025',''],
    ['B02','Earn USDt','Binance','USDt',180,'Pagos VES','14/06/2025',''],
    ['B03','Spot USDC','Binance','USDC',30,'Bitcoin','14/06/2025',''],
    ['B04','Earn USDC','Bitget','USDC',120,'Fondo emergencia','14/06/2025',''],
    ['B05','Earn USDt','Bitget','USDt',84,'Subs anuales','14/06/2025',''],
    ['B06','Zinli','Zinli','USD',90,'Subs digitales','14/06/2025',''],
    ['B07','Facebank','Facebank','USD',200,'Reserva USD','14/06/2025',''],
    ['B08','Belo','Belo','DOC',400,'Ahorros DOC — 1:1 USD','14/06/2025',''],
    ['B09','Banesco','Banesco','VES',0,'Pagos corrientes VZ','14/06/2025','Saldo en Bs'],
    ['B10','PerCapital','PerCapital','VES',0,'Casa de bolsa VZ','14/06/2025','Saldo en Bs'],
    ['B11','Mercosur','Mercosur','VES',0,'Casa de bolsa VZ','14/06/2025','Saldo en Bs'],
    ['B12','Rendivalores','Rendivalores','VES',0,'Casa de bolsa VZ','14/06/2025','Saldo en Bs'],
  ];
  bolsas.forEach(function(b, i) {
    var r  = i + 3;
    var bg = i % 2 === 0 ? ALT_ROW : WHITE;
    ws.getRange(r, 1, 1, 8).setValues([b]);
    styleDataRow(ws, r, 8, bg);
    ws.getRange(r, 5).setFontColor('#0000FF').setNumberFormat('#,##0.00').setHorizontalAlignment('right');
    ws.getRange(r, 7).setNumberFormat('DD/MM/YYYY').setHorizontalAlignment('center');
    ws.setRowHeight(r, 18);
  });

  [6,16,14,8,14,26,14,24].forEach(function(w, i) { ws.setColumnWidth(i + 1, w * 7); });
}

// ══════════════════════════════════════════════
// CIERRE MES
// ══════════════════════════════════════════════
function crearCierreMes(ss) {
  dropSheet(ss, 'Cierre Mes');
  var ws = ss.insertSheet('Cierre Mes');

  ws.getRange(1, 1, 1, 7).merge()
    .setValue('🔒 CIERRE Y APERTURA DE MES')
    .setBackground(BG_DARK).setFontColor(ACCENT)
    .setFontWeight('bold').setFontSize(14).setFontFamily('Arial')
    .setHorizontalAlignment('center');
  ws.setRowHeight(1, 30);

  var instrucciones = [
    'INSTRUCCIONES PARA CERRAR EL MES:',
    '1. Verifica que todos los gastos "Apartado" estén resueltos (pagados o anulados)',
    '2. Revisa el resumen abajo — ¿hay sobres excedidos?',
    '3. Copia la pestaña "Gastos" y renómbrala (ej: Gastos-2025-06)',
    '4. Limpia la pestaña "Gastos" y carga el nuevo mes desde la app HTML',
    '5. Actualiza el mes en Gastos!D2 y el ingreso en Gastos!K2',
    '6. Los "Apartados" sin pagar pasan al nuevo mes — cópialos manualmente',
  ];
  instrucciones.forEach(function(txt, i) {
    var r = i + 2;
    ws.getRange(r, 1, 1, 7).merge().setValue(txt)
      .setFontFamily('Arial').setFontSize(10)
      .setFontWeight(i === 0 ? 'bold' : 'normal')
      .setFontColor(i === 0 ? ACCENT : '#333333')
      .setBackground(i === 0 ? BG_DARK : (i % 2 === 0 ? '#F5F3EE' : WHITE))
      .setHorizontalAlignment('left');
    ws.setRowHeight(r, 18);
  });

  secTitle(ws, 10, 1, 7, '  RESUMEN DE CIERRE');

  var cHdrs = ['Grupo / Sobre','Categoría','Asignado','Pagado','Apartado','Sobrante','Estado'];
  var cHdrRange = ws.getRange(11, 1, 1, 7);
  cHdrRange.setValues([cHdrs]);
  applyHeader(cHdrRange);
  ws.setRowHeight(11, 20);

  var sobres = [
    ['Hogar','🏠 Hogar',347],
    ['Comida','🍽️ Comida',430],
    ['Suscripciones digitales','📱 Subs',75.95],
    ['Suscripciones anuales','📅 Subs anuales',22.99],
    ['Cuidado personal','💆 Cuidado',340],
    ['Fondo de Emergencia','💰 Ahorro',90],
    ['Bitcoin','📈 Inversiones',62],
    ['Inversiones VZ','📈 Inversiones',75],
    ['Obligaciones','📋 Obligaciones',96.67],
    ['Familia','🎁 Familia',170],
    ['Gastos personales','👤 Personal',100],
  ];
  sobres.forEach(function(s, i) {
    var r  = 12 + i;
    var bg = i % 2 === 0 ? ALT_ROW : WHITE;
    ws.setRowHeight(r, 18);
    ws.getRange(r,1).setValue(s[0]).setFontWeight('bold').setBackground(bg)
      .setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,2).setValue(s[1]).setBackground(bg).setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,3).setValue(s[2]).setFontColor('#0000FF').setNumberFormat('$#,##0.00')
      .setHorizontalAlignment('right').setBackground(bg).setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,4).setFormula(f('=SUMPRODUCT((Gastos!C4:C2000="'+s[0]+'")*(Gastos!M4:M2000="Pagado")*(Gastos!L4:L2000))'))
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground(EMERALD)
      .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,5).setFormula(f('=SUMPRODUCT((Gastos!C4:C2000="'+s[0]+'")*(Gastos!M4:M2000="Apartado")*(Gastos!L4:L2000))'))
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground(AMBER)
      .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,6).setFormula(f('=C'+r+'-D'+r+'-E'+r))
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground('#F0F4FF')
      .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,7).setFormula(f('=IF(D'+r+'>=C'+r+',"✅ OK",IF(E'+r+'>0,"🕐 Pendiente",IF(D'+r+'>0,"⏳ Parcial","⬜ Sin pagar")))'))
      .setHorizontalAlignment('center').setBackground(bg).setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
  });

  [24,18,13,13,13,13,14].forEach(function(w, i) { ws.setColumnWidth(i + 1, w * 7); });
}

// ══════════════════════════════════════════════
// CONFIG
// ══════════════════════════════════════════════
function crearConfig(ss) {
  dropSheet(ss, 'Config');
  var ws = ss.insertSheet('Config');

  ws.getRange(1, 1, 1, 3).merge()
    .setValue('⚙️ CONFIGURACIÓN — CONEXIÓN CON APP HTML')
    .setBackground(BG_DARK).setFontColor(ACCENT)
    .setFontWeight('bold').setFontSize(13).setFontFamily('Arial')
    .setHorizontalAlignment('center');
  ws.setRowHeight(1, 28);

  var cfg = [
    ['Sheet ID', ss.getId(), 'Copia este valor en la app HTML → Setup'],
    ['Moneda base', 'USDC', 'Moneda de referencia para contabilidad'],
    ['Paridad stablecoins', '1:1', 'USDC = USDt = DOC = 1 USD'],
    ['Mes activo', '2025-06', 'Se actualiza manualmente en Gastos!D2'],
    ['Última tasa BCV', '=IF(COUNTA(Tasas!B3:B100)>0,INDEX(Tasas!B3:B100,MATCH(MAX(Tasas!A3:A100),Tasas!A3:A100,0)),"—")', 'Auto-calculado desde Tasas'],
    ['URL App HTML', 'https://yangetze.github.io/finanzas', 'URL de tu app publicada'],
  ];

  cfg.forEach(function(c, i) {
    var r  = i + 2;
    var bg = i % 2 === 0 ? ALT_ROW : WHITE;
    ws.getRange(r, 1).setValue(c[0]).setFontWeight('bold').setBackground(bg)
      .setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    if (typeof c[1] === 'string' && c[1].indexOf('=') === 0) {
      ws.getRange(r, 2).setFormula(f(c[1]));
    } else {
      ws.getRange(r, 2).setValue(c[1]);
    }
    ws.getRange(r, 2)
      .setFontColor(i === 0 ? ACCENT : '#0000FF')
      .setBackground(bg).setFontFamily('Arial').setFontSize(10)
      .setFontWeight(i === 0 ? 'bold' : 'normal')
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r, 3).setValue(c[2]).setFontColor(MUTED).setBackground(bg)
      .setFontFamily('Arial').setFontSize(9)
      .setBorder(true,true,true,true,true,true,BORDER_C,SpreadsheetApp.BorderStyle.SOLID);
    ws.setRowHeight(r, 20);
  });

  ws.setColumnWidth(1, 160);
  ws.setColumnWidth(2, 300);
  ws.setColumnWidth(3, 240);
}

// ══════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ══════════════════════════════════════════════
function setupCompleto() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();

  ss.rename('💰 Finanzas — Sobres Digitales');
  ui.alert('⏳ Creando el sistema... puede tardar 20-30 segundos. No cierres esta ventana.');

  crearConfig(ss);
  crearPlantilla(ss);
  crearGastos(ss);
  crearDashboard(ss);
  crearTasas(ss);
  crearBolsas(ss);
  crearCierreMes(ss);

  // Reordenar pestañas
  var orden = ['Config','Dashboard','Gastos','Plantilla','Tasas','Bolsas','Cierre Mes'];
  orden.forEach(function(name, i) {
    var s = ss.getSheetByName(name);
    if (s) { ss.setActiveSheet(s); ss.moveActiveSheet(i + 1); }
  });

  // Eliminar hoja vacía por defecto
  ['Hoja 1','Sheet1','Hoja1'].forEach(function(n) {
    var s = ss.getSheetByName(n);
    if (s && s.getLastRow() === 0) ss.deleteSheet(s);
  });

  ss.setActiveSheet(ss.getSheetByName('Dashboard'));

  ui.alert(
    '✅ Sistema creado exitosamente!\n\n' +
    'Pestañas: Config · Dashboard · Gastos · Plantilla · Tasas · Bolsas · Cierre Mes\n\n' +
    'Tu Sheet ID está en la pestaña Config.\n' +
    'Cópialo en la app HTML → botón "Conectar Sheet".'
  );
}

// ── Abrir nuevo mes ──
function abrirNuevoMes() {
  var ss  = SpreadsheetApp.getActiveSpreadsheet();
  var ui  = SpreadsheetApp.getUi();
  var res = ui.prompt('📅 Abrir nuevo mes', 'Ingresa el mes (YYYY-MM):', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;

  var nuevoMes = res.getResponseText().trim();
  if (!/^\d{4}-\d{2}$/.test(nuevoMes)) { ui.alert('Formato inválido. Usa YYYY-MM (ej: 2025-07)'); return; }

  var gastos = ss.getSheetByName('Gastos');
  if (!gastos) { ui.alert('No se encontró la pestaña Gastos'); return; }

  var mesCurrent = gastos.getRange('D2').getValue();
  var copia = gastos.copyTo(ss);
  copia.setName('Gastos-' + mesCurrent);
  ss.moveActiveSheet(ss.getNumSheets());

  var lastRow = gastos.getLastRow();
  if (lastRow > 3) gastos.deleteRows(4, lastRow - 3);
  gastos.getRange('D2').setValue(nuevoMes);

  ui.alert(
    '✅ Mes ' + nuevoMes + ' abierto.\n\n' +
    'El mes anterior quedó archivado como "Gastos-' + mesCurrent + '".\n' +
    'Carga la nueva plantilla desde la app HTML → pestaña "📅 Mes" → Abrir nuevo mes.'
  );
}
