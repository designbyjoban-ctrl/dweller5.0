
'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase-browser';

export default function SignIn(){
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const send = async () => {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } });
    if (error) alert(error.message); else setSent(true);
  };
  return (
    <main className="card" style={{maxWidth:480, margin:'40px auto'}}>
      <h2>Sign in</h2>
      <div className="label">Email</div>
      <input placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
      <div style={{height:10}} />
      {sent ? <small>Magic link sent. Check your inbox.</small> : <button className="btn" onClick={send}>Send Magic Link</button>}
    </main>
  );
}
