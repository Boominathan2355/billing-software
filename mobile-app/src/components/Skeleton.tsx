/** A single skeleton block. w/h can be any valid CSS value. */
export function SkeletonBlock({
  w = '100%',
  h = 16,
  radius = 10,
  style,
}: {
  w?: string | number;
  h?: string | number;
  radius?: number;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className="skeleton"
      style={{ width: w, height: h, borderRadius: radius, flexShrink: 0, ...style }}
    />
  );
}

/** Skeleton that looks like a list of cards (e.g. Customer or Inventory list) */
export function SkeletonCardList({ count = 4, avatarSize = 44 }: { count?: number; avatarSize?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="card"
          style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}
        >
          {/* Avatar circle */}
          <SkeletonBlock w={avatarSize} h={avatarSize} radius={14} />
          {/* Text lines */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBlock w="55%" h={14} />
            <SkeletonBlock w="35%" h={12} />
          </div>
          {/* Badge */}
          <SkeletonBlock w={48} h={24} radius={8} />
        </div>
      ))}
    </>
  );
}

/** Skeleton for the Dashboard page */
export function SkeletonDashboard() {
  return (
    <>
      {/* Stat cards row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div className="stat-card" style={{ flex: 1 }}>
          <SkeletonBlock w="60%" h={28} radius={8} style={{ marginBottom: 8 }} />
          <SkeletonBlock w="80%" h={12} />
        </div>
        <div className="stat-card" style={{ flex: 1 }}>
          <SkeletonBlock w="60%" h={28} radius={8} style={{ marginBottom: 8 }} />
          <SkeletonBlock w="80%" h={12} />
        </div>
      </div>
      {/* Debt card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <SkeletonBlock w="50%" h={12} style={{ marginBottom: 12 }} />
        <SkeletonBlock w="40%" h={32} radius={8} />
      </div>
      {/* Activity list */}
      <div className="card">
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 3 ? 16 : 0 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SkeletonBlock w="65%" h={13} />
              <SkeletonBlock w="40%" h={11} />
            </div>
            <SkeletonBlock w={56} h={20} radius={6} />
          </div>
        ))}
      </div>
    </>
  );
}

/** Skeleton for the CustomerDetail page */
export function SkeletonCustomerDetail() {
  return (
    <div style={{ padding: '20px 16px' }}>
      {/* Back button placeholder */}
      <SkeletonBlock w={80} h={32} radius={10} style={{ marginBottom: 24 }} />
      {/* Hero */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <SkeletonBlock w={60} h={60} radius={18} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SkeletonBlock w="55%" h={22} radius={8} />
          <SkeletonBlock w="35%" h={14} radius={6} />
        </div>
      </div>
      {/* Balance card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <SkeletonBlock w="40%" h={14} style={{ marginBottom: 12 }} />
        <SkeletonBlock w="50%" h={36} radius={10} />
      </div>
      {/* History */}
      <div className="card">
        <SkeletonBlock w="45%" h={13} style={{ marginBottom: 16 }} />
        {[1, 2, 3].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: i < 3 ? 16 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SkeletonBlock w={160} h={13} />
              <SkeletonBlock w={100} h={11} />
            </div>
            <SkeletonBlock w={64} h={20} radius={6} />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton for Books page (transaction list) */
export function SkeletonBooks() {
  return (
    <>
      {/* Balance summary card */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBlock w={80} h={11} />
            <SkeletonBlock w={100} h={24} radius={8} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <SkeletonBlock w={80} h={11} />
            <SkeletonBlock w={100} h={24} radius={8} />
          </div>
        </div>
      </div>
      {/* Transaction rows */}
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="card" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
          <SkeletonBlock w={40} h={40} radius={12} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SkeletonBlock w="60%" h={13} />
            <SkeletonBlock w="40%" h={11} />
          </div>
          <SkeletonBlock w={64} h={20} radius={6} />
        </div>
      ))}
    </>
  );
}
