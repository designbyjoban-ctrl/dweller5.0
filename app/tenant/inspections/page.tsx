
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase-browser';
import TenancyCard from '../../../components/TenancyCard';
import { fmtDate } from '../../../lib/utils';

export default function TenantInspections(){
  const [inspections, setInspections] = useState<any[]>([]);
  const [tenancyId, setTenancyId] = useState<string>('');

  useEffect(()=>{(async()=>{
    const { data: t } = await supabase.from('tenancies').select('id').eq('active',true).single();
    if (t) setTenancyId(t.id);
    const { data } = await supabase.from('inspections').select('*').order('scheduled_date');
    setInspections(data||[]);
  })();},[]);

  const upload = async (inspectionId: string, files: FileList | null) => {
    if (!files || !tenancyId) return;
    for (const f of Array.from(files)){
      const path = `tenancy/${tenancyId}/inspection/${inspectionId}/${crypto.randomUUID()}-${f.name}`;
      const { error } = await supabase.storage.from('inspection_photos').upload(path, f);
      if (error) return alert(error.message);
    }
    alert('Uploaded');
  };

  return (
    <main>
      <TenancyCard role="TENANT" />
      <h2>Inspections</h2>
      {inspections.map(i => (
        <div key={i.id} className="card">
          <div><b>Date:</b> {fmtDate(i.scheduled_date)}</div>
          <div className="label">Upload photos</div>
          <input type="file" accept="image/*" multiple onChange={e=>upload(i.id, e.target.files)} />
        </div>
      ))}
    </main>
  );
}
