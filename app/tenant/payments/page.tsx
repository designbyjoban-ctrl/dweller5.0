
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase-browser';
import TenancyCard from '../../../components/TenancyCard';
import StatusBadge from '../../../components/StatusBadge';
import { fmtDate } from '../../../lib/utils';

export default function TenantPayments(){
  const [items, setItems] = useState<any[]>([]);

  const load = async () => {
    const { data } = await supabase.from('payments').select('id,due_date,amount,status,marked_at,paid_at').order('due_date');
    setItems(data||[]);
  };
  useEffect(()=>{ load(); },[]);

  const markPaid = async (id: string) => {
    const res = await fetch('/api/payments/mark-paid', { method:'POST', body: JSON.stringify({ paymentId: id }) });
    if (!res.ok){ const j = await res.json(); alert(j.error||'Error'); return; }
    await load();
    alert('Marked as paid and sent to landlord for approval.');
  };

  return (
    <main>
      <TenancyCard role="TENANT" />
      <h2>Payments</h2>
      {items.map(p => (
        <div key={p.id} className="card">
          <div className="row">
            <div><b>Due:</b> {fmtDate(p.due_date)} • ${Number(p.amount).toFixed(2)}</div>
            <StatusBadge status={p.status} />
          </div>
          <small>{p.marked_at ? `Marked: ${fmtDate(p.marked_at)}`:''} {p.paid_at ? ` • Approved: ${fmtDate(p.paid_at)}`:''}</small>
          <div style={{height:8}} />
          {p.status === 'PENDING' && <button className="btn" onClick={()=>markPaid(p.id)}>Mark Paid</button>}
          {p.status !== 'PENDING' && <small>Awaiting approval or already approved.</small>}
        </div>
      ))}
    </main>
  );
}
