import { useEffect, useId, type RefObject } from "react";
import type { SearchDropdownProps } from "./SearchDropdown";
import { useSearchDropdown } from "./useSearchDropdown";
import { useSearchKeyboard } from "./useSearchKeyboard";

interface Refs {
  root: RefObject<HTMLDivElement | null>;
  input: RefObject<HTMLInputElement | null>;
  toggle: RefObject<HTMLButtonElement | null>;
}

/** 键盘移动高亮时，让当前项留在可见范围里 */
function useScrollActiveIntoView(activeId: string | undefined) {
  useEffect(() => {
    if (activeId) {
      document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeId]);
}

/** 把下拉搜索的状态、键盘、无障碍 id 汇总成输入框和面板要用的属性 */
export function useSearchDropdownModel<T>(
  props: SearchDropdownProps<T>,
  refs: Refs,
) {
  const { items, getKey, footer, toggle, loading = false } = props;
  const uid = useId();
  const valueId = `${uid}-value`;
  const listId = `${uid}-list`;
  const footerId = `${uid}-opt-footer`;
  const optionId = (key: string | number) => `${uid}-opt-${key}`;
  const rows = loading ? [] : items; // 加载中不显示（也不能选）上一次的结果
  const hasToggle = toggle !== undefined;
  const hasFooter = footer !== undefined;

  const dd = useSearchDropdown(
    {
      rowCount: rows.length,
      hasFooter,
      hasToggle,
      openOn: props.openOn ?? "input",
      value: props.value,
      onChange: props.onChange,
      getInitialActive: props.getInitialActive,
      onPickRow: (i) => props.onPick(rows[i]),
      onPickFooter: () => footer?.onPick(),
    },
    refs.input,
    refs.toggle,
  );
  const keys = useSearchKeyboard({
    ...dd,
    hasToggle,
    hasFooter,
    rowCount: rows.length,
  });

  const activeId = dd.open
    ? dd.activeIdx < rows.length
      ? optionId(getKey(rows[dd.activeIdx]))
      : footer
        ? footerId
        : undefined
    : undefined;
  useScrollActiveIntoView(activeId);

  return {
    open: dd.open,
    // 输入框自己的点击和聚焦不算“点到浮层外面”
    keepWhenInRoot: (e: {
      target: EventTarget | null;
      preventDefault: () => void;
    }) => {
      if (e.target instanceof Node && refs.root.current?.contains(e.target)) {
        e.preventDefault();
      }
    },
    onOpenChange: (next: boolean) => !next && dd.close(true),
    field: {
      open: dd.open,
      listId,
      activeId,
      valueId,
      showToggle: hasToggle && !dd.flag,
      onFocusOpen: () => dd.setFlag(true),
      onTypeOpen: () => (dd.setActive(0), dd.setFlag(true)),
      onToggleClick: () => dd.openPicker(),
      onToggleKey: keys.handleToggleKey,
      onInputKey: keys.handleInputKey,
    },
    panel: {
      listId,
      rows,
      optionId,
      footerId,
      activeIdx: dd.activeIdx,
      onHover: dd.setActive,
      onPickRow: dd.pickRow,
      onPickFooter: dd.pickFooter,
    },
  };
}
