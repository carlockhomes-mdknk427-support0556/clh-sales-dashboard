import { useState } from 'react';
import { useStore, CATEGORIES } from '../store';
import { exportToExcel, exportToCSV, formatCurrency } from '../utils';

export default function ExportPage() {
  const { state, dispatch } = useStore();
  const { records } = state;
  const [catFilter, setCatFilter] = useState('all');
  const [format, setFormat] = useState('excel');
  const [exported, setExported] = useState(false);

  const filtered = catFilter === 'all' ? records : records.filter(r => r.category === catFilter);

  const handleExport = () => {
    if (filtered.length === 0) {
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: 'エクスポートするデータがありません' } });
      return;
    }

    const catLabel = catFilter === 'all' ? '全データ' : CATEGORIES[catFilter].name;

    if (format === 'excel') {
      exportToExcel(filtered, `CLH売上_${catLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else {
      exportToCSV(filtered);
    }

    setExported(true);
    dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: `${format === 'excel' ? 'Excel' : 'CSV'}ファイルをダウンロードしました` } });
    setTimeout(() => setExported(false), 2000);
  };

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h2>データ出力</h2>
        </div>
      </div>

      <div className="dashboard-grid grid-1">
        <div className="card animate-fade-in-up">
          <div className="card-header">
            <h3>エクスポート設定</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 600 }}>
              <div className="form-group">
                <label>カテゴリ</label>
                <select className="form-control" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                  <option value="all">全カテゴリ</option>
                  {Object.entries(CATEGORIES).map(([k, c]) => (
                    <option key={k} value={k}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>出力形式</label>
                <select className="form-control" value={format} onChange={e => setFormat(e.target.value)}>
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="csv">CSV（Googleスプレッドシート対応）</option>
                </select>
              </div>
            </div>

            <div style={{
              background: '#f8fafc', borderRadius: 8, padding: 16, marginTop: 16,
              border: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>出力プレビュー</div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>件数</span>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{filtered.length}件</div>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>合計金額</span>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                    {formatCurrency(filtered.reduce((s, r) => s + r.total, 0))}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>形式</span>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>
                    {format === 'excel' ? 'Excel' : 'CSV'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button
                className={`btn ${exported ? 'btn-success' : 'btn-primary'} btn-lg`}
                onClick={handleExport}
                disabled={filtered.length === 0}
              >
                {exported ? '✓ ダウンロード完了' : format === 'excel' ? '📥 Excelダウンロード' : '📥 CSVダウンロード'}
              </button>
            </div>

            {format === 'csv' && (
              <div style={{ marginTop: 16, padding: 12, background: '#fffbeb', borderRadius: 8, border: '1px solid #fcd34d' }}>
                <p style={{ fontSize: 13, color: '#92400e' }}>
                  💡 CSVファイルはGoogleスプレッドシートで直接開けます。<br />
                  Googleドライブにアップロード → 「Googleスプレッドシートで開く」を選択してください。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Export table preview */}
        <div className="card animate-fade-in-up stagger-2">
          <div className="card-header">
            <h3>データプレビュー（先頭5件）</h3>
          </div>
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>日付</th>
                  <th>種別</th>
                  <th>伝票番号</th>
                  <th>取引先</th>
                  <th>件名</th>
                  <th className="text-right">合計</th>
                  <th>状態</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 5).map(r => (
                  <tr key={r.id}>
                    <td>{r.date}</td>
                    <td>{r.docType}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{r.docNumber}</td>
                    <td>{r.client}</td>
                    <td>{r.subject}</td>
                    <td className="text-right amount">{formatCurrency(r.total)}</td>
                    <td>{r.status === 'paid' ? '入金済' : r.status === 'unpaid' ? '未入金' : '処理中'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
