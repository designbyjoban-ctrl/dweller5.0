
import './globals.css';

export const metadata = { title: 'Dwellr — Minimal', description: 'Dwellr minimal app (no Stripe, no email)' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header">
            <div className="brand"><div className="logo" /> Dwellr</div>
            <nav className="nav">
              <a href="/">Home</a>
              <a href="/tenant/payments">Tenant</a>
              <a href="/admin/payments">Landlord</a>
              <a href="/tenant/inspections">Inspections</a>
              <a href="/shared-docs">Shared Docs</a>
              <a href="/sign-in">Sign in</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
