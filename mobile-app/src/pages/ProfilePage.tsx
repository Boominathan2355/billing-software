import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import { User, LogOut, Shield, Info } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout } = useApp();

  return (
    <div className="pb-24 slide-up">
      <header className="p-4 glass-header sticky top-0 z-10">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <User className="text-blue-500" />
          Profile
        </h1>
      </header>

      <main className="p-4 space-y-6">
        <div className="card flex flex-col items-center py-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <User size={40} color="#fff" />
          </div>
          <h2 className="text-xl font-bold">{user?.username}</h2>
          <p className="text-slate-400 text-sm">Administrator</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider px-1">Account Actions</h3>
          <div className="card divide-y divide-white/5 p-0">
             <div className="p-4 flex items-center gap-3 cursor-not-allowed opacity-60">
                <Shield size={20} className="text-slate-400" />
                <div className="flex-1">
                  <div className="font-medium">Change Password</div>
                  <div className="text-xs text-slate-500">Security settings</div>
                </div>
             </div>
             <div className="p-4 flex items-center gap-3 cursor-not-allowed opacity-60">
                <Info size={20} className="text-slate-400" />
                <div className="flex-1">
                  <div className="font-medium">Help & Support</div>
                  <div className="text-xs text-slate-500">Get in touch with us</div>
                </div>
             </div>
             <button 
                onClick={logout}
                className="w-full p-4 flex items-center gap-3 text-red-400 hover:bg-red-500/5 transition-colors text-left"
              >
                <LogOut size={20} />
                <div className="font-medium">Sign Out</div>
             </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
