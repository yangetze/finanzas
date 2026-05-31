/**
 * SOBRES DIGITALES — Google Apps Script
 * ─────────────────────────────────────
 * INSTRUCCIONES:
 * 1. Abre tu Google Sheet (o crea uno nuevo en vacío)
 * 2. Ve a Extensiones → Apps Script
 * 3. Borra el contenido y pega TODO este código
 * 4. Guarda (Ctrl+S) y ejecuta la función: setupCompleto
 * 5. Acepta los permisos cuando te lo pida
 * 6. Listo — todas las pestañas se crean automáticamente
 *
 * DESPUÉS: copia el Sheet ID de la URL y pégalo en la app HTML.
 */

// ══════════════════════════════════════════════
// COLORES
// ══════════════════════════════════════════════
const C = {
  bgDark:   '#0F0E0C',
  header:   '#1A1917',
  accent:   '#C8B97A',
  green:    '#7AB89E',
  danger:   '#C87A7A',
  warn:     '#C8A07A',
  muted:    '#A09C90',
  white:    '#FFFFFF',
  lightBg:  '#F5F3EE',
  altRow:   '#FAFAF8',
  prio1:    '#F8D7DA',
  prio2:    '#FFF3CD',
  prio3:    '#D4EDDA',
  emerald:  '#E8F5E9',
  amber:    '#FFF8E1',
};

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function styleHeader(range, bg, fg) {
  bg = bg || C.header; fg = fg || C.white;
  range.setBackground(bg).setFontColor(fg).setFontWeight('bold')
       .setFontFamily('Arial').setFontSize(10)
       .setHorizontalAlignment('center').setVerticalAlignment('middle')
       .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
}

function styleCell(cell, opts) {
  opts = opts || {};
  if (opts.bg)      cell.setBackground(opts.bg);
  if (opts.fg)      cell.setFontColor(opts.fg);
  if (opts.bold)    cell.setFontWeight('bold');
  if (opts.size)    cell.setFontSize(opts.size);
  if (opts.align)   cell.setHorizontalAlignment(opts.align);
  if (opts.valign)  cell.setVerticalAlignment(opts.valign || 'middle');
  if (opts.wrap)    cell.setWrap(true);
  if (opts.format)  cell.setNumberFormat(opts.format);
  if (opts.border)  cell.setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
  cell.setFontFamily('Arial').setFontSize(opts.size || 10);
  return cell;
}

function sectionTitle(sheet, row, col, text, endCol, bg) {
  var range = sheet.getRange(row, col, 1, endCol - col + 1);
  range.merge().setValue(text)
       .setBackground(bg || C.accent).setFontColor(C.header)
       .setFontWeight('bold').setFontSize(10).setFontFamily('Arial')
       .setHorizontalAlignment('left').setVerticalAlignment('middle');
  sheet.setRowHeight(row, 22);
}

function deleteSheetIfExists(ss, name) {
  var s = ss.getSheetByName(name);
  if (s) ss.deleteSheet(s);
}

// ══════════════════════════════════════════════
// DATOS — PLANTILLA COMPLETA
// ══════════════════════════════════════════════
function getPlantillaData() {
  // [Grupo, Sub-sobre, Categoría, Prioridad, Día, Moneda, Monto/mes, Bolsa, Tipo, Monto anual, Notas]
  return [
    // ── PRIORIDAD 1 — CRÍTICO ──
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
    // ── PRIORIDAD 2 — IMPORTANTE ──
    ['Fondo de Emergencia','Emergencia USD','💰 Ahorro',2,1,'USDC',20,'Facebank','Ahorro','',''],
    ['Fondo de Emergencia','Emergencia DOC','💰 Ahorro',2,1,'USDC',50,'Belo','Ahorro','',''],
    ['Fondo de Emergencia','Emergencia USDC','💰 Ahorro',2,1,'USDC',20,'Bitget Earn USDC','Ahorro','',''],
    ['Suscripciones digitales','Netflix','📱 Subs digitales',2,1,'USD',15,'Zinli','Fijo','',''],
    ['Suscripciones digitales','HBO','📱 Subs digitales',2,1,'USD',5.99,'Zinli','Fijo','',''],
    ['Suscripciones digitales','Disney+','📱 Subs digitales',2,1,'USD',5.99,'Zinli','Fijo','',''],
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
    // ── PRIORIDAD 3 — FLEXIBLE ──
    ['Comida','Mercado','🍽️ Comida',3,1,'VES-BCV',400,'Banesco','Presupuesto','','Ajustar según semanas'],
    ['Comida','Comer afuera','🍽️ Comida',3,1,'VES-BCV',30,'Banesco','Presupuesto','',''],
    ['Cuidado personal','Dermatologo','💆 Cuidado',3,1,'VES-BCV',100,'Banesco','Variable','','Ocasional'],
    ['Cuidado personal','Manicure','💆 Cuidado',3,1,'USDt',30,'Binance Earn USDt','Variable','',''],
    ['Viaje Europa','','💰 Ahorro',3,1,'USDC',50,'Belo','Ahorro','','Meta largo plazo'],
    ['Bitcoin','Reto Bitcoin 365 (Binance)','📈 Inversiones',2,1,'USDC',31,'Binance','Inversión','',''],
    ['Bitcoin','Reto Bitcoin 365 (Belo)','📈 Inversiones',2,1,'USDC',31,'Belo','Inversión','',''],
    ['Bitcoin','Ahorro BTC','📈 Inversiones',3,1,'USDC',0,'Binance','Ocasional','','Gasto ocasional'],
    ['Inversiones VZ','PerCapital','📈 Inversiones',3,1,'VES-BCV',25,'PerCapital','Inversión','','Casa de bolsa VZ'],
    ['Inversiones VZ','Mercosur','📈 Inversiones',3,1,'VES-BCV',25,'Mercosur','Inversión','','Casa de bolsa VZ'],
    ['Inversiones VZ','Rendivalores','📈 Inversiones',3,1,'VES-BCV',25,'Rendivalores','Inversión','','Casa de bolsa VZ'],
    ['Gastos personales','','👤 Personal',2,1,'VES-BCV',100,'Banesco','Presupuesto','','Monto fijo mensual variable en uso'],
  ];
}

// ══════════════════════════════════════════════
// PESTAÑA: PLANTILLA
// ══════════════════════════════════════════════
function crearPlantilla(ss) {
  deleteSheetIfExists(ss, 'Plantilla');
  var ws = ss.insertSheet('Plantilla');
  ws.setFrozenRows(3);

  // Title
  ws.getRange('A1:L1').merge().setValue('💰 PLANTILLA MENSUAL — SOBRES DIGITALES')
    .setBackground(C.header).setFontColor(C.accent).setFontWeight('bold')
    .setFontSize(14).setFontFamily('Arial').setHorizontalAlignment('center');
  ws.setRowHeight(1, 32);

  ws.getRange('A2:L2').merge()
    .setValue('Campos en AZUL son editables. Carga esta plantilla al inicio de cada mes desde la pestaña Gastos.')
    .setBackground(C.header).setFontColor(C.muted).setFontSize(9).setFontFamily('Arial')
    .setHorizontalAlignment('center');
  ws.setRowHeight(2, 16);

  // Headers
  var headers = ['#','Grupo','Sub-sobre','Categoría','Prioridad','Día pago',
                 'Moneda','Monto/mes (USD)','Bolsa origen','Tipo','Monto anual','Notas'];
  styleHeader(ws.getRange(3, 1, 1, headers.length));
  ws.getRange(3, 1, 1, headers.length).setValues([headers]);
  ws.setRowHeight(3, 20);

  var data = getPlantillaData();
  var prioColors = {1: C.prio1, 2: C.prio2, 3: C.prio3};
  var prioLabels = {1: '🔴 Crítico', 2: '🟡 Importante', 3: '🟢 Flexible'};
  var currentPrio = null;
  var row = 4;

  data.forEach(function(d, i) {
    var prio = d[3];
    if (prio !== currentPrio) {
      currentPrio = prio;
      var secBg = prio === 1 ? C.accent : prio === 2 ? C.warn : C.green;
      sectionTitle(ws, row, 1, '  PRIORIDAD ' + prio + ' — ' + prioLabels[prio].toUpperCase(), 12, secBg);
      row++;
    }

    ws.setRowHeight(row, 18);
    var rowBg = i % 2 === 0 ? C.altRow : C.white;
    var vals = [i+1, d[0], d[1], d[2], prioLabels[prio], d[4], d[5], d[6], d[7], d[8], d[9]||'', d[10]];
    ws.getRange(row, 1, 1, 12).setValues([vals]).setFontFamily('Arial').setFontSize(10)
      .setVerticalAlignment('middle').setBackground(rowBg)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);

    // Priority cell color
    ws.getRange(row, 5).setBackground(prioColors[prio]).setFontWeight('bold').setHorizontalAlignment('center');
    // Amount in blue
    ws.getRange(row, 8).setFontColor('#0000FF').setHorizontalAlignment('right').setNumberFormat('$#,##0.00');
    ws.getRange(row, 11).setFontColor('#0000FF').setHorizontalAlignment('right').setNumberFormat('$#,##0.00');
    row++;
  });

  // Total row
  ws.getRange(row, 1, 1, 7).merge().setValue('TOTAL MENSUAL')
    .setBackground(C.header).setFontColor(C.white).setFontWeight('bold')
    .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10);
  ws.getRange(row, 8).setFormula('=SUM(H4:H' + (row-1) + ')')
    .setBackground(C.header).setFontColor(C.accent).setFontWeight('bold')
    .setFontSize(12).setNumberFormat('$#,##0.00').setHorizontalAlignment('center');
  ws.getRange(row, 9, 1, 4).setBackground(C.header);
  ws.setRowHeight(row, 24);

  // Column widths
  var widths = [4,22,20,16,14,8,10,14,22,12,12,28];
  widths.forEach(function(w, i) { ws.setColumnWidth(i+1, w*7); });
}

// ══════════════════════════════════════════════
// PESTAÑA: GASTOS
// ══════════════════════════════════════════════
function crearGastos(ss) {
  deleteSheetIfExists(ss, 'Gastos');
  var ws = ss.insertSheet('Gastos');
  ws.setFrozenRows(3);

  // Title
  ws.getRange('A1:O1').merge().setValue('📋 REGISTRO DE GASTOS')
    .setBackground(C.header).setFontColor(C.accent).setFontWeight('bold')
    .setFontSize(14).setFontFamily('Arial').setHorizontalAlignment('center');
  ws.setRowHeight(1, 32);

  // Controls row 2
  ws.getRange('A2:C2').merge().setValue('MES ACTIVO:')
    .setBackground(C.header).setFontColor(C.muted).setFontWeight('bold')
    .setFontFamily('Arial').setFontSize(10).setHorizontalAlignment('right');
  ws.getRange('D2').setValue('2025-06')
    .setBackground(C.header).setFontColor(C.accent).setFontWeight('bold')
    .setFontSize(11).setFontFamily('Arial').setHorizontalAlignment('center');
  ws.getRange('E2:H2').merge().setValue('← Cambia aquí el mes (YYYY-MM)')
    .setBackground(C.header).setFontColor(C.muted).setFontSize(9).setFontFamily('Arial');
  ws.getRange('I2:J2').merge().setValue('INGRESO MES (USD):')
    .setBackground(C.header).setFontColor(C.muted).setFontWeight('bold')
    .setFontFamily('Arial').setFontSize(10).setHorizontalAlignment('right');
  ws.getRange('K2').setValue(1700)
    .setBackground(C.header).setFontColor(C.accent).setFontWeight('bold')
    .setFontSize(12).setFontFamily('Arial').setHorizontalAlignment('center')
    .setNumberFormat('$#,##0.00');
  ws.getRange('L2:O2').setBackground(C.header);
  ws.setRowHeight(2, 22);

  // Headers
  var headers = ['Fecha','Descripción','Grupo','Sub-sobre','Categoría','Prioridad',
                 'Bolsa','Moneda','Monto (USD/orig)','Tasa BCV/USDt',
                 'Total VES','Monto USD','Estado','Tipo','Notas'];
  ws.getRange(3, 1, 1, 15).setValues([headers]);
  styleHeader(ws.getRange(3, 1, 1, 15));
  ws.setRowHeight(3, 20);

  // Data validation — Estado
  var dv = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Apartado','Pagado','Anulado'], true).build();
  ws.getRange('M4:M2000').setDataValidation(dv);

  // Data validation — Prioridad
  var dvP = SpreadsheetApp.newDataValidation()
    .requireValueInList(['🔴 Crítico','🟡 Importante','🟢 Flexible'], true).build();
  ws.getRange('F4:F2000').setDataValidation(dvP);

  // Demo data — June 2025
  var gastos = [
    ['01/06/2025','Netflix junio','Suscripciones digitales','Netflix','📱 Subs digitales','🟡 Importante','Zinli','USD',15,1,'',15,'Pagado','Fijo',''],
    ['01/06/2025','HBO junio','Suscripciones digitales','HBO','📱 Subs digitales','🟡 Importante','Zinli','USD',5.99,1,'',5.99,'Pagado','Fijo',''],
    ['01/06/2025','Claude AI junio','Suscripciones digitales','Claude AI','📱 Subs digitales','🟡 Importante','Zinli','USD',20,1,'',20,'Pagado','Fijo',''],
    ['01/06/2025','DCA Bitcoin','DCA Bitcoin','','💰 Ahorro','🟡 Importante','Binance Spot USDC','USDC',30,1,'',30,'Pagado','Inversión','Auto-buy'],
    ['01/06/2025','Reto Bitcoin','Reto Bitcoin','','💰 Ahorro','🟡 Importante','Belo','USDC',31,1,'',31,'Pagado','Inversión',''],
    ['01/06/2025','Diezmo junio','Familia','Diezmo','🎁 Familia','🔴 Crítico','Banesco','VES-BCV',170,54.90,'=I9*J9',170,'Pagado','Fijo',''],
    ['01/06/2025','Emergencia USD','Fondo de Emergencia','Emergencia USD','💰 Ahorro','🟡 Importante','Facebank','USDC',20,1,'',20,'Pagado','Ahorro',''],
    ['03/06/2025','CANTV ABA junio','Hogar','CANTV ABA','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',25,54.90,'=I12*J12',25,'Pagado','Fijo',''],
    ['03/06/2025','Corpoelec junio','Hogar','Corpoelec','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',5,54.90,'=I13*J13',5,'Pagado','Fijo',''],
    ['03/06/2025','Movistar YG junio','Hogar','Movistar YG','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',10,54.90,'=I14*J14',10,'Pagado','Fijo',''],
    ['05/06/2025','Inter junio','Hogar','Inter','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',40,54.90,'=I15*J15',40,'Pagado','Fijo',''],
    ['05/06/2025','Digitel YG junio','Hogar','Digitel YG','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',2,54.90,'=I16*J16',2,'Pagado','Fijo',''],
    ['05/06/2025','Mercado semana 1','Comida','Mercado','🍽️ Comida','🟢 Flexible','Banesco','VES-BCV',120,54.90,'=I17*J17',120,'Pagado','Presupuesto',''],
    ['08/06/2025','Canva — reserva','Suscripciones anuales','Canva','📅 Subs anuales','🟡 Importante','Bitget Earn USDt','USDt',2,1,'',2,'Pagado','Anual',''],
    ['08/06/2025','Proton VPN — reserva','Suscripciones anuales','Proton VPN','📅 Subs anuales','🟡 Importante','Bitget Earn USDt','USDt',8.99,1,'',8.99,'Pagado','Anual',''],
    ['08/06/2025','Platzi — reserva','Suscripciones anuales','Platzi','📅 Subs anuales','🟡 Importante','Bitget Earn USDt','USDt',5,1,'',5,'Pagado','Anual',''],
    ['10/06/2025','Entrenamientos junio','Cuidado personal','Entrenamientos','💆 Cuidado','🟡 Importante','Binance Earn USDt','USDt',50,1,'',50,'Pagado','Fijo',''],
    ['10/06/2025','PerCapital junio','PerCapital','','💰 Ahorro','🟢 Flexible','Binance Earn USDt','VES-BCV',25,54.90,'=I22*J22',25,'Pagado','Ahorro',''],
    ['11/06/2025','Abono TDC Visa','Obligaciones','Abono TDC Visa','📋 Obligaciones','🔴 Crítico','Banesco','VES-BCV',30,55.20,'=I23*J23',30,'Pagado','Fijo',''],
    ['11/06/2025','Abono TDC Master','Obligaciones','Abono TDC Master','📋 Obligaciones','🔴 Crítico','Banesco','VES-BCV',30,55.20,'=I24*J24',30,'Pagado','Fijo',''],
    ['12/06/2025','English course','Cuidado personal','English course','💆 Cuidado','🟡 Importante','Binance Earn USDt','USDt',110,1,'',110,'Pagado','Fijo','Parcial'],
    ['12/06/2025','Mercado semana 2','Comida','Mercado','🍽️ Comida','🟢 Flexible','Banesco','VES-BCV',90,55.20,'=I26*J26',90,'Pagado','Presupuesto',''],
    ['17/06/2025','Condominio junio','Hogar','Condominio','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',65,55.20,'=I27*J27',65,'Apartado','Fijo',''],
    ['20/06/2025','Impuestos casa — reserva','Suscripciones anuales','Impuestos casa','📅 Subs anuales','🟡 Importante','Bitget Earn USDt','USDt',7,1,'',7,'Apartado','Anual',''],
    ['22/06/2025','Mercado semana 3','Comida','Mercado','🍽️ Comida','🟢 Flexible','Banesco','VES-BCV',120,'','',120,'Apartado','Presupuesto','Tasa pendiente'],
    ['25/06/2025','Movistar YL junio','Hogar','Movistar YL','🏠 Hogar','🔴 Crítico','Banesco','VES-BCV',10,'','',10,'Apartado','Fijo',''],
    ['28/06/2025','Dermatologo','Cuidado personal','Dermatologo','💆 Cuidado','🟢 Flexible','Banesco','VES-BCV',100,'','',100,'Apartado','Variable',''],
  ];

  var estadoBg  = {'Pagado': C.emerald, 'Apartado': C.amber, 'Anulado': '#F5F5F5'};
  var prioBg    = {'🔴 Crítico': '#FFF5F5', '🟡 Importante': '#FFFEF0', '🟢 Flexible': '#F0FFF5'};

  gastos.forEach(function(g, i) {
    var r = i + 4;
    ws.getRange(r, 1, 1, 15).setValues([g]).setFontFamily('Arial').setFontSize(10)
      .setVerticalAlignment('middle')
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.setRowHeight(r, 18);

    // Date format
    ws.getRange(r, 1).setNumberFormat('DD/MM/YYYY');
    // Amounts
    ws.getRange(r, 9).setNumberFormat('$#,##0.00').setFontColor('#0000FF');
    ws.getRange(r, 10).setNumberFormat('#,##0.00').setFontColor('#0000FF');
    ws.getRange(r, 11).setNumberFormat('#,##0').setFontColor('#008000');
    ws.getRange(r, 12).setNumberFormat('$#,##0.00').setFontColor('#000000');
    // Estado color
    var estado = g[12];
    ws.getRange(r, 13).setBackground(estadoBg[estado] || C.white).setFontWeight('bold').setHorizontalAlignment('center');
    // Prioridad color
    var prio = g[5];
    ws.getRange(r, 6).setBackground(prioBg[prio] || C.white).setFontWeight('bold').setHorizontalAlignment('center');
    // Alternating bg for non-special cols
    var rowBg = i % 2 === 0 ? C.altRow : C.white;
    [1,2,3,4,5,7,8,14,15].forEach(function(c) { ws.getRange(r,c).setBackground(rowBg); });
  });

  // Conditional formatting — auto color Estado column future entries
  var estadoRange = ws.getRange('M4:M2000');
  var rules = ws.getConditionalFormatRules();
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Pagado').setBackground(C.emerald).setRanges([estadoRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Apartado').setBackground(C.amber).setRanges([estadoRange]).build());
  rules.push(SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo('Anulado').setBackground('#F5F5F5').setRanges([estadoRange]).build());
  ws.setConditionalFormatRules(rules);

  // Column widths
  var cw = [12,30,24,22,16,14,22,10,14,12,14,12,11,12,24];
  cw.forEach(function(w,i){ ws.setColumnWidth(i+1, w*7); });
}

// ══════════════════════════════════════════════
// PESTAÑA: DASHBOARD
// ══════════════════════════════════════════════
function crearDashboard(ss) {
  deleteSheetIfExists(ss, 'Dashboard');
  var ws = ss.insertSheet('Dashboard');

  ws.getRange('A1:L1').merge().setValue('📊 DASHBOARD MENSUAL')
    .setBackground(C.header).setFontColor(C.accent).setFontWeight('bold')
    .setFontSize(16).setFontFamily('Arial').setHorizontalAlignment('center');
  ws.setRowHeight(1, 36);

  // KPI cards
  var kpis = [
    ['A3:C4','INGRESO MES','=Gastos!K2'],
    ['D3:F4','TOTAL PAGADO','=SUMIF(Gastos!M4:M2000,"Pagado",Gastos!L4:L2000)'],
    ['G3:I4','APARTADO','=SUMIF(Gastos!M4:M2000,"Apartado",Gastos!L4:L2000)'],
    ['J3:L4','LIBRE','=Gastos!K2-SUMIF(Gastos!M4:M2000,"Pagado",Gastos!L4:L2000)-SUMIF(Gastos!M4:M2000,"Apartado",Gastos!L4:L2000)'],
  ];
  ws.setRowHeight(2, 4);
  kpis.forEach(function(k) {
    var labelRange = k[0].replace(/(\d)/, function(m){ return String(parseInt(m)-1); });
    // Label row 3
    ws.getRange(k[0].split(':')[0][0]+'3:'+k[0].split(':')[1][0]+'3').merge()
      .setValue(k[1]).setBackground(C.header).setFontColor(C.muted)
      .setFontWeight('bold').setFontSize(9).setFontFamily('Arial').setHorizontalAlignment('center');
    // Value row 4
    ws.getRange(k[0].split(':')[0][0]+'4:'+k[0].split(':')[1][0]+'4').merge()
      .setFormula(k[2]).setBackground('#1A1917').setFontColor(C.accent)
      .setFontWeight('bold').setFontSize(20).setFontFamily('Arial')
      .setHorizontalAlignment('center').setNumberFormat('$#,##0.00');
    ws.setRowHeight(3, 18); ws.setRowHeight(4, 32);
  });

  // Category summary — row 6+
  sectionTitle(ws, 6, 1, '  RESUMEN POR CATEGORÍA', 7);
  var catHeaders = ['Categoría','Asignado','Pagado','Apartado','Disponible','% Ejecutado','Estado'];
  ws.getRange(7, 1, 1, 7).setValues([catHeaders]);
  styleHeader(ws.getRange(7, 1, 1, 7), '#2E2D2A');
  ws.setRowHeight(7, 20);

  var cats = [
    ['🏠 Hogar', 347], ['🍽️ Comida', 430], ['📱 Subs digitales', 75.95],
    ['📅 Subs anuales', 22.99], ['💆 Cuidado', 340], ['💰 Ahorro', 206],
    ['📋 Obligaciones', 96.67], ['🎁 Familia', 170]
  ];
  cats.forEach(function(cat, i) {
    var r = 8 + i;
    var catStr = cat[0];
    ws.setRowHeight(r, 18);
    var rowBg = i % 2 === 0 ? C.altRow : C.white;

    ws.getRange(r,1).setValue(catStr).setFontWeight('bold').setFontFamily('Arial').setFontSize(10)
      .setBackground(rowBg).setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,2).setValue(cat[1]).setFontColor('#0000FF').setNumberFormat('$#,##0.00')
      .setHorizontalAlignment('right').setBackground(rowBg)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,3).setFormula('=SUMPRODUCT((Gastos!E4:E2000="'+catStr+'")*(Gastos!M4:M2000="Pagado")*(Gastos!L4:L2000))')
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground(C.emerald)
      .setHorizontalAlignment('right').setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,4).setFormula('=SUMPRODUCT((Gastos!E4:E2000="'+catStr+'")*(Gastos!M4:M2000="Apartado")*(Gastos!L4:L2000))')
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground(C.amber)
      .setHorizontalAlignment('right').setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,5).setFormula('=B'+r+'-C'+r+'-D'+r)
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground('#F0F4FF')
      .setHorizontalAlignment('right').setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,6).setFormula('=IF(B'+r+'>0,C'+r+'/B'+r+',0)')
      .setFontColor('#000000').setNumberFormat('0%').setBackground(rowBg)
      .setHorizontalAlignment('center').setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,7).setFormula('=IF(C'+r+'>=B'+r+',"✅ OK",IF(D'+r+'>0,"🕐 Pendiente",IF(C'+r+'>0,"⏳ En curso","⬜ Sin iniciar")))')
      .setHorizontalAlignment('center').setBackground(rowBg).setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
  });

  // Totals
  var tr = 8 + cats.length;
  ws.getRange(tr,1).setValue('TOTAL').setFontWeight('bold').setBackground(C.header).setFontColor(C.white)
    .setFontFamily('Arial').setFontSize(10).setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
  ['=SUM(B8:B'+(tr-1)+')','=SUM(C8:C'+(tr-1)+')','=SUM(D8:D'+(tr-1)+')','=SUM(E8:E'+(tr-1)+')'].forEach(function(f,i){
    ws.getRange(tr, 2+i).setFormula(f).setBackground(C.header).setFontColor(C.accent)
      .setFontWeight('bold').setNumberFormat('$#,##0.00').setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
  });
  ws.getRange(tr,6,1,2).setBackground(C.header);
  ws.setRowHeight(tr, 22);

  // Fondo emergencia consolidado
  var er = tr + 2;
  sectionTitle(ws, er, 1, '  FONDO DE EMERGENCIA CONSOLIDADO', 7, C.green);
  var eHeaders = ['Moneda','Bolsa','Saldo actual (USD)','% del total','','',''];
  ws.getRange(er+1,1,1,3).setValues([eHeaders.slice(0,3)]);
  styleHeader(ws.getRange(er+1,1,1,3), '#2E6B5E');
  ws.setRowHeight(er+1, 18);
  var eData = [
    ['USD','Facebank','=SUMPRODUCT((Gastos!D4:D2000="Emergencia USD")*(Gastos!L4:L2000))'],
    ['DOC','Belo','=SUMPRODUCT((Gastos!D4:D2000="Emergencia DOC")*(Gastos!L4:L2000))'],
    ['USDC','Bitget Earn USDC','=SUMPRODUCT((Gastos!D4:D2000="Emergencia USDC")*(Gastos!L4:L2000))'],
  ];
  eData.forEach(function(e, i) {
    var r = er + 2 + i;
    ws.getRange(r,1).setValue(e[0]).setFontFamily('Arial').setFontSize(10).setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,2).setValue(e[1]).setFontFamily('Arial').setFontSize(10).setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,3).setFormula(e[2]).setFontColor('#000000').setNumberFormat('$#,##0.00')
      .setHorizontalAlignment('right').setBackground(C.emerald).setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.setRowHeight(r, 18);
  });
  var totalERow = er + 2 + eData.length;
  ws.getRange(totalERow,1,1,2).merge().setValue('TOTAL EMERGENCIA (USD)')
    .setFontWeight('bold').setBackground(C.header).setFontColor(C.white).setFontFamily('Arial').setFontSize(10)
    .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
  ws.getRange(totalERow,3).setFormula('=SUM(C'+(er+2)+':C'+(totalERow-1)+')')
    .setFontWeight('bold').setFontColor(C.accent).setBackground(C.header)
    .setNumberFormat('$#,##0.00').setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(11)
    .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
  ws.setRowHeight(totalERow, 22);

  // Subs anuales acumulado
  var ar = totalERow + 2;
  sectionTitle(ws, ar, 1, '  ACUMULADO SUSCRIPCIONES ANUALES', 7, '#7AB89E');
  var aHeaders = ['Suscripción','Reserva/mes','Meta anual','Acumulado','Faltan','Progreso','Estado'];
  ws.getRange(ar+1,1,1,7).setValues([aHeaders]);
  styleHeader(ws.getRange(ar+1,1,1,7), '#2E6B5E');
  ws.setRowHeight(ar+1, 18);
  var anuals = [
    ['Canva',2,24],['Proton VPN',8.99,107.88],['Platzi',5,60],['Impuestos casa',7,84]
  ];
  anuals.forEach(function(a, i) {
    var r = ar + 2 + i;
    ws.setRowHeight(r, 18);
    var rowBg = i%2===0 ? '#F0FFF8' : C.white;
    ws.getRange(r,1).setValue(a[0]).setFontWeight('bold').setBackground(rowBg).setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,2).setValue(a[1]).setFontColor('#0000FF').setNumberFormat('$#,##0.00').setBackground(rowBg)
      .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,3).setValue(a[2]).setFontColor('#0000FF').setNumberFormat('$#,##0.00').setBackground(rowBg)
      .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,4).setFormula('=SUMPRODUCT((Gastos!D4:D2000="'+a[0]+'")*(Gastos!L4:L2000))')
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground(C.emerald)
      .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,5).setFormula('=C'+r+'-D'+r)
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground(rowBg)
      .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,6).setFormula('=IF(C'+r+'>0,D'+r+'/C'+r+',0)')
      .setFontColor('#000000').setNumberFormat('0.0%').setBackground(rowBg)
      .setHorizontalAlignment('center').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,7).setFormula('=IF(D'+r+'>=C'+r+',"✅ Listo para pagar","⏳ Acumulando")')
      .setHorizontalAlignment('center').setBackground(rowBg).setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
  });

  // Column widths
  var cw = [22,14,14,14,14,12,14];
  cw.forEach(function(w,i){ ws.setColumnWidth(i+1, w*7); });
}

// ══════════════════════════════════════════════
// PESTAÑA: TASAS
// ══════════════════════════════════════════════
function crearTasas(ss) {
  deleteSheetIfExists(ss, 'Tasas');
  var ws = ss.insertSheet('Tasas');

  ws.getRange('A1:F1').merge().setValue('💱 REGISTRO DE TASAS DE CAMBIO')
    .setBackground(C.header).setFontColor(C.accent).setFontWeight('bold')
    .setFontSize(13).setFontFamily('Arial').setHorizontalAlignment('center');
  ws.setRowHeight(1, 28);

  var headers = ['Fecha','BCV USD/VES','BCV EUR/VES','USDt/VES (P2P)','Fuente','Notas'];
  ws.getRange(2,1,1,6).setValues([headers]);
  styleHeader(ws.getRange(2,1,1,6));
  ws.setRowHeight(2, 20);

  var tasas = [
    ['14/06/2025',55.20,60.10,56.80,'BCV oficial',''],
    ['07/06/2025',54.90,59.80,56.50,'BCV oficial',''],
    ['01/06/2025',54.20,59.10,55.90,'BCV oficial','Inicio mes'],
  ];
  tasas.forEach(function(t, i) {
    var r = i + 3;
    ws.getRange(r,1,1,6).setValues([t]).setFontFamily('Arial').setFontSize(10)
      .setVerticalAlignment('middle')
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,1).setNumberFormat('DD/MM/YYYY');
    ws.getRange(r,2,1,3).setFontColor('#0000FF').setNumberFormat('#,##0.00').setHorizontalAlignment('right');
    ws.setRowHeight(r, 18);
  });

  // Note about stablecoins
  ws.getRange('A7:F7').merge()
    .setValue('💡 Nota: USDC, USDt y DOC se tratan como 1:1 con USD para toda la contabilidad.')
    .setBackground('#FFF8E1').setFontColor(C.muted).setFontSize(9).setFontFamily('Arial')
    .setHorizontalAlignment('left');
  ws.setRowHeight(7, 18);

  var cw = [14,16,16,16,18,28];
  cw.forEach(function(w,i){ ws.setColumnWidth(i+1, w*7); });
}

// ══════════════════════════════════════════════
// PESTAÑA: BOLSAS
// ══════════════════════════════════════════════
function crearBolsas(ss) {
  deleteSheetIfExists(ss, 'Bolsas');
  var ws = ss.insertSheet('Bolsas');

  ws.getRange('A1:H1').merge().setValue('💳 REGISTRO DE BOLSAS')
    .setBackground(C.header).setFontColor(C.accent).setFontWeight('bold')
    .setFontSize(13).setFontFamily('Arial').setHorizontalAlignment('center');
  ws.setRowHeight(1, 28);

  var headers = ['ID','Nombre','Plataforma','Moneda','Saldo actual','Propósito','Actualizado','Notas'];
  ws.getRange(2,1,1,8).setValues([headers]);
  styleHeader(ws.getRange(2,1,1,8));
  ws.setRowHeight(2, 20);

  var bolsas = [
    ['B01','Earn USDC','Binance','USDC',245,'Servicios operativos','14/06/2025',''],
    ['B02','Earn USDt','Binance','USDt',180,'Pagos VES','14/06/2025',''],
    ['B03','Spot USDC','Binance','USDC',30,'DCA Bitcoin','14/06/2025',''],
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
  bolsas.forEach(function(b,i) {
    var r = i+3;
    ws.getRange(r,1,1,8).setValues([b]).setFontFamily('Arial').setFontSize(10)
      .setVerticalAlignment('middle').setBackground(i%2===0?C.altRow:C.white)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,5).setFontColor('#0000FF').setNumberFormat('#,##0.00').setHorizontalAlignment('right');
    ws.getRange(r,7).setNumberFormat('DD/MM/YYYY').setHorizontalAlignment('center');
    ws.setRowHeight(r, 18);
  });

  var cw = [6,16,14,8,14,26,14,24];
  cw.forEach(function(w,i){ ws.setColumnWidth(i+1, w*7); });
}

// ══════════════════════════════════════════════
// PESTAÑA: CIERRE MES
// ══════════════════════════════════════════════
function crearCierreMes(ss) {
  deleteSheetIfExists(ss, 'Cierre Mes');
  var ws = ss.insertSheet('Cierre Mes');

  ws.getRange('A1:H1').merge().setValue('🔒 CIERRE Y APERTURA DE MES')
    .setBackground(C.header).setFontColor(C.accent).setFontWeight('bold')
    .setFontSize(14).setFontFamily('Arial').setHorizontalAlignment('center');
  ws.setRowHeight(1, 30);

  var instructions = [
    ['INSTRUCCIONES:'],
    ['1. Verifica que todos los gastos "Apartado" estén resueltos (pagados o anulados)'],
    ['2. Revisa el resumen abajo — ¿hay sobres excedidos?'],
    ['3. Copia la pestaña "Gastos" y renómbrala con el mes (ej: Gastos-2025-06)'],
    ['4. Limpia la pestaña "Gastos" y carga la nueva plantilla desde la app HTML'],
    ['5. Actualiza el mes en Gastos!D2 y el ingreso en Gastos!K2'],
    ['6. Los "Apartados" sin pagar del mes anterior: cópialos al nuevo mes'],
  ];
  instructions.forEach(function(ins, i) {
    var r = i+2;
    ws.getRange(r,1,1,8).merge().setValue(ins[0])
      .setFontFamily('Arial').setFontSize(10)
      .setFontWeight(i===0?'bold':'normal')
      .setFontColor(i===0?C.accent:C.header)
      .setBackground(i===0?C.header:(i%2===0?'#1E1D1B':C.header))
      .setHorizontalAlignment('left');
    ws.setRowHeight(r, 18);
  });

  sectionTitle(ws, 10, 1, '  RESUMEN DE CIERRE', 8);
  var cHeaders = ['Grupo/Sobre','Categoría','Asignado','Pagado','Apartado','Sobrante','Estado'];
  ws.getRange(11,1,1,7).setValues([cHeaders]);
  styleHeader(ws.getRange(11,1,1,7));
  ws.setRowHeight(11, 20);

  var sobres = [
    ['Hogar','🏠 Hogar',347],['Comida','🍽️ Comida',430],
    ['Suscripciones digitales','📱 Subs digitales',75.95],['Suscripciones anuales','📅 Subs anuales',22.99],
    ['Cuidado personal','💆 Cuidado',340],['Fondo de Emergencia','💰 Ahorro',90],
    ['DCA Bitcoin','💰 Ahorro',30],['Viaje Europa','💰 Ahorro',50],
    ['Obligaciones','📋 Obligaciones',96.67],['Familia','🎁 Familia',170],
  ];
  sobres.forEach(function(s,i) {
    var r = 12+i;
    ws.setRowHeight(r, 18);
    var bg = i%2===0?C.altRow:C.white;
    ws.getRange(r,1).setValue(s[0]).setFontWeight('bold').setBackground(bg)
      .setFontFamily('Arial').setFontSize(10).setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,2).setValue(s[1]).setBackground(bg).setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,3).setValue(s[2]).setFontColor('#0000FF').setNumberFormat('$#,##0.00').setBackground(bg)
      .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,4).setFormula('=SUMPRODUCT((Gastos!C4:C2000="'+s[0]+'")*(Gastos!M4:M2000="Pagado")*(Gastos!L4:L2000))')
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground(C.emerald)
      .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,5).setFormula('=SUMPRODUCT((Gastos!C4:C2000="'+s[0]+'")*(Gastos!M4:M2000="Apartado")*(Gastos!L4:L2000))')
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground(C.amber)
      .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,6).setFormula('=C'+r+'-D'+r+'-E'+r)
      .setFontColor('#000000').setNumberFormat('$#,##0.00').setBackground('#F0F4FF')
      .setHorizontalAlignment('right').setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,7).setFormula('=IF(D'+r+'>=C'+r+',"✅ OK",IF(E'+r+'>0,"🕐 Pendiente",IF(D'+r+'>0,"⏳ Parcial","⬜ Sin pagar")))')
      .setHorizontalAlignment('center').setBackground(bg).setFontFamily('Arial').setFontSize(10)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
  });

  var cw = [24,18,13,13,13,13,14];
  cw.forEach(function(w,i){ ws.setColumnWidth(i+1, w*7); });
}

// ══════════════════════════════════════════════
// PESTAÑA: CONFIG (para la app HTML)
// ══════════════════════════════════════════════
function crearConfig(ss) {
  deleteSheetIfExists(ss, 'Config');
  var ws = ss.insertSheet('Config');

  ws.getRange('A1:D1').merge().setValue('⚙️ CONFIGURACIÓN — CONEXIÓN CON APP HTML')
    .setBackground(C.header).setFontColor(C.accent).setFontWeight('bold')
    .setFontSize(13).setFontFamily('Arial').setHorizontalAlignment('center');
  ws.setRowHeight(1, 28);

  var config = [
    ['Sheet ID', ss.getId(), 'Copia este valor en la app HTML', ''],
    ['Moneda base', 'USDC', 'Moneda de referencia para contabilidad', ''],
    ['Paridad stablecoins', '1:1', 'USDC = USDt = DOC = 1 USD', ''],
    ['Mes activo', '2025-06', 'Se actualiza en Gastos!D2', ''],
    ['Última tasa BCV', '=IF(COUNTA(Tasas!B3:B100)>0,INDEX(Tasas!B3:B100,MATCH(MAX(Tasas!A3:A100),Tasas!A3:A100,0)),"—")', 'Auto desde pestaña Tasas', ''],
    ['URL App HTML', 'Pega aquí la URL donde alojas el HTML', '', ''],
  ];

  config.forEach(function(c, i) {
    var r = i+2;
    ws.getRange(r,1).setValue(c[0]).setFontWeight('bold').setBackground(i%2===0?C.altRow:C.white)
      .setFontFamily('Arial').setFontSize(10).setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    if (c[1].startsWith && c[1].startsWith('=')) {
      ws.getRange(r,2).setFormula(c[1]);
    } else {
      ws.getRange(r,2).setValue(c[1]);
    }
    ws.getRange(r,2).setFontColor(i===0?C.accent:'#0000FF').setBackground(i%2===0?C.altRow:C.white)
      .setFontFamily('Arial').setFontSize(10).setFontWeight(i===0?'bold':'normal')
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.getRange(r,3).setValue(c[2]).setFontColor(C.muted).setBackground(i%2===0?C.altRow:C.white)
      .setFontFamily('Arial').setFontSize(9)
      .setBorder(true,true,true,true,true,true,'#DDDAD3',SpreadsheetApp.BorderStyle.SOLID);
    ws.setRowHeight(r, 20);
  });

  ws.setColumnWidth(1, 160); ws.setColumnWidth(2, 280); ws.setColumnWidth(3, 220);
}

// ══════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ══════════════════════════════════════════════
function setupCompleto() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetName('💰 Finanzas — Sobres Digitales');

  SpreadsheetApp.getUi().alert('⏳ Creando pestañas... esto tarda unos segundos.');

  // Orden de creación
  crearConfig(ss);
  crearPlantilla(ss);
  crearGastos(ss);
  crearDashboard(ss);
  crearTasas(ss);
  crearBolsas(ss);
  crearCierreMes(ss);

  // Reorder sheets
  var order = ['Config','Dashboard','Gastos','Plantilla','Tasas','Bolsas','Cierre Mes'];
  order.forEach(function(name, i) {
    var s = ss.getSheetByName(name);
    if (s) ss.setActiveSheet(s), ss.moveActiveSheet(i+1);
  });

  // Delete default Sheet1 if empty
  var sheet1 = ss.getSheetByName('Hoja 1') || ss.getSheetByName('Sheet1');
  if (sheet1 && sheet1.getLastRow() === 0) ss.deleteSheet(sheet1);

  // Activate Dashboard
  ss.setActiveSheet(ss.getSheetByName('Dashboard'));

  SpreadsheetApp.getUi().alert(
    '✅ ¡Sistema creado exitosamente!\n\n' +
    '📋 Pestañas creadas: Config, Dashboard, Gastos, Plantilla, Tasas, Bolsas, Cierre Mes\n\n' +
    '🔗 Tu Sheet ID está en la pestaña Config — cópialo en la app HTML.\n\n' +
    '📱 Próximo paso: en la app HTML ve a Configuración y pega el Sheet ID.'
  );
}

// Función auxiliar para limpiar y recargar un mes nuevo
function abrirNuevoMes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ui = SpreadsheetApp.getUi();
  var resp = ui.prompt('📅 Abrir nuevo mes', 'Ingresa el mes (formato YYYY-MM):', ui.ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  var nuevoMes = resp.getResponseText().trim();
  if (!/^\d{4}-\d{2}$/.test(nuevoMes)) { ui.alert('Formato inválido. Usa YYYY-MM'); return; }

  var gastos = ss.getSheetByName('Gastos');
  if (!gastos) { ui.alert('No se encontró la pestaña Gastos'); return; }

  // Archive current month
  var currentMes = gastos.getRange('D2').getValue();
  var copy = gastos.copyTo(ss);
  copy.setName('Gastos-' + currentMes);
  ss.moveActiveSheet(ss.getNumSheets());

  // Clear data rows (keep rows 1-3)
  var lastRow = gastos.getLastRow();
  if (lastRow > 3) gastos.deleteRows(4, lastRow - 3);

  // Update month
  gastos.getRange('D2').setValue(nuevoMes);

  ui.alert('✅ Mes ' + nuevoMes + ' abierto.\n\nEl mes anterior quedó archivado como "Gastos-' + currentMes + '".\nAhora carga la plantilla desde la app HTML.');
}
