import { useState, useMemo } from 'react';
import { useStore, CATEGORIES } from '../store';
import { formatCurrency, getCategoryTotals, getMonthlyData, formatDate, docTypeLabel, statusLabel } from '../utils';
import AnimatedNumber from './AnimatedNumber';

function StatCard({ cat, totals, delay, onClick }) {
  return (
    <div
      className={`stat-card ${cat.id} animate-fade-in-up stagger-${delay}`}
      style={{ cursor: 'pointer' }}
      onClick={onClick}
    >
      <div className="stat-icon">{cat.icon}</div>
      <div className="stat-label">{cat.name}</div>
      <div className="stat-value">
        <AnimatedNumber value={totals.total} prefix="¥" />
      </div>
      <div className="stat-count">{totals.count}件</div>
      <div className="stat-sub">
        <span className="up">入金 {formatCurrency(totals.paid)}</span>
        {totals.unpaid > 0 && <span style={{ marginLeft: 8 }} className="down">未入金 {formatCurrency(totals.unpaid)}</span>}
      </div>
    </div>
  );
}

function MiniBarChart({ data, color }) {
  const max = Math.max(...data.map(d => d.total), 1);
  return (
    <div className="mini-bar">
      {data.map((d, i) => (
        <div
          key={d.month}
          className="bar"
          style={{
            height: `${(d.total / max) * 100}%`,
            background: color,
            animationDelay: `${i * 0.1}s`,
            opacity: 0.6 + (i / data.length) * 0.4,
          }}
          title={`${d.month}: ${formatCurrency(d.total)}`}
        />
      ))}
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let offset = 0;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="donut-container">
      <svg width="160" height="160" viewBox="0 0 160 160">
        {data.map((d, i) => {
          const pct = total > 0 ? d.value / total : 0;
          const dashLen = circumference * pct;
          const dashOffset = circumference * offset;
          offset += pct;
          return (
            <circle
              key={d.label}
              cx="80" cy="80" r={radius}
              fill="none" stroke={d.color} strokeWidth="20"
              strokeDasharray={`${dashLen} ${circumference - dashLen}`}
              strokeDashoffset={-dashOffset}
              style={{
                transition: 'stroke-dasharray 1s ease, stroke-dashoffset 1s ease',
                transform: 'rotate(-90deg)',
                transformOrigin: '80px 80px',
              }}
            />
          );
        })}
        <text x="80" y="74" textAnchor="middle" fontSize="13" fill="#64748b" fontWeight="500">合計</text>
        <text x="80" y="96" textAnchor="middle" fontSize="16" fill="#1e293b" fontWeight="700">
          {formatCurrency(total)}
        </text>
      </svg>
      <div className="donut-legend">
        {data.map(d => (
          <div key={d.label} className="donut-legend-item">
            <span className="dot" style={{ background: d.color }} />
            <span>{d.label}</span>
            <span style={{ marginLeft: 'auto', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
              {formatCurrency(d.value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { state, dispatch } = useStore();
  const { records, categories } = state;
  const [period, setPeriod] = useState('all');

  const filtered = useMemo(() => {
    if (period === 'all') return records;
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    if (period === 'month') {
      return records.filter(r => {
        const d = new Date(r.date);
        return d.getFullYear() === y && d.getMonth() === m;
      });
    }
    if (period === 'quarter') {
      const qStart = new Date(y, Math.floor(m / 3) * 3, 1);
      return records.filter(r => new Date(r.date) >= qStart);
    }
    if (period === 'year') {
      return records.filter(r => new Date(r.date).getFullYear() === y);
    }
    return records;
  }, [records, period]);

  const totalStats = getCategoryTotals(filtered);
  const catStats = {};
  Object.keys(categories).forEach(k => { catStats[k] = getCategoryTotals(filtered, k); });

  const donutData = Object.entries(categories).map(([k, c]) => ({
    label: c.name, value: catStats[k].total, color: c.color,
  }));

  const monthlyAll = getMonthlyData(filtered);

  const recentRecords = [...filtered].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const highValue = [...filtered].sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <>
      <div className="header">
        <div className="header-left">
          <h2>ダッシュボード</h2>
        </div>
        <div className="header-right">
          <div className="period-filter">
            {[
              ['all', '全期間'],
              ['year', '今年'],
              ['quarter', '四半期'],
              ['month', '今月'],
            ].map(([val, label]) => (
              <button
                key={val}
                className={period === val ? 'active' : ''}
                onClick={() => setPeriod(val)}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => dispatch({ type: 'SET_PAGE', payload: 'upload' })}
          >
            + PDF登録
          </button>
        </div>
      </div>

      {/* Overview stat cards */}
      <div className="dashboard-grid grid-5">
        {Object.entries(categories).map(([key, cat], i) => (
          <StatCard
            key={key}
            cat={cat}
            totals={catStats[key]}
            delay={i + 1}
            onClick={() => dispatch({ type: 'SET_CATEGORY', payload: key })}
          />
        ))}
        <div className="stat-card total animate-fade-in-up stagger-5">
          <div className="stat-icon">Σ</div>
          <div className="stat-label">合計</div>
          <div className="stat-value">
            <AnimatedNumber value={totalStats.total} prefix="¥" />
          </div>
          <div className="stat-count">{totalStats.count}件</div>
          <div className="stat-sub">
            <span className="up">入金 {formatCurrency(totalStats.paid)}</span>
            <span style={{ marginLeft: 8 }} className="down">未入金 {formatCurrency(totalStats.unpaid)}</span>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="dashboard-grid grid-3">
        {/* Donut chart */}
        <div className="card animate-fade-in-up stagger-2">
          <div className="card-header">
            <h3>セクション別構成</h3>
          </div>
          <div className="card-body">
            <DonutChart data={donutData} />
          </div>
        </div>

        {/* Monthly bars by category */}
        <div className="card span-2 animate-fade-in-up stagger-3">
          <div className="card-header">
            <h3>月別売上推移</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: 20 }}>
              {Object.entries(categories).map(([key, cat]) => {
                const mData = getMonthlyData(filtered, key);
                if (mData.length === 0) return null;
                return (
                  <div key={key} style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, display: 'inline-block' }} />
                      {cat.name}
                    </div>
                    <MiniBarChart data={mData} color={cat.color} />
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                      {mData.map(d => d.month.split('-')[1] + '月').join(' / ')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tables row */}
      <div className="dashboard-grid grid-2">
        {/* High value */}
        <div className="card animate-fade-in-left stagger-4">
          <div className="card-header">
            <h3>高額案件</h3>
            <span style={{ fontSize: 12, color: '#64748b' }}>Top 5</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>取引先</th>
                  <th>件名</th>
                  <th className="text-right">金額</th>
                </tr>
              </thead>
              <tbody>
                {highValue.map((r, i) => (
                  <tr key={r.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td>
                      <span className={`badge ${r.category}`} style={{ marginRight: 4, fontSize: 10, padding: '2px 6px' }}>
                        {categories[r.category]?.name?.[0]}
                      </span>
                      {r.client.substring(0, 12)}{r.client.length > 12 ? '...' : ''}
                    </td>
                    <td style={{ fontSize: 13 }}>{r.subject.substring(0, 15)}{r.subject.length > 15 ? '...' : ''}</td>
                    <td className="text-right amount">{formatCurrency(r.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent records */}
        <div className="card animate-fade-in-right stagger-4">
          <div className="card-header">
            <h3>最近の伝票</h3>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => dispatch({ type: 'SET_PAGE', payload: 'records' })}
            >
              全て表示
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>日付</th>
                  <th>種別</th>
                  <th>取引先</th>
                  <th className="text-right">金額</th>
                  <th>状態</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((r, i) => (
                  <tr key={r.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                    <td style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{formatDate(r.date)}</td>
                    <td><span className={`badge ${docTypeLabel(r.docType)}`}>{r.docType}</span></td>
                    <td style={{ fontSize: 13 }}>{r.client.substring(0, 10)}...</td>
                    <td className="text-right amount">{formatCurrency(r.total)}</td>
                    <td><span className={`badge ${r.status}`}>{statusLabel(r.status)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Summary bar */}
      <div className="dashboard-grid grid-1">
        <div className="card animate-fade-in-up stagger-6">
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>総売上（税込）</div>
                <div style={{ fontSize: 24, fontWeight: 700 }}>{formatCurrency(totalStats.total)}</div>
              </div>
              <div style={{ width: 1, background: '#e2e8f0' }} />
              <div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>入金済</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(totalStats.paid)}</div>
              </div>
              <div style={{ width: 1, background: '#e2e8f0' }} />
              <div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>未入金</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--danger)' }}>{formatCurrency(totalStats.unpaid)}</div>
              </div>
              <div style={{ width: 1, background: '#e2e8f0' }} />
              <div>
                <div style={{ fontSize: 13, color: '#64748b', marginBottom: 4 }}>回収率</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
                  {totalStats.total > 0 ? Math.round((totalStats.paid / totalStats.total) * 100) : 0}%
                </div>
              </div>
            </div>
            <div className="progress-bar" style={{ marginTop: 16 }}>
              <div
                className="fill"
                style={{
                  width: totalStats.total > 0 ? `${(totalStats.paid / totalStats.total) * 100}%` : '0%',
                  animation: 'progressFill 1.5s ease forwards',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
