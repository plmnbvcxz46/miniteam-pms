import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useDismiss } from "../../layout/useDismiss";
import "./SearchDropdown.css";

/** 固定在列表末尾的额外一行（例如“未分配”） */
export interface SearchDropdownFooter {
  content: ReactNode;
  selected?: boolean;
  className?: string;
  onPick: () => void;
}

interface SearchDropdownProps<T> {
  items: T[];
  getKey: (item: T) => string | number;
  /** 行内容；外层的 role、id、高亮由组件负责 */
  renderItem: (item: T, state: { active: boolean }) => ReactNode;
  onPick: (item: T) => void;
  /** 给行追加类名（行布局、命中/置灰等） */
  itemClassName?: (item: T) => string | undefined;
  /** 读屏用的整行描述 */
  itemLabel?: (item: T) => string | undefined;
  /** 是否是当前已选的项，决定 aria-selected 和橙色描边 */
  isSelected?: (item: T) => boolean;

  /** 输入框内容，受控 */
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
  /** 输入框外观：下划线（表单抽屉）或带框（工具栏，沿用 .field） */
  variant?: "line" | "box";
  /** 带框外观里左边的文字，例如“筛选” */
  boxLabel?: string;
  inputId?: string;
  /** 没有外部标签时给输入框的名字 */
  ariaLabel?: string;
  /** 外部标签元素的 id */
  labelId?: string;

  /** 有这个就是“关闭时显示当前值的按钮”，点击、↑↓、敲字才变成输入框；没有就一直是输入框 */
  toggle?: ReactNode;
  /** 打开时高亮哪一行；last 表示用 ↑ 打开 */
  getInitialActive?: (query: string, last: boolean) => number;
  /** 什么时候掉出面板：聚焦就开，或者有输入才开（默认） */
  openOn?: "focus" | "input";

  /** 面板头部左边的词，前面自动带 // */
  headWord: string;
  /** 面板头部右边的结果数 */
  count?: ReactNode;
  footer?: SearchDropdownFooter;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;

  /** fixed：祖先会裁掉浮层时，按输入框位置定在视口里 */
  placement?: "absolute" | "fixed";
  /** 输入框很窄时面板向哪边展开 */
  align?: "left" | "right";
  /** 面板最小宽度（px） */
  minWidth?: number;
}

export default function SearchDropdown<T>({
  items,
  getKey,
  renderItem,
  onPick,
  itemClassName,
  itemLabel,
  isSelected,
  value,
  onChange,
  placeholder,
  variant = "line",
  boxLabel,
  inputId,
  ariaLabel,
  labelId,
  toggle,
  getInitialActive,
  openOn = "input",
  headWord,
  count,
  footer,
  loading = false,
  loadingText = "搜索中…",
  emptyText = "没有匹配的结果",
  placement = "absolute",
  align = "left",
  minWidth,
}: SearchDropdownProps<T>) {
  const uid = useId();
  const valueId = `${uid}-value`;
  const listId = `${uid}-list`;
  const optionId = (key: string | number) => `${uid}-opt-${key}`;
  const footerId = `${uid}-opt-footer`;
  const hasToggle = toggle !== undefined;

  const [flag, setFlag] = useState(false);
  const [active, setActive] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef(false);

  // 带按钮的：flag 就是开关；一直是输入框的：聚焦或有输入才开
  const open = hasToggle
    ? flag
    : flag && (openOn === "focus" || value.trim() !== "");
  // 加载中不显示（也不能选）上一次的结果
  const shown = loading ? [] : items;
  const rowCount = shown.length;
  const optionCount = rowCount + (footer ? 1 : 0);
  const activeIdx = Math.min(active, Math.max(optionCount - 1, 0));

  const openPicker = (initialQuery = "", last = false) => {
    onChange(initialQuery);
    setActive(
      getInitialActive
        ? getInitialActive(initialQuery, last)
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

  const pick = (item: T) => {
    onPick(item);
    close(true);
  };

  const pickFooter = () => {
    footer?.onPick();
    close(true);
  };

  useDismiss(open, rootRef, () => close(false));

  useEffect(() => {
    if (!hasToggle) return;
    if (flag) inputRef.current?.focus();
    else if (restoreFocus.current) {
      restoreFocus.current = false;
      toggleRef.current?.focus();
    }
  }, [flag, hasToggle]);

  // 键盘移动高亮时，让当前项留在可见范围里
  const activeId = open
    ? activeIdx < rowCount
      ? optionId(getKey(shown[activeIdx]))
      : footer
        ? footerId
        : undefined
    : undefined;
  useEffect(() => {
    if (activeId) {
      document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeId]);

  // fixed：打开后跟着输入框的位置走
  useLayoutEffect(() => {
    if (!open || placement !== "fixed") return;
    const update = () => {
      if (rootRef.current) setRect(rootRef.current.getBoundingClientRect());
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open, placement]);

  const handleToggleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      openPicker();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openPicker("", true);
    } else if (
      e.key.length === 1 &&
      e.key !== " " &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      e.preventDefault();
      openPicker(e.key);
    }
  };

  const handleInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      // 不能触发表单提交
      e.preventDefault();
      if (!open) return;
      if (activeIdx < rowCount) pick(shown[activeIdx]);
      else if (footer) pickFooter();
      return;
    }
    if (!open) {
      // 面板关着时，↓ 把它再打开；其余键照常输入
      if (!hasToggle && e.key === "ArrowDown") {
        e.preventDefault();
        setFlag(true);
      }
      return;
    }
    if (e.key === "ArrowDown" && optionCount > 0) {
      e.preventDefault();
      setActive((activeIdx + 1) % optionCount);
    } else if (e.key === "ArrowUp" && optionCount > 0) {
      e.preventDefault();
      setActive((activeIdx - 1 + optionCount) % optionCount);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  const inputProps = {
    ref: inputRef,
    role: "combobox",
    "aria-expanded": open,
    "aria-controls": open ? listId : undefined,
    "aria-autocomplete": "list" as const,
    "aria-labelledby": labelId,
    "aria-label": labelId ? undefined : ariaLabel,
    "aria-activedescendant": activeId,
    placeholder,
    value,
    onChange: (e: { target: { value: string } }) => {
      onChange(e.target.value);
      setActive(0);
      setFlag(true);
    },
    onKeyDown: handleInputKey,
    onFocus: () => setFlag(true),
    onClick: () => setFlag(true),
  };

  let popStyle: CSSProperties | undefined;
  if (placement === "fixed" && rect) {
    const width = Math.max(rect.width, minWidth ?? 0);
    const left = Math.max(
      8,
      Math.min(
        align === "right" ? rect.right - width : rect.left,
        window.innerWidth - width - 8,
      ),
    );
    popStyle = { position: "fixed", top: rect.bottom + 4, left, width };
  } else if (minWidth) {
    popStyle = { "--sd-min": `${minWidth}px` } as CSSProperties;
  }

  return (
    <div className="sd" ref={rootRef}>
      {hasToggle && !flag ? (
        <button
          className="sd-tg"
          type="button"
          ref={toggleRef}
          aria-haspopup="listbox"
          aria-expanded="false"
          aria-labelledby={labelId ? `${labelId} ${valueId}` : valueId}
          onClick={() => openPicker()}
          onKeyDown={handleToggleKey}
        >
          <span id={valueId} className="sd-tg-val">
            {toggle}
          </span>
        </button>
      ) : variant === "box" ? (
        <label className="field" htmlFor={inputId}>
          {boxLabel}
          <input id={inputId} type="search" {...inputProps} />
        </label>
      ) : (
        <input id={inputId} className="u" {...inputProps} />
      )}

      {open && (
        <div
          className={align === "right" ? "sd-pop right" : "sd-pop"}
          style={popStyle}
        >
          <h4 aria-hidden="true">
            {headWord}
            <em>{count ?? items.length}</em>
          </h4>
          <div role="listbox" id={listId} aria-labelledby={labelId}>
            <div className="sd-list scroll-y" role="presentation">
              {loading && <div className="sd-empty">{loadingText}</div>}
              {!loading && shown.length === 0 && (
                <div className="sd-empty">{emptyText}</div>
              )}
              {shown.map((item, i) => {
                  const key = getKey(item);
                  const classes = ["sd-opt"];
                  if (i === activeIdx) classes.push("on");
                  const extra = itemClassName?.(item);
                  if (extra) classes.push(extra);
                  return (
                    <div
                      key={key}
                      id={optionId(key)}
                      role="option"
                      aria-selected={isSelected ? isSelected(item) : false}
                      aria-label={itemLabel?.(item)}
                      className={classes.join(" ")}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => pick(item)}
                    >
                      {renderItem(item, { active: i === activeIdx })}
                    </div>
                  );
              })}
            </div>
            {footer && (
              <div
                id={footerId}
                role="option"
                aria-selected={footer.selected ?? false}
                className={[
                  "sd-opt",
                  "sd-foot",
                  activeIdx === rowCount ? "on" : "",
                  footer.className ?? "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(rowCount)}
                onClick={pickFooter}
              >
                {footer.content}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
