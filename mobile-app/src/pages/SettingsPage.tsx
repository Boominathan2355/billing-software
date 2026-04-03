import BottomNav from '../components/BottomNav';
import { Settings, Info, Bell, Shield, Database, Globe } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="pb-24 slide-up">
      <header className="p-4 glass-header sticky top-0 z-10">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="text-blue-500" />
          Settings
        </h1>
      </header>

      <main className="p-4 space-y-6">
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">App Settings</h3>
          <div className="card divide-y divide-white/5 p-0">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-blue-400" />
                <span>Notifications</span>
              </div>
              <div className="text-xs text-blue-500 font-bold px-2 py-1 bg-blue-500/10 rounded-full">ON</div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database size={20} className="text-green-400" />
                <span>Sync with Server</span>
              </div>
              <div className="text-xs text-green-500 font-bold px-2 py-1 bg-green-500/10 rounded-full">AUTO</div>
            </div>
            <div className="p-4 flex items-center justify-between cursor-not-allowed opacity-60">
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-purple-400" />
                <span>Biometric Lock</span>
              </div>
              <div className="text-xs text-slate-500 font-bold px-2 py-1 bg-slate-500/10 rounded-full">OFF</div>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">About</h3>
          <div className="card divide-y divide-white/5 p-0">
            <div className="p-4 flex items-center gap-3">
              <Info size={20} className="text-slate-400" />
              <div className="flex-1">
                <div className="font-medium">Version</div>
                <div className="text-xs text-slate-500">v1.2.4 (Latest)</div>
              </div>
            </div>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
            >
              <Globe size={20} className="text-slate-400" />
              <div className="flex-1">
                <div className="font-medium">Visit GitHub</div>
                <div className="text-xs text-slate-500">Check for updates & source code</div>
              </div>
            </a>
          </div>
        </section>

        <div className="text-center text-xs text-slate-500 pt-4">
          &copy; 2026 BillERP Systems. All rights reserved.
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
