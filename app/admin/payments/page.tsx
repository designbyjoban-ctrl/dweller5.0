
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase-browser';
import TenancyCard from '../../../components/TenancyCard';
import StatusBadge from '../../../components/StatusBadge';
import { fmtDate } from '../../../lib/utils';

export default function AdminPayments(){
  const [tab, setTab] = useState<'APPROVALS'|'LEDGER'>('APPROVALS');
  const [approvals, setApprovals] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);

  const load = async () => {
    const { data: a } = await supabase.from('payments').select('id,due_date,amount,status,marked_at,paid_at').eq('status','MARKED_PAID').order('due_date');
    const { data: l } = await supabase.from('payments').select('id,due_date,amount,status,marked_at,paid_at').order('due_date',{ascending:false});
    setApprovals(a||[]); setLedger(l||[]);
  };
  useEffect(()=>{ load(); },[]);

  const decide = async (id: string, approve: boolean) => {
    const res = await fetch('/api/payments/approve', { method:'POST', body: JSON.stringify({ paymentId: id, approve }) });
    if (!res.ok){ const j = await res.json(); alert(j.error||'Error'); return; }
    await load();
  };

  return (
    <main>
      <TenancyCard role="ADMIN" />
      <div className="row">
        <div className="badge" style={{cursor:'pointer'}} onClick={()=>setTab('APPROVALS')}>Approval Queue</div>
        <div className="badge" style={{cursor:'pointer'}} onClick={()=>setTab('LEDGER')}>Ledger</div>
      </div>

      {tab==='APPROVALS' && (
        <div>
          {approvals.length===0 && <div className="card">No items awaiting approval.</div>}
          {approvals.map(p => (
            <div key={p.id} className="card">
              <div className="row">
                <div><b>Due:</b> {fmtDate(p.due_date)} • ${Number(p.amount).toFixed(2)}</div>
                <StatusBadge status={p.status} />
              </div>
              <small>Marked at: {fmtDate(p.marked_at)}</small>
              <div style={{display:'flex', gap:8, marginTop:8}}>
                <button className="btn" onClick={()=>decide(p.id, true)}>Approve</button>
                <button className="btn secondary" onClick={()=>decide(p.id, false)}>Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='LEDGER' && (
        <div>
          {ledger.map(p => (
            <div key={p.id} className="card">
              <div className="row">
                <div><b>Due:</b> {fmtDate(p.due_date)} • ${Number(p.amount).toFixed(2)}</div>
                <StatusBadge status={p.status} />
              </div>
              <small>
                {p.marked_at ? `Marked: ${fmtDate(p.marked_at)}`:''}
                {p.paid_at ? ` • Approved: ${fmtDate(p.paid_at)}`:''}
              </small>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
