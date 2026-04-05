import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import { LuUser, LuLogOut, LuShield, LuInfo } from 'react-icons/lu';

export default function ProfilePage() {
  const { user, logout } = useApp();

  return (
    <div>
      <div className="page-content fade-up">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--blue)' }}><LuUser /></span>
            Profile
          </h1>
        </div>

        {/* Avatar Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px', marginBottom: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 22,
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16, boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          }}>
            <LuUser size={40} color="#fff" />
          </div>
          <div style={{ fontSize: 20, fontWeight: 900 }}>{user?.username}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Administrator</div>
        </div>

        {/* Actions */}
        <div style={{ marginBottom: 20 }}>
          <div className="label" style={{ paddingLeft: 4, marginBottom: 10 }}>Account Actions</div>
          <div className="card" style={{ padding: 0 }}>

            {/* Change Password (disabled) */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 18px', borderBottom: '1px solid var(--border)',
              opacity: 0.5, cursor: 'not-allowed',
            }}>
              <span style={{ color: 'var(--text-muted)' }}><LuShield size={20} /></span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Change Password</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Security settings</div>
              </div>
            </div>

            {/* Help (disabled) */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 18px', borderBottom: '1px solid var(--border)',
              opacity: 0.5, cursor: 'not-allowed',
            }}>
              <span style={{ color: 'var(--text-muted)' }}><LuInfo size={20} /></span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Help &amp; Support</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Get in touch with us</div>
              </div>
            </div>

            {/* Sign Out */}
            <button onClick={logout} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 12,
              padding: '16px 18px', background: 'none', border: 'none',
              color: 'var(--red)', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
            }}>
              <LuLogOut size={20} />
              <div style={{ fontWeight: 600, fontSize: 15 }}>Sign Out</div>
            </button>

          </div>
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
