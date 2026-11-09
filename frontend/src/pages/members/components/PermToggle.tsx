interface PermToggleProps {
  /** 是否拥有该权限 */
  hasPerm: boolean;
  /** 是否禁用切换（如 PM 拥有全部权限不可关，或当前用户无管理成员权限） */
  disabled?: boolean;
  /** 权限名称说明（用于辅助功能） */
  label?: string;
  /** 切换回调 */
  onToggle: () => void;
}

export default function PermToggle({
  hasPerm,
  disabled = false,
  label,
  onToggle,
}: PermToggleProps) {
  return (
    <button
      type="button"
      className="pm"
      role="switch"
      aria-checked={hasPerm}
      aria-pressed={hasPerm}
      aria-label={label ? `${label}：${hasPerm ? "有" : "无"}` : undefined}
      disabled={disabled}
      onClick={onToggle}
    >
      <i aria-hidden="true" />
      <span>{hasPerm ? "有" : "无"}</span>
    </button>
  );
}

