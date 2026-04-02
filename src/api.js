/**
 * Google Apps Script Web API との通信ユーティリティ
 *
 * GASデプロイ後、GAS_URLにデプロイURLを設定すること。
 * 未設定時はローカルモード（メモリのみ）で動作する。
 */

// ★ GAS WebAPI URL
const GAS_URL = 'https://script.google.com/macros/s/AKfycbzjsTLY9wm4y8oHYHTCenBtQevh_BOQ1qR0LKn_IPz-JxIZEE00nsBCd6nsZ1-kEnCjQA/exec';

/**
 * APIが設定済みかどうか
 */
export function isApiConfigured() {
  return GAS_URL.length > 0;
}

/**
 * 全レコード取得
 */
export async function fetchRecords() {
  if (!isApiConfigured()) return null;

  try {
    const res = await fetch(GAS_URL);
    const data = await res.json();
    if (data.success) {
      return data.records;
    }
    console.error('API取得エラー:', data.error);
    return null;
  } catch (err) {
    console.error('API通信エラー:', err);
    return null;
  }
}

/**
 * レコード追加
 */
export async function addRecord(record) {
  if (!isApiConfigured()) return true; // ローカルモードは常に成功

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' }, // GAS CORS対策
      body: JSON.stringify({ action: 'add', record }),
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error('API追加エラー:', err);
    return false;
  }
}

/**
 * 複数レコード一括追加
 */
export async function addRecordsBatch(records) {
  if (!isApiConfigured()) return true;

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'addBatch', records }),
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error('API一括追加エラー:', err);
    return false;
  }
}

/**
 * レコード削除
 */
export async function deleteRecord(id) {
  if (!isApiConfigured()) return true;

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error('API削除エラー:', err);
    return false;
  }
}

/**
 * レコード更新
 */
export async function updateRecord(record) {
  if (!isApiConfigured()) return true;

  try {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ action: 'update', record }),
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.error('API更新エラー:', err);
    return false;
  }
}
