interface SwitchProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  /** 两格的文字，默认“开 / 关” */
  texts?: [string, string];
}

/** 两格开关，选中的一格反白 */
export default function Switch({
  label,
  value,
  onChange,
  texts = ["开", "关"],
}: SwitchProps) {
  return (
    <span className="sw2" role="group" aria-label={label}>
      <button
        type="button"
        aria-pressed={value}
        onClick={() => onChange(true)}
      >
        {texts[0]}
      </button>
      <button
        type="button"
        aria-pressed={!value}
        onClick={() => onChange(false)}
      >
        {texts[1]}
      </button>
    </span>
  );
}
