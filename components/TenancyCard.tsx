
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase-browser';
import { fmtDate } from '../lib/utils';

export default function TenancyCard({ role }: { role: 'ADMIN'|'TENANT' }){
  const [info, setInfo] = useState<any>(null);

  useEffect(()=>{(async()=>{
    const { data: t } = await supabase
      .from('tenancies')
      .select('id, occupants, start_date, end_date, properties(address), profiles:tenant_user_id(full_name, phone)')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1);
    setInfo((t||[])[0] || null);
  })();},[role]);

  if (!info) return null;
  return (
    <div className="card">
      <div className="row">
        <h3>Tenancy</h3>
        <span className="badge">Active</span>
      </div>
      <div className="grid grid-2">
        <div><div className="label">Address</div><div>{info?.properties?.address || '—'}</div></div>
        <div><div className="label">Tenant</div><div>{info?.profiles?.full_name || '—'}</div></div>
        <div><div className="label">Phone</div><div>{info?.profiles?.phone || '—'}</div></div>
        <div><div className="label">Occupants</div><div>{info?.occupants ?? '—'}</div></div>
        <div><div className="label">Duration</div><div>{fmtDate(info?.start_date)} → {info?.end_date ? fmtDate(info.end_date) : 'Ongoing'}</div></div>
      </div>
    </div>
  );
}
