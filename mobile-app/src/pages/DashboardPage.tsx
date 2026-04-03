import { useEffect, useState } from 'react';
import type { DashboardMetrics } from '../types';
import api from '../api/client';
import BottomNav from '../components/BottomNav';
import { Activity, AlertTriangle, TrendingUp, IndianRupee, Clock } from 'lucide-react';
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
      <div className="flex items-center justify-center h-[calc(100vh-var(--nav-height))]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!metrics) return (
    <div className="flex items-center justify-center h-[calc(100vh-var(--nav-height))]">
       <div className="empty">Failed to load dashboard data.</div>
    </div>
  );

  return (
    <div className="pb-24 slide-up">
      <header className="p-4 glass-header sticky top-0 z-10">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="text-blue-500" />
          Dashboard
        </h1>
      </header>

      <main className="p-4 space-y-6">
        {/* Sales Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="card">
            <h3 className="text-sm text-slate-400 mb-1">Sales Today</h3>
            <div className="text-2xl font-bold text-green-400 flex items-center">
              <IndianRupee size={20} />
              {metrics.salesToday.toFixed(0)}
            </div>
          </div>
          <div className="card">
            <h3 className="text-sm text-slate-400 mb-1">Sales This Week</h3>
            <div className="text-2xl font-bold text-blue-400 flex items-center">
              <IndianRupee size={20} />
              {metrics.salesWeek.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Debt tracking */}
        <div className="card border-red-500/20 bg-red-500/5">
          <h3 className="text-sm text-slate-400 mb-1 flex items-center gap-2">
            <TrendingUp size={16} className="text-red-400" />
            Total Outstanding Debt
          </h3>
          <div className="text-3xl font-bold text-red-500 flex items-center">
             <IndianRupee size={24} />
             {metrics.outstandingDebt.toFixed(0)}
          </div>
        </div>

        {/* Low Stock Alerts */}
        {metrics.lowStock.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-yellow-500">
              <AlertTriangle size={20} />
              Low Stock Alerts
            </h2>
            <div className="card space-y-3 bg-yellow-500/5 border-yellow-500/20">
              {metrics.lowStock.map(p => (
                <div key={p._id} className="flex justify-between items-center">
                  <span className="font-medium text-slate-200">{p.name}</span>
                  <span className="text-yellow-500 font-bold">{p.freeStock} {p.unitName} left</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recent Activity */}
        <section>
          <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock size={20} className="text-slate-400" />
            Recent Activity
          </h2>
          <div className="card space-y-4">
            {metrics.recentActivity.map(txn => (
              <div key={txn._id} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                <div>
                  <div className="font-medium">{txn.category} {txn.customerId ? ` - ${txn.customerId.name}` : ''}</div>
                  <div className="text-xs text-slate-400">{format(new Date(txn.date), 'dd MMM yyyy, p')}</div>
                </div>
                <div className={`font-bold ${txn.type === 'IN' ? 'text-green-500' : 'text-red-500'}`}>
                  {txn.type === 'IN' ? '+' : '-'} ₹{txn.amount}
                </div>
              </div>
            ))}
            {metrics.recentActivity.length === 0 && (
              <div className="text-center text-slate-500 py-2">No recent activity</div>
            )}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
