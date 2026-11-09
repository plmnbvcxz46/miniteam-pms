interface FigureItemProps {
  label: string;
  value: number | string;
  unit?: string;
  alert?: boolean;
}

export default function FigureItem({
  label,
  value,
  unit,
  alert = false,
}: FigureItemProps) {
  return (
    <div className={`figure${alert ? " alert" : ""}`}>
      <div className="lbl">{label}</div>
      <div className="num">
        {value}
        {unit && <small>{unit}</small>}
      </div>
    </div>
  );
}
