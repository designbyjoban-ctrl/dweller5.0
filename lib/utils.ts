
export function fmtDate(d?: string | Date | null) {
  if (!d) return '—';
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toLocaleDateString();
}
