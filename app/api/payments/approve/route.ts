
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabase-server';

export async function POST(req: NextRequest){
  const supa = supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { paymentId, approve } = await req.json();
  if (approve){
    const { error } = await supa.from('payments')
      .update({ status: 'APPROVED', paid_at: new Date().toISOString(), approved_by: user.id })
      .eq('id', paymentId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  } else {
    const { error } = await supa.from('payments')
      .update({ status: 'PENDING', marked_at: null })
      .eq('id', paymentId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
