/**
 * CLH 売上管理 - Google Apps Script Web API
 *
 * スプレッドシートをデータベースとして使用し、
 * React アプリからのCRUD操作を処理する。
 *
 * デプロイ手順:
 * 1. Google スプレッドシートを新規作成
 * 2. 「拡張機能」→「Apps Script」を開く
 * 3. このコードを貼り付け
 * 4. SPREADSHEET_ID を自分のスプレッドシートIDに変更
 * 5. 「デプロイ」→「新しいデプロイ」→ ウェブアプリ
 *    - 実行するユーザー: 自分
 *    - アクセスできるユーザー: 全員
 * 6. デプロイURLをReactアプリの src/api.js に設定
 */

// ★ ここにスプレッドシートIDを入れる（URLの /d/XXXXX/edit のXXXXX部分）
const SPREADSHEET_ID = '1qDv2srqZmUfGbGVZjynlBOixWguGpKwqfOfRtvBFGf4';
const SHEET_NAME = '伝票データ';

// ── ヘッダー定義 ──
const HEADERS = ['id', 'date', 'docType', 'docNumber', 'client', 'category', 'subject', 'items', 'subtotal', 'tax', 'total', 'status', 'createdAt'];

/**
 * シートを取得（なければ作成してヘッダー設定）
 */
function getSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    // ヘッダー行をスタイリング
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4a5568');
    headerRange.setFontColor('#ffffff');
    // 列幅を設定
    sheet.setColumnWidth(1, 160);  // id
    sheet.setColumnWidth(2, 100);  // date
    sheet.setColumnWidth(3, 80);   // docType
    sheet.setColumnWidth(4, 150);  // docNumber
    sheet.setColumnWidth(5, 200);  // client
    sheet.setColumnWidth(6, 100);  // category
    sheet.setColumnWidth(7, 250);  // subject
    sheet.setColumnWidth(8, 400);  // items
    sheet.setColumnWidth(9, 100);  // subtotal
    sheet.setColumnWidth(10, 80);  // tax
    sheet.setColumnWidth(11, 100); // total
    sheet.setColumnWidth(12, 80);  // status
    sheet.setColumnWidth(13, 160); // createdAt
    // 1行目を固定
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * シートの全データを配列として取得
 */
function getAllRecords() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return []; // ヘッダーのみ

  const data = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
  return data.map(row => {
    const record = {};
    HEADERS.forEach((h, i) => {
      if (h === 'items') {
        try {
          record[h] = JSON.parse(row[i] || '[]');
        } catch (e) {
          record[h] = [];
        }
      } else if (h === 'subtotal' || h === 'tax' || h === 'total') {
        record[h] = Number(row[i]) || 0;
      } else {
        record[h] = String(row[i] || '');
      }
    });
    return record;
  });
}

/**
 * GET リクエスト - 全データ取得
 */
function doGet(e) {
  try {
    const records = getAllRecords();
    return jsonResponse({ success: true, records: records });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * POST リクエスト - データ追加・削除・更新
 */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;

    if (action === 'add') {
      return handleAdd(body.record);
    } else if (action === 'addBatch') {
      return handleAddBatch(body.records);
    } else if (action === 'delete') {
      return handleDelete(body.id);
    } else if (action === 'update') {
      return handleUpdate(body.record);
    } else {
      return jsonResponse({ success: false, error: '不明なアクション: ' + action });
    }
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

/**
 * レコード追加
 */
function handleAdd(record) {
  const sheet = getSheet();
  const id = record.id || String(Date.now());
  const createdAt = new Date().toISOString();

  const row = [
    id,
    record.date || '',
    record.docType || '',
    record.docNumber || '',
    record.client || '',
    record.category || '',
    record.subject || '',
    JSON.stringify(record.items || []),
    Number(record.subtotal) || 0,
    Number(record.tax) || 0,
    Number(record.total) || 0,
    record.status || 'pending',
    createdAt,
  ];

  sheet.appendRow(row);
  return jsonResponse({ success: true, id: id });
}

/**
 * 複数レコード一括追加
 */
function handleAddBatch(records) {
  const sheet = getSheet();
  const ids = [];

  records.forEach(record => {
    const id = record.id || String(Date.now() + Math.random());
    const createdAt = new Date().toISOString();
    ids.push(id);

    sheet.appendRow([
      id,
      record.date || '',
      record.docType || '',
      record.docNumber || '',
      record.client || '',
      record.category || '',
      record.subject || '',
      JSON.stringify(record.items || []),
      Number(record.subtotal) || 0,
      Number(record.tax) || 0,
      Number(record.total) || 0,
      record.status || 'pending',
      createdAt,
    ]);
  });

  return jsonResponse({ success: true, ids: ids });
}

/**
 * レコード削除
 */
function handleDelete(id) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();

  for (let i = 2; i <= lastRow; i++) {
    if (String(sheet.getRange(i, 1).getValue()) === String(id)) {
      sheet.deleteRow(i);
      return jsonResponse({ success: true });
    }
  }

  return jsonResponse({ success: false, error: 'レコードが見つかりません: ' + id });
}

/**
 * レコード更新
 */
function handleUpdate(record) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();

  for (let i = 2; i <= lastRow; i++) {
    if (String(sheet.getRange(i, 1).getValue()) === String(record.id)) {
      const row = [
        record.id,
        record.date || '',
        record.docType || '',
        record.docNumber || '',
        record.client || '',
        record.category || '',
        record.subject || '',
        JSON.stringify(record.items || []),
        Number(record.subtotal) || 0,
        Number(record.tax) || 0,
        Number(record.total) || 0,
        record.status || 'pending',
        sheet.getRange(i, 13).getValue(), // createdAt は維持
      ];
      sheet.getRange(i, 1, 1, HEADERS.length).setValues([row]);
      return jsonResponse({ success: true });
    }
  }

  return jsonResponse({ success: false, error: 'レコードが見つかりません: ' + record.id });
}

/**
 * CORS対応JSONレスポンス
 */
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 初期セットアップ（手動実行用）
 * スプレッドシートにヘッダーを作成する
 */
function setup() {
  getSheet();
  Logger.log('シート「' + SHEET_NAME + '」を作成しました');
}
