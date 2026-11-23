import type { KeyboardEvent } from "react";

interface KeyboardState {
  open: boolean;
  hasToggle: boolean;
  hasFooter: boolean;
  rowCount: number;
  optionCount: number;
  activeIdx: number;
  setActive: (index: number) => void;
  setFlag: (flag: boolean) => void;
  openPicker: (initialQuery?: string, last?: boolean) => void;
  close: (focusToggle: boolean) => void;
  pickRow: (index: number) => void;
  pickFooter: () => void;
}

const isPrintable = (e: KeyboardEvent) =>
  e.key.length === 1 && e.key !== " " && !e.ctrlKey && !e.metaKey && !e.altKey;

/** 关闭态按钮和输入框的键盘行为：↑↓ 移动高亮、Enter 选中、敲字打开 */
export function useSearchKeyboard(s: KeyboardState) {
  const handleToggleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      s.openPicker();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      s.openPicker("", true);
    } else if (isPrintable(e)) {
      e.preventDefault();
      s.openPicker(e.key);
    }
  };

  const handleInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // 不能触发表单提交
      e.preventDefault();
      if (!s.open) return;
      if (s.activeIdx < s.rowCount) s.pickRow(s.activeIdx);
      else if (s.hasFooter) s.pickFooter();
      return;
    }
    if (!s.open) {
      // 面板关着时，↓ 把它再打开；其余键照常输入
      if (!s.hasToggle && e.key === "ArrowDown") {
        e.preventDefault();
        s.setFlag(true);
      }
      return;
    }
    const count = s.optionCount;
    if (e.key === "ArrowDown" && count > 0) {
      e.preventDefault();
      s.setActive((s.activeIdx + 1) % count);
    } else if (e.key === "ArrowUp" && count > 0) {
      e.preventDefault();
      s.setActive((s.activeIdx - 1 + count) % count);
    } else if (e.key === "Tab") {
      s.close(false);
    }
  };

  return { handleToggleKey, handleInputKey };
}
