interface DocumentFinalHeaderProps {
  count: number;
}

export default function DocumentFinalHeader({ count }: DocumentFinalHeaderProps) {
  return (
    <header className="dsec-h">
      <div>
        <span className="k">// FINAL</span>
        <h3>定稿</h3>
      </div>
      <span className="count" id="dc-fin">
        {count}
      </span>
    </header>
  );
}

