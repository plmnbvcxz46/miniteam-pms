export default function ArchiveCard() {
  return (
    <div className="arch-card">
      <i aria-hidden="true" />
      <b>往期日报</b>
      <button type="button" className="open-issues">
        查看往期 <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
