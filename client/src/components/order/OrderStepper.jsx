const STEPS = [
  { key: 'pending',    label: 'Order Placed',  icon: '📋' },
  { key: 'confirmed',  label: 'Confirmed',     icon: '✅' },
  { key: 'preparing',  label: 'Preparing',     icon: '👨‍🍳' },
  { key: 'on_the_way', label: 'On the Way',    icon: '🛵' },
  { key: 'delivered',  label: 'Delivered',     icon: '🎉' },
];

export default function OrderStepper({ status }) {
  if (status === 'cancelled') {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <span style={{ fontSize: 40 }}>❌</span>
        <p style={{ fontWeight: 700, color: '#dc2626', marginTop: 8, fontSize: 16 }}>Order Cancelled</p>
      </div>
    );
  }

  const currentIdx = STEPS.findIndex(s => s.key === status);

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
        {/* Progress line */}
        <div style={{ position: 'absolute', top: 20, left: '10%', right: '10%', height: 3, background: '#f3f4f6', zIndex: 0 }} />
        <div style={{
          position: 'absolute', top: 20, left: '10%', height: 3,
          width: `${(currentIdx / (STEPS.length - 1)) * 80}%`,
          background: '#ea580c', zIndex: 1, transition: 'width 0.5s ease',
        }} />

        {STEPS.map((step, idx) => {
          const done    = idx < currentIdx;
          const current = idx === currentIdx;
          return (
            <div key={step.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 2 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: done ? '#ea580c' : current ? '#fff7ed' : 'white',
                border: `3px solid ${done || current ? '#ea580c' : '#e5e7eb'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, marginBottom: 8,
                boxShadow: current ? '0 0 0 4px rgba(234,88,12,0.15)' : 'none',
                transition: 'all 0.3s',
              }}>
                {done ? '✓' : step.icon}
              </div>
              <p style={{ fontSize: 10, fontWeight: current ? 700 : 500, color: done || current ? '#ea580c' : '#9ca3af', textAlign: 'center', lineHeight: 1.3 }}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
