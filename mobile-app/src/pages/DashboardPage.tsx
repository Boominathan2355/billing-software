import { useEffect, useState } from 'react';
import type { DashboardMetrics } from '../types';
import api from '../api/client';
import BottomNav from '../components/BottomNav';
import { SkeletonDashboard } from '../components/Skeleton';
import { LuActivity, LuTriangleAlert, LuTrendingUp, LuIndianRupee, LuClock } from 'react-icons/lu';
import { format } from 'date-fns';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const { data } = await api.get<DashboardMetrics>('/dashboard');
        if (active) setMetrics(data);
      } catch (err) {
        console.error('Failed to fetch dashboard', err);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchMetrics();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div>
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Dashboard</h1>
          </div>
          <SkeletonDashboard />
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!metrics) {
    return <div className="empty">Failed to load dashboard data.</div>;
  }

  return (
    <div>
      <div className="page-content fade-up">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--blue)' }}><LuActivity /></span>
            Dashboard
          </h1>
        </div>

        {/* Sales Cards */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--green)', fontSize: 22, fontWeight: 900 }}>
              <LuIndianRupee size={18} />{metrics.salesToday.toFixed(0)}
            </div>
            <div className="stat-label">Sales Today</div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--blue)', fontSize: 22, fontWeight: 900 }}>
              <LuIndianRupee size={18} />{metrics.salesWeek.toFixed(0)}
            </div>
            <div className="stat-label">Sales This Week</div>
          </div>
        </div>

        {/* Outstanding Debt */}
        <div className="card" style={{ marginBottom: 16, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--red)' }}><LuTrendingUp size={14} /></span>
            Total Outstanding Debt
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--red)', fontSize: 30, fontWeight: 900 }}>
            <LuIndianRupee size={24} />{metrics.outstandingDebt.toFixed(0)}
          </div>
        </div>

        {/* Low Stock Alerts */}
        {metrics.lowStock.length > 0 && (
          <div className="card" style={{ marginBottom: 16, background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
              <span style={{ color: 'var(--yellow)' }}><LuTriangleAlert size={16} /></span>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--yellow)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Low Stock Alerts
              </span>
            </div>
            {metrics.lowStock.map(p => (
              <div key={p._id} className="row">
                <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
                <span style={{ color: 'var(--yellow)', fontWeight: 800, fontSize: 13 }}>
                  {p.freeStock} {p.unitName} left
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Recent Activity */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ color: 'var(--text-muted)' }}><LuClock size={16} /></span>
            <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Recent Activity
            </span>
          </div>
          <div className="card">
            {metrics.recentActivity.map(txn => (
              <div key={txn._id} className="row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {txn.category}{txn.customerId ? ` — ${txn.customerId.name}` : ''}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {format(new Date(txn.date), 'dd MMM yyyy, p')}
                  </div>
                </div>
                <span style={{ fontWeight: 800, fontSize: 15, color: txn.type === 'IN' ? 'var(--green)' : 'var(--red)', flexShrink: 0 }}>
                  {txn.type === 'IN' ? '+' : '−'}₹{txn.amount}
                </span>
              </div>
            ))}
            {metrics.recentActivity.length === 0 && (
              <div className="empty" style={{ padding: '24px 0' }}>No recent activity</div>
            )}
          </div>
        </div>

        <div style={{ height: 24 }} />
      </div>

      <BottomNav />
    </div>
  );
}
