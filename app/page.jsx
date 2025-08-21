
export default function Landing(){
  return (
    <main className="center">
      <div className="logo-big" />
      <h1 style={{fontSize:28, marginBottom:6}}>Dwellr</h1>
      <p style={{opacity:.75, marginBottom:14}}>Minimal tenancy portal</p>
      <div style={{display:'flex', gap:10}}>
        <a className="btn" href="/sign-in?role=tenant">Login as Tenant</a>
        <a className="btn secondary" href="/sign-in?role=landlord">Login as Landlord</a>
      </div>
    </main>
  );
}
