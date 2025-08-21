
'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase-browser';

export default function SharedDocs(){
  const [tenancyId, setTenancyId] = useState('');
  const [entries, setEntries] = useState<any[]>([]);

  const refresh = async (tid: string) => {
    const { data } = await supabase.storage.from('shared_docs').list(`tenancy/${tid}`);
    setEntries(data||[]);
  };

  useEffect(()=>{(async()=>{
    const { data: t } = await supabase.from('tenancies').select('id').eq('active',true).single();
    if (t){ setTenancyId(t.id); await refresh(t.id); }
  })();},[]);

  const upload = async (files: FileList | null) => {
    if (!files || !tenancyId) return;
    for (const f of Array.from(files)){
      const path = `tenancy/${tenancyId}/${f.name}`;
      const { error } = await supabase.storage.from('shared_docs').upload(path, f, { upsert: true });
      if (error) return alert(error.message);
    }
    await refresh(tenancyId);
  };

  const openFile = async (name: string) => {
    const { data } = await supabase.storage.from('shared_docs').createSignedUrl(`tenancy/${tenancyId}/${name}`, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  return (
    <main>
      <h2>Shared Documents</h2>
      <div className="card">
        <input type="file" multiple onChange={e=>upload(e.target.files)} />
      </div>
      {entries.map(o => (
        <div key={o.name} className="card row">
          <div>{o.name}</div>
          <button className="btn secondary" onClick={()=>openFile(o.name)}>Open</button>
        </div>
      ))}
    </main>
  );
}
