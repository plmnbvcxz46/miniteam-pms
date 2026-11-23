import type { ReactNode } from "react";
import { Spinner } from "../../ui/Spinner";
import styles from "./SearchDropdown.module.css";

/** 固定在列表末尾的额外一行（例如“未分配”） */
export interface SearchDropdownFooter {
  content: ReactNode;
  selected?: boolean;
  onPick: () => void;
}

interface PanelProps<T> {
  listId: string;
  labelId?: string;
  headWord: string;
  count: ReactNode;
  rows: T[];
  activeIdx: number;
  loading: boolean;
  loadingText: string;
  emptyText: string;
  footer?: SearchDropdownFooter;
  optionId: (key: string | number) => string;
  footerId: string;
  getKey: (item: T) => string | number;
  renderItem: (item: T, state: { active: boolean }) => ReactNode;
  itemLabel?: (item: T) => string | undefined;
  isSelected?: (item: T) => boolean;
  onHover: (index: number) => void;
  onPickRow: (index: number) => void;
  onPickFooter: () => void;
}

/** 浮层内容：黑底头部（// 词 + 结果数）、可滚动结果列表、可选固定末行 */
export function SearchDropdownPanel<T>(props: PanelProps<T>) {
  const { rows, activeIdx, footer } = props;
  const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault();

  return (
    <>
      <div className={styles.head} aria-hidden="true">
        <span>// {props.headWord}</span>
        <em>{props.count}</em>
      </div>
      <div role="listbox" id={props.listId} aria-labelledby={props.labelId}>
        <div className={styles.list} role="presentation">
          {props.loading && (
            <div className={styles.empty}>
              <Spinner size="sm" />
              {props.loadingText}
            </div>
          )}
          {!props.loading && rows.length === 0 && (
            <div className={styles.empty}>{props.emptyText}</div>
          )}
          {rows.map((item, i) => {
            const key = props.getKey(item);
            return (
              <div
                key={key}
                id={props.optionId(key)}
                role="option"
                aria-selected={props.isSelected?.(item) ?? false}
                aria-label={props.itemLabel?.(item)}
                data-active={i === activeIdx ? "true" : undefined}
                className={styles.option}
                onMouseDown={keepFocus}
                onMouseEnter={() => props.onHover(i)}
                onClick={() => props.onPickRow(i)}
              >
                {props.renderItem(item, { active: i === activeIdx })}
              </div>
            );
          })}
        </div>
        {footer && (
          <div
            id={props.footerId}
            role="option"
            aria-selected={footer.selected ?? false}
            data-active={activeIdx === rows.length ? "true" : undefined}
            className={`${styles.option} ${styles.footer}`}
            onMouseDown={keepFocus}
            onMouseEnter={() => props.onHover(rows.length)}
            onClick={props.onPickFooter}
          >
            {footer.content}
          </div>
        )}
      </div>
    </>
  );
}
