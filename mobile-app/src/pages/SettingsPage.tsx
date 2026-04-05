import BottomNav from '../components/BottomNav';
import { LuSettings, LuInfo, LuBell, LuShield, LuDatabase, LuGlobe } from 'react-icons/lu';

function SettingRow({ icon, label, badge, badgeColor, disabled = false }: {
  icon: React.ReactNode;
  label: string;
  badge: string;
  badgeColor: string;
  disabled?: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 18px', borderBottom: '1px solid var(--border)',
      opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'default',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
        <span style={{ fontWeight: 500, fontSize: 15 }}>{label}</span>
      </div>
      <span style={{
        fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
        background: `${badgeColor}18`, color: badgeColor, letterSpacing: '0.05em',
      }}>
        {badge}
      </span>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <div className="page-content fade-up">

        {/* Header */}
        <div className="page-header">
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--blue)' }}><LuSettings /></span>
            Settings
          </h1>
        </div>

        {/* App Settings */}
        <div style={{ marginBottom: 20 }}>
          <div className="label" style={{ paddingLeft: 4, marginBottom: 10 }}>App Settings</div>
          <div className="card" style={{ padding: 0 }}>
            <SettingRow icon={<LuBell size={20} />}     label="Notifications"   badge="ON"   badgeColor="var(--blue)" />
            <SettingRow icon={<LuDatabase size={20} />} label="Sync with Server" badge="AUTO" badgeColor="var(--green)" />
            <SettingRow icon={<LuShield size={20} />}   label="Biometric Lock"  badge="OFF"  badgeColor="var(--text-muted)" disabled />
          </div>
        </div>

        {/* About */}
        <div style={{ marginBottom: 20 }}>
          <div className="label" style={{ paddingLeft: 4, marginBottom: 10 }}>About</div>
          <div className="card" style={{ padding: 0 }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)' }}><LuInfo size={20} /></span>
              <div>
                <div style={{ fontWeight: 500, fontSize: 15 }}>Version</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>v1.2.4 (Latest)</div>
              </div>
            </div>

            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '16px 18px', textDecoration: 'none', color: 'var(--text)',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}><LuGlobe size={20} /></span>
              <div>
                <div style={{ fontWeight: 500, fontSize: 15 }}>Visit GitHub</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Check for updates &amp; source code</div>
              </div>
            </a>

          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', paddingTop: 8, paddingBottom: 8 }}>
          &copy; 2026 BillERP Systems. All rights reserved.
        </div>

      </div>
      <BottomNav />
    </div>
  );
}
