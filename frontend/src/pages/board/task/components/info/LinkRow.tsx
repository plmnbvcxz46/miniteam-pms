interface LinkRowProps {
  tag: string;
  title: string;
  sub: string;
  state?: string;
  late?: boolean;
  onClick: () => void;
}

export default function LinkRow({
  tag,
  title,
  sub,
  state,
  late = false,
  onClick,
}: LinkRowProps) {
  return (
    <button type="button" className="dep" onClick={onClick}>
      <span className="tag">{tag}</span>
      <b>{title}</b>
      <small>{sub}</small>
      <span className={`s${late ? " late" : ""}`}>{state}</span>
    </button>
  );
}
