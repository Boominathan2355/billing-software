import { useRef, useState } from 'react';
import BottomNav from '../components/BottomNav';
import {
  LuSettings, LuInfo, LuBell, LuShield, LuDatabase, LuGlobe,
  LuPercent, LuCheck, LuQrCode, LuTrash2, LuUpload,
} from 'react-icons/lu';
import {
  getGSTRate, setGSTRate,
  isGSTEnabled, setGSTEnabled,
  getQRImage, setQRImage, clearQRImage,
} from '../utils/settings';

/* ─── Toggle Switch ─────────────────────────────────────────────── */
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        width: 46, height: 26, borderRadius: 13, cursor: 'pointer',
        background: checked ? 'var(--blue)' : 'var(--surface2)',
        border: '1px solid var(--border)', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute', top: 3,
        left: checked ? 23 : 3,
        width: 18, height: 18, borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </div>
  );
}

/* ─── Info Row ──────────────────────────────────────────────────── */
function SettingRow({ icon, label, badge, badgeColor, disabled = false }: {
  icon: React.ReactNode; label: string; badge: string;
  badgeColor: string; disabled?: boolean;
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
      }}>{badge}</span>
    </div>
  );
}

/* ─── Settings Page ─────────────────────────────────────────────── */
export default function SettingsPage() {
  const [gstEnabled, setGstEnabledState] = useState(isGSTEnabled());
  const [gstInput, setGstInput]           = useState(String(getGSTRate()));
  const [gstSaved, setGstSaved]           = useState(false);

  const [qrImage, setQrImageState] = useState<string | null>(getQRImage());
  const fileRef = useRef<HTMLInputElement>(null);

  // GST handlers
  const toggleGST = (val: boolean) => {
    setGSTEnabled(val);
    setGstEnabledState(val);
  };

  const saveGST = () => {
    const rate = parseFloat(gstInput);
    if (isNaN(rate) || rate < 0 || rate > 100) return;
    setGSTRate(rate);
    setGstSaved(true);
    setTimeout(() => setGstSaved(false), 2000);
  };

  // QR handlers
  const handleQRUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setQRImage(base64);
      setQrImageState(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQR = () => {
    clearQRImage();
    setQrImageState(null);
    if (fileRef.current) fileRef.current.value = '';
  };

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

        {/* ── Billing Settings ─────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <div className="label" style={{ paddingLeft: 4, marginBottom: 10 }}>Billing Settings</div>
          <div className="card" style={{ padding: 0 }}>

            {/* GST toggle row */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 18px',
              borderBottom: gstEnabled ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ color: gstEnabled ? 'var(--blue)' : 'var(--text-muted)' }}>
                  <LuPercent size={20} />
                </span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>GST Tax</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                    {gstEnabled ? `${getGSTRate()}% applied on all bills` : 'Disabled — no tax on bills'}
                  </div>
                </div>
              </div>
              <Toggle checked={gstEnabled} onChange={toggleGST} />
            </div>

            {/* GST rate input — shown only when enabled */}
            {gstEnabled && (
              <div style={{ padding: '14px 18px' }}>
                <label className="label" style={{ marginBottom: 8 }}>GST Rate (%)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      className="input"
                      type="number" min="0" max="100" step="0.5"
                      value={gstInput}
                      onChange={e => { setGstInput(e.target.value); setGstSaved(false); }}
                      placeholder="e.g. 18"
                      style={{ paddingRight: 40 }}
                    />
                    <span style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      color: 'var(--text-muted)', fontWeight: 700, fontSize: 14,
                    }}>%</span>
                  </div>
                  <button onClick={saveGST} className="btn btn-primary" style={{ minWidth: 76, height: 50, fontSize: 14 }}>
                    {gstSaved ? <><LuCheck size={15} /> Saved</> : 'Save'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Online Payment QR ────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <div className="label" style={{ paddingLeft: 4, marginBottom: 10 }}>Online Payment (UPI / QR)</div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <span style={{ color: 'var(--blue)' }}><LuQrCode size={20} /></span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>Payment QR Code</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                  Shown to customers when "Online" payment is selected
                </div>
              </div>
            </div>

            {qrImage ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <img
                  src={qrImage}
                  alt="Payment QR"
                  style={{ width: 180, height: 180, objectFit: 'contain', borderRadius: 16, border: '1px solid var(--border)', background: '#fff', padding: 8 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-ghost" style={{ fontSize: 13, padding: '10px 16px' }}
                    onClick={() => fileRef.current?.click()}>
                    <LuUpload size={14} /> Replace
                  </button>
                  <button className="btn btn-danger" style={{ fontSize: 13, padding: '10px 16px' }}
                    onClick={handleRemoveQR}>
                    <LuTrash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ) : (
              <button className="btn btn-ghost btn-full" style={{ height: 90, flexDirection: 'column', gap: 6 }}
                onClick={() => fileRef.current?.click()}>
                <LuUpload size={24} />
                <span style={{ fontSize: 13 }}>Upload QR Image</span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 400 }}>PNG, JPG supported</span>
              </button>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleQRUpload}
            />
          </div>
        </div>

        {/* ── App Settings ─────────────────────────────── */}
        <div style={{ marginBottom: 20 }}>
          <div className="label" style={{ paddingLeft: 4, marginBottom: 10 }}>App Settings</div>
          <div className="card" style={{ padding: 0 }}>
            <SettingRow icon={<LuBell size={20} />}     label="Notifications"    badge="ON"   badgeColor="var(--blue)" />
            <SettingRow icon={<LuDatabase size={20} />} label="Sync with Server" badge="AUTO" badgeColor="var(--green)" />
            <SettingRow icon={<LuShield size={20} />}   label="Biometric Lock"   badge="OFF"  badgeColor="var(--text-muted)" disabled />
          </div>
        </div>

        {/* ── About ────────────────────────────────────── */}
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
            <a href="https://github.com" target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 18px', textDecoration: 'none', color: 'var(--text)' }}>
              <span style={{ color: 'var(--text-muted)' }}><LuGlobe size={20} /></span>
              <div>
                <div style={{ fontWeight: 500, fontSize: 15 }}>Visit GitHub</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Check for updates &amp; source code</div>
              </div>
            </a>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', paddingBottom: 8 }}>
          &copy; 2026 BillERP Systems. All rights reserved.
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
