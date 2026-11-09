interface DocumentFinalHeaderProps {
  count: number;
}

export default function DocumentFinalHeader({ count }: DocumentFinalHeaderProps) {
  return (
    <header className="dsec-h">
      <div>
        <span className="k t-kicker">// FINAL</span>
        <h3 className="t-section-title">定稿</h3>
      </div>
      <span className="count" id="dc-fin">
        {count}
      </span>
    </header>
  );
}

