import { useState, useMemo } from 'react';
import { useStore, CATEGORIES } from '../store';
import { formatCurrency, formatDate, docTypeLabel, statusLabel, categoryName } from '../utils';

export default function RecordsList() {
  const { state, dispatch } = useStore();
  const { records, categories } = state;
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [detail, setDetail] = useState(null);

  const filtered = useMemo(() => {
    let result = [...records];
    if (catFilter !== 'all') result = result.filter(r => r.category === catFilter);
    if (statusFilter !== 'all') result = result.filter(r => r.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.client.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.docNumber.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount-desc') return b.total - a.total;
      if (sortBy === 'amount-asc') return a.total - b.total;
      return 0;
    });
    return result;
  }, [records, search, catFilter, statusFilter, sortBy]);

  const totalAmount = filtered.reduce((s, r) => s + r.total, 0);

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h2>全伝票一覧</h2>
          <span style={{ fontSize: 13, color: '#64748b' }}>{filtered.length}件 / 合計 {formatCurrency(totalAmount)}</span>
        </div>
        <div className="header-right">
          <button className="btn btn-primary btn-sm" onClick={() => dispatch({ type: 'SET_PAGE', payload: 'upload' })}>
            + PDF登録
          </button>
        </div>
      </div>

      <div className="dashboard-grid grid-1">
        {/* Filters */}
        <div className="card animate-fade-in-up">
          <div className="card-body" style={{ padding: '12px 20px' }}>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                className="form-control"
                placeholder="検索（取引先・件名・番号）..."
                style={{ width: 260 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <select className="form-control" style={{ width: 'auto' }}
                value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                <option value="all">全カテゴリ</option>
                {Object.entries(CATEGORIES).map(([k, c]) => (
                  <option key={k} value={k}>{c.name}</option>
                ))}
              </select>
              <select className="form-control" style={{ width: 'auto' }}
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">全ステータス</option>
                <option value="paid">入金済</option>
                <option value="unpaid">未入金</option>
                <option value="pending">処理中</option>
              </select>
              <select className="form-control" style={{ width: 'auto' }}
                value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="date-desc">日付 新→旧</option>
                <option value="date-asc">日付 旧→新</option>
                <option value="amount-desc">金額 高→低</option>
                <option value="amount-asc">金額 低→高</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card animate-fade-in-up stagger-2">
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>該当する伝票がありません</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>種別</th>
                    <th>カテゴリ</th>
                    <th>伝票番号</th>
                    <th>取引先</th>
                    <th>件名</th>
                    <th className="text-right">金額（税込）</th>
                    <th>状態</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id} className="animate-fade-in-up" style={{ animationDelay: `${Math.min(i, 10) * 0.03}s` }}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.date)}</td>
                      <td><span className={`badge ${docTypeLabel(r.docType)}`}>{r.docType}</span></td>
                      <td>
                        <span className={`badge ${r.category}`}>
                          {categoryName(categories, r.category)}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{r.docNumber}</td>
                      <td>{r.client}</td>
                      <td>{r.subject}</td>
                      <td className="text-right amount">{formatCurrency(r.total)}</td>
                      <td><span className={`badge ${r.status}`}>{statusLabel(r.status)}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => setDetail(r)}>詳細</button>
                          <button
                            className="btn btn-sm"
                            style={{ background: '#fee2e2', color: '#991b1b' }}
                            onClick={() => {
                              if (confirm('この伝票を削除しますか？')) {
                                dispatch({ type: 'DELETE_RECORD', payload: r.id });
                                dispatch({ type: 'ADD_TOAST', payload: { type: 'success', message: '伝票を削除しました' } });
                              }
                            }}
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Detail modal */}
      {detail && (
        <div className="modal-overlay" onClick={() => setDetail(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{detail.docType} 詳細</h3>
              <button className="modal-close" onClick={() => setDetail(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="confirm-grid">
                <dt>日付</dt><dd>{formatDate(detail.date)}</dd>
                <dt>伝票番号</dt><dd>{detail.docNumber}</dd>
                <dt>カテゴリ</dt><dd><span className={`badge ${detail.category}`}>{categoryName(categories, detail.category)}</span></dd>
                <dt>取引先</dt><dd>{detail.client}</dd>
                <dt>件名</dt><dd>{detail.subject}</dd>
                <dt>ステータス</dt><dd><span className={`badge ${detail.status}`}>{statusLabel(detail.status)}</span></dd>
              </div>
              <div className="detail-items">
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, marginTop: 16 }}>明細</h4>
                {detail.items.map((item, i) => (
                  <div key={i} className="detail-item">
                    <span className="item-desc">{item.description}</span>
                    <span style={{ fontSize: 12, color: '#64748b', margin: '0 12px' }}>
                      {item.qty}{item.unit} × {formatCurrency(item.unitPrice)}
                    </span>
                    <span className="item-amount">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '2px solid var(--border)', marginTop: 16, paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>小計（税抜）</span><span className="amount">{formatCurrency(detail.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>消費税（10%）</span><span className="amount">{formatCurrency(detail.tax)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, marginTop: 8 }}>
                  <span>合計（税込）</span><span>{formatCurrency(detail.total)}</span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setDetail(null)}>閉じる</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
