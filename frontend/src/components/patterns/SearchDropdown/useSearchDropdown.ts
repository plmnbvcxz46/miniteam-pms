import { useEffect, useRef, useState, type RefObject } from "react";

interface Options {
  /** 当前可选行数（不含 footer） */
  rowCount: number;
  hasFooter: boolean;
  hasToggle: boolean;
  openOn: "focus" | "input";
  value: string;
  onChange: (query: string) => void;
  /** 选中第 index 行 */
  onPickRow: (index: number) => void;
  onPickFooter: () => void;
  /** 打开时高亮哪一行；last 表示用 ↑ 打开 */
  getInitialActive?: (query: string, last: boolean) => number;
}

/** 下拉搜索的开合、高亮与键盘状态机（WAI-ARIA combobox） */
export function useSearchDropdown(
  options: Options,
  inputRef: RefObject<HTMLInputElement | null>,
  toggleRef: RefObject<HTMLButtonElement | null>,
) {
  const { rowCount, hasFooter, hasToggle, openOn, value, onChange } = options;
  const [flag, setFlag] = useState(false);
  const [active, setActive] = useState(0);
  const restoreFocus = useRef(false);

  // 带按钮的：flag 就是开关；一直是输入框的：聚焦或有输入才开
  const open = hasToggle
    ? flag
    : flag && (openOn === "focus" || value.trim() !== "");
  const optionCount = rowCount + (hasFooter ? 1 : 0);
  const activeIdx = Math.min(active, Math.max(optionCount - 1, 0));

  const openPicker = (initialQuery = "", last = false) => {
    onChange(initialQuery);
    setActive(
      options.getInitialActive
        ? options.getInitialActive(initialQuery, last)
        : last
          ? Math.max(optionCount - 1, 0)
          : 0,
    );
    setFlag(true);
  };

  const close = (focusToggle: boolean) => {
    restoreFocus.current = focusToggle;
    setFlag(false);
    if (hasToggle) onChange("");
  };

  const pickRow = (index: number) => {
    options.onPickRow(index);
    close(true);
  };

  const pickFooter = () => {
    options.onPickFooter();
    close(true);
  };

  useEffect(() => {
    if (!hasToggle) return;
    if (flag) inputRef.current?.focus();
    else if (restoreFocus.current) {
      restoreFocus.current = false;
      toggleRef.current?.focus();
    }
  }, [flag, hasToggle, inputRef, toggleRef]);

  return {
    open,
    flag,
    activeIdx,
    optionCount,
    setActive,
    setFlag,
    openPicker,
    close,
    pickRow,
    pickFooter,
  };
}
