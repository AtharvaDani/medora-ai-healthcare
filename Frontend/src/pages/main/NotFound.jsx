export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', marginTop: 200 }}>
      <img src="/logo.svg" alt="Medora AI" width={80} height={80} style={{ borderRadius: '50%' }} />
      <h3 style={{ marginTop: 16 }}>Oops! This page isn&apos;t available</h3>
      <p style={{ color: '#64748b' }}>Head back to Medora AI Healthcare and try again.</p>
      <a href="/login" className="btn btn-primary">Go to Medora AI</a>
    </div>
  );
}
