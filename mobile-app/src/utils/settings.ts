/**
 * App-wide settings stored in localStorage.
 */

const KEYS = {
  GST_ENABLED: 'app_gst_enabled',
  GST_RATE:    'app_gst_rate',
  QR_IMAGE:    'app_qr_image',
};

// ── GST ──────────────────────────────────────────────────────────
export const isGSTEnabled = (): boolean => {
  try { return localStorage.getItem(KEYS.GST_ENABLED) !== 'false'; }
  catch { return false; }
};

export const setGSTEnabled = (enabled: boolean): void => {
  try { localStorage.setItem(KEYS.GST_ENABLED, String(enabled)); }
  catch {}
};

export const getGSTRate = (): number => {
  try {
    const val = localStorage.getItem(KEYS.GST_RATE);
    return val !== null ? parseFloat(val) : 0;
  } catch { return 0; }
};

export const setGSTRate = (rate: number): void => {
  try { localStorage.setItem(KEYS.GST_RATE, String(rate)); }
  catch {}
};

/** Returns the effective GST rate — 0 if disabled */
export const effectiveGSTRate = (): number =>
  isGSTEnabled() ? getGSTRate() : 0;

// ── QR Code ───────────────────────────────────────────────────────
export const getQRImage = (): string | null => {
  try { return localStorage.getItem(KEYS.QR_IMAGE); }
  catch { return null; }
};

export const setQRImage = (base64: string): void => {
  try { localStorage.setItem(KEYS.QR_IMAGE, base64); }
  catch {}
};

export const clearQRImage = (): void => {
  try { localStorage.removeItem(KEYS.QR_IMAGE); }
  catch {}
};
