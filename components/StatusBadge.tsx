
export default function StatusBadge({ status }: { status: string }) {
  const txt = status.replace('_',' ');
  return <span className="badge">{txt}</span>;
}
