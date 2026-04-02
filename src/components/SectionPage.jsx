import { useState, useMemo } from 'react';
import { useStore, CATEGORIES } from '../store';
import { formatCurrency, getCategoryTotals, formatDate, docTypeLabel, statusLabel, getMonthlyData, getMonthLabel } from '../utils';
import AnimatedNumber from './AnimatedNumber';

export default function SectionPage({ categoryId }) {
  const { state, dispatch } = useStore();
  const { records, categories } = state;
  const cat = categories[categoryId];
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const catRecords = useMemo(() => {
    let filtered = records.filter(r => r.category === categoryId);
    if (statusFilter !== 'all') filtered = filtered.filter(r => r.status === statusFilter);
    filtered.sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
      if (sortBy === 'amount-desc') return b.total - a.total;
      if (sortBy === 'amount-asc') return a.total - b.total;
      return 0;
    });
    return filtered;
  }, [records, categoryId, statusFilter, sortBy]);

  const totals = getCategoryTotals(records, categoryId);
  const monthly = getMonthlyData(records, categoryId);
  const maxMonthly = Math.max(...monthly.map(m => m.total), 1);

  const [detail, setDetail] = useState(null);

  return (
    <>
      <div className="header">
        <div className="header-left">
          <span className="color-indicator" style={{ background: cat.color, width: 12, height: 12 }} />
          <h2>{cat.name}</h2>
        </div>
        <div className="header-right">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => dispatch({ type: 'SET_PAGE', payload: 'upload' })}
          >
            + PDF登録
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-grid grid-4">
        <div className={`stat-card ${categoryId} animate-fade-in-up stagger-1`}>
          <div className="stat-label">売上合計（税込）</div>
          <div className="stat-value"><AnimatedNumber value={totals.total} prefix="¥" /></div>
          <div className="stat-count">{totals.count}件</div>
        </div>
        <div className={`stat-card ${categoryId} animate-fade-in-up stagger-2`}>
          <div className="stat-label">小計（税抜）</div>
          <div className="stat-value"><AnimatedNumber value={totals.subtotal} prefix="¥" /></div>
          <div className="stat-sub">消費税: {formatCurrency(totals.tax)}</div>
        </div>
        <div className={`stat-card ${categoryId} animate-fade-in-up stagger-3`}>
          <div className="stat-label">入金済</div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>
            <AnimatedNumber value={totals.paid} prefix="¥" />
          </div>
          <div className="stat-count">{totals.paidCount}件</div>
        </div>
        <div className={`stat-card ${categoryId} animate-fade-in-up stagger-4`}>
          <div className="stat-label">未入金</div>
          <div className="stat-value" style={{ color: 'var(--danger)' }}>
            <AnimatedNumber value={totals.unpaid} prefix="¥" />
          </div>
          <div className="stat-count">{totals.unpaidCount}件</div>
        </div>
      </div>

      {/* Monthly chart */}
      {monthly.length > 0 && (
        <div className="dashboard-grid grid-1">
          <div className="card animate-fade-in-up stagger-3">
            <div className="card-header">
              <h3>月別売上</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 120 }}>
                {monthly.map((m, i) => (
                  <div key={m.month} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{
                      height: `${(m.total / maxMonthly) * 100}px`,
                      background: `linear-gradient(180deg, ${cat.color}, ${cat.color}88)`,
                      borderRadius: '6px 6px 0 0',
                      animation: `chartGrow 0.8s ease ${i * 0.1}s both`,
                      transformOrigin: 'bottom',
                      position: 'relative',
                    }}>
                      <div style={{
                        position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
                        fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        {formatCurrency(m.total)}
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
                      {getMonthLabel(m.month)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Records table */}
      <div className="dashboard-grid grid-1">
        <div className="card animate-fade-in-up stagger-4">
          <div className="card-header">
            <h3>伝票一覧</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <select className="form-control" style={{ width: 'auto', padding: '6px 30px 6px 10px', fontSize: 13 }}
                value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">全ステータス</option>
                <option value="paid">入金済</option>
                <option value="unpaid">未入金</option>
                <option value="pending">処理中</option>
              </select>
              <select className="form-control" style={{ width: 'auto', padding: '6px 30px 6px 10px', fontSize: 13 }}
                value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="date-desc">日付 新→旧</option>
                <option value="date-asc">日付 旧→新</option>
                <option value="amount-desc">金額 高→低</option>
                <option value="amount-asc">金額 低→高</option>
              </select>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {catRecords.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>該当する伝票がありません</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>日付</th>
                    <th>種別</th>
                    <th>伝票番号</th>
                    <th>取引先</th>
                    <th>件名</th>
                    <th className="text-right">金額</th>
                    <th>状態</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {catRecords.map((r, i) => (
                    <tr key={r.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.03}s` }}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(r.date)}</td>
                      <td><span className={`badge ${docTypeLabel(r.docType)}`}>{r.docType}</span></td>
                      <td style={{ fontSize: 12, fontFamily: 'monospace' }}>{r.docNumber}</td>
                      <td>{r.client}</td>
                      <td>{r.subject}</td>
                      <td className="text-right amount">{formatCurrency(r.total)}</td>
                      <td><span className={`badge ${r.status}`}>{statusLabel(r.status)}</span></td>
                      <td>
                        <button className="btn btn-outline btn-sm" onClick={() => setDetail(r)}>
                          詳細
                        </button>
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
                <dt>取引先</dt><dd>{detail.client}</dd>
                <dt>件名</dt><dd>{detail.subject}</dd>
                <dt>ステータス</dt><dd><span className={`badge ${detail.status}`}>{statusLabel(detail.status)}</span></dd>
              </div>
              <div className="detail-items">
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>明細</h4>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14 }}>
                  <span>小計（税抜）</span><span className="amount">{formatCurrency(detail.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14 }}>
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
