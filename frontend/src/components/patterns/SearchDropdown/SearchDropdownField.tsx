import type { KeyboardEvent, ReactNode, RefCallback } from "react";
import { Input } from "../../ui/Input";
import styles from "./SearchDropdown.module.css";

interface FieldProps {
  variant: "line" | "box";
  boxLabel?: string;
  inputEl: RefCallback<HTMLInputElement>;
  toggleEl: RefCallback<HTMLButtonElement>;
  inputId?: string;
  ariaLabel?: string;
  labelId?: string;
  placeholder?: string;
  value: string;
  onChange: (query: string) => void;
  /** 面板是否展开，以及它和高亮项的 id（combobox 无障碍） */
  open: boolean;
  listId: string;
  activeId?: string;
  valueId: string;
  /** 有 toggle 且还没展开时，显示成“当前值”按钮 */
  toggle?: ReactNode;
  showToggle: boolean;
  onFocusOpen: () => void;
  onTypeOpen: () => void;
  onToggleClick: () => void;
  onToggleKey: (e: KeyboardEvent<HTMLButtonElement>) => void;
  onInputKey: (e: KeyboardEvent<HTMLInputElement>) => void;
}

/** 输入框（下划线或带框）或关闭态的“当前值”按钮 */
export function SearchDropdownField({ inputEl, toggleEl, ...p }: FieldProps) {
  if (p.showToggle) {
    return (
      <button
        className={styles.toggle}
        type="button"
        ref={toggleEl}
        aria-haspopup="listbox"
        aria-expanded="false"
        aria-labelledby={p.labelId ? `${p.labelId} ${p.valueId}` : p.valueId}
        onClick={p.onToggleClick}
        onKeyDown={p.onToggleKey}
      >
        <span id={p.valueId} className={styles.toggleValue}>
          {p.toggle}
        </span>
      </button>
    );
  }

  const input = (
    <Input
      variant={p.variant === "box" ? "boxed" : "underline"}
      ref={inputEl}
      id={p.inputId}
      type="search"
      role="combobox"
      aria-expanded={p.open}
      aria-controls={p.open ? p.listId : undefined}
      aria-autocomplete="list"
      aria-labelledby={p.labelId}
      aria-label={p.labelId ? undefined : p.ariaLabel}
      aria-activedescendant={p.activeId}
      placeholder={p.placeholder}
      value={p.value}
      onChange={(e) => {
        p.onChange(e.target.value);
        p.onTypeOpen();
      }}
      onKeyDown={p.onInputKey}
      onFocus={p.onFocusOpen}
      onClick={p.onFocusOpen}
    />
  );

  if (p.variant !== "box") return input;
  return (
    <label className={styles.boxField}>
      {p.boxLabel && <span>{p.boxLabel}</span>}
      {input}
    </label>
  );
}
