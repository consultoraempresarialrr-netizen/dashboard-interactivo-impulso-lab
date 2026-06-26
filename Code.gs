// ============================================================
//  IMPULSO LAB · Dashboard API — Google Apps Script
//  Pegar en: Extensions > Apps Script > Code.gs
//  Publicar: Deploy > New deployment > Web app
//    - Execute as: Me
//    - Who has access: Anyone
//  ⚠️  Después de cada cambio en el código, crear un NUEVO deployment
// ============================================================

const SPREADSHEET_ID = '14kWDWie4rBC9QN2fqBfJQe4boBfuL3iqHX5-0DrNW78';

// ── Nombre exacto de cada hoja (ajustar si difieren) ────────
const SHEETS = {
  CARTERA:    'Cartera de Clientes Economico',
  FINANCIERO: 'Control Financiero',
  CAJA:       'Caja',
  CAJA_USD:   'Caja USD',
};

// ── Entry point — soporta fetch normal Y JSONP (callback=?) ─
function doGet(e) {
  const callback = e.parameter.callback || null;
  const sheet    = e.parameter.sheet    || 'all';

  let result;
  try {
    let data;
    switch (sheet) {
      case 'cartera':    data = getCartera();   break;
      case 'financiero': data = getFinanciero(); break;
      case 'caja':       data = getCaja();       break;
      case 'caja_usd':   data = getCajaUSD();    break;
      case 'all':
      default:
        data = {
          cartera:    getCartera(),
          financiero: getFinanciero(),
          caja:       getCaja(),
          caja_usd:   getCajaUSD(),
          meta: { updated: new Date().toISOString() }
        };
    }
    result = JSON.stringify({ ok: true, data });
  } catch (err) {
    result = JSON.stringify({ ok: false, error: err.message });
  }

  // JSONP: si viene ?callback=fnName devolvemos fnName({...})
  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${result})`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  // JSON normal con headers CORS
  return ContentService
    .createTextOutput(result)
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Helper: hoja → array de objetos (fila 1 = headers) ──────
function sheetToObjects(sheetName) {
  const ss   = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh   = ss.getSheetByName(sheetName);
  if (!sh) throw new Error(`Hoja no encontrada: "${sheetName}"`);
  const vals = sh.getDataRange().getValues();
  if (vals.length < 2) return [];
  const headers = vals[0].map(h => String(h).trim());
  return vals.slice(1)
    .filter(row => row.some(cell => cell !== '' && cell !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        let val = row[i];
        // Convertir fechas de Google a string legible
        if (val instanceof Date) {
          val = Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd/MM/yyyy');
        }
        obj[h] = val;
      });
      return obj;
    });
}

// ── Helper: hoja → array plano ──────────────────────────────
function sheetToRaw(sheetName) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sh = ss.getSheetByName(sheetName);
  if (!sh) return [];
  return sh.getDataRange().getValues().map(row =>
    row.map(cell => cell instanceof Date
      ? Utilities.formatDate(cell, Session.getScriptTimeZone(), 'dd/MM/yyyy')
      : cell)
  );
}

// ════════════════════════════════════════════════════════════
function getCartera()    { return safeGet(SHEETS.CARTERA);    }
function getFinanciero() { return safeGet(SHEETS.FINANCIERO); }
function getCaja()       { return safeGet(SHEETS.CAJA);       }
function getCajaUSD()    { return safeGet(SHEETS.CAJA_USD);   }

function safeGet(sheetName) {
  try {
    return { rows: sheetToObjects(sheetName) };
  } catch(e) {
    return { rows: [], error: e.message };
  }
}

// ── Test desde el editor ─────────────────────────────────────
function test() {
  const names = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets().map(s => s.getName());
  Logger.log('Hojas disponibles: ' + names.join(', '));
  Logger.log(JSON.stringify(getCartera()).substring(0, 300));
}
