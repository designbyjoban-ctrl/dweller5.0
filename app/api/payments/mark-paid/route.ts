
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '../../../../lib/supabase-server';

export async function POST(req: NextRequest){
  const supa = supabaseServer();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { paymentId } = await req.json();
  const { error } = await supa.from('payments')
    .update({ status: 'MARKED_PAID', marked_at: new Date().toISOString() })
    .eq('id', paymentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}
