import { useRef, type CSSProperties, type ReactNode } from "react";
import { Popover, PopoverAnchor, PopoverContent } from "../../ui/Popover";
import {
  SearchDropdownPanel,
  type SearchDropdownFooter,
} from "./SearchDropdownPanel";
import { SearchDropdownField } from "./SearchDropdownField";
import { useSearchDropdownModel } from "./useSearchDropdownModel";
import styles from "./SearchDropdown.module.css";

export interface SearchDropdownProps<T> {
  items: T[];
  getKey: (item: T) => string | number;
  /** 行内容；外层的 role、id、高亮由组件负责，常用两栏行见 SearchDropdownRow */
  renderItem: (item: T, state: { active: boolean }) => ReactNode;
  onPick: (item: T) => void;
  /** 读屏用的整行描述 */
  itemLabel?: (item: T) => string | undefined;
  /** 是否是当前已选的项，决定 aria-selected 和橙色描边 */
  isSelected?: (item: T) => boolean;

  /** 输入框内容，受控 */
  value: string;
  onChange: (query: string) => void;
  placeholder?: string;
  /** 输入框外观：下划线（表单抽屉）或带框（工具栏，可带左侧文字） */
  variant?: "line" | "box";
  /** 带框外观里左边的文字，例如“搜索” */
  boxLabel?: string;
  inputId?: string;
  /** 没有外部标签时给输入框的名字 */
  ariaLabel?: string;
  /** 外部标签元素的 id */
  labelId?: string;

  /** 有这个就是“关闭时显示当前值的按钮”，点击、↑↓、敲字才变成输入框 */
  toggle?: ReactNode;
  getInitialActive?: (query: string, last: boolean) => number;
  /** 什么时候掉出面板：聚焦就开，或者有输入才开（默认） */
  openOn?: "focus" | "input";

  /** 面板头部左边的词，前面自动带 // */
  headWord: string;
  /** 面板头部右边的结果数，默认是 items 的数量 */
  count?: ReactNode;
  footer?: SearchDropdownFooter;
  loading?: boolean;
  loadingText?: string;
  emptyText?: string;
  /** 输入框很窄时面板向哪边展开 */
  align?: "left" | "right";
  /** 面板最小宽度（px） */
  minWidth?: number;
}

/** 公共下拉搜索：输入框 + 紧贴下方的结果面板，支持键盘 ↑↓ / Enter / Esc */
export function SearchDropdown<T>(props: SearchDropdownProps<T>) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const model = useSearchDropdownModel(props, {
    root: rootRef,
    input: inputRef,
    toggle: toggleRef,
  });

  return (
    <Popover open={model.open} onOpenChange={model.onOpenChange}>
      <PopoverAnchor asChild>
        <div className={styles.root} ref={rootRef}>
          <SearchDropdownField
            {...model.field}
            variant={props.variant ?? "line"}
            boxLabel={props.boxLabel}
            inputEl={(el) => {
              inputRef.current = el;
            }}
            toggleEl={(el) => {
              toggleRef.current = el;
            }}
            inputId={props.inputId}
            ariaLabel={props.ariaLabel}
            labelId={props.labelId}
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange}
            toggle={props.toggle}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        padding="none"
        align={props.align === "right" ? "end" : "start"}
        sideOffset={4}
        className={styles.pop}
        style={{ "--sd-min": `${props.minWidth ?? 0}px` } as CSSProperties}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={model.keepWhenInRoot}
      >
        <SearchDropdownPanel
          {...model.panel}
          labelId={props.labelId}
          headWord={props.headWord}
          count={props.count ?? props.items.length}
          loading={props.loading ?? false}
          loadingText={props.loadingText ?? "搜索中…"}
          emptyText={props.emptyText ?? "没有匹配的结果"}
          footer={props.footer}
          getKey={props.getKey}
          renderItem={props.renderItem}
          itemLabel={props.itemLabel}
          isSelected={props.isSelected}
        />
      </PopoverContent>
    </Popover>
  );
}
