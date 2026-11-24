import { useEffect, useRef, type ReactNode } from "react";
import styles from "./ActivityFeed.module.css";

export interface ActivityFeedItem {
  id: number | string;
  time: string;
  content: ReactNode;
  title?: string;
}

export type ActivityFeedSurface = "light" | "dark";

export interface ActivityFeedProps {
  items: readonly ActivityFeedItem[];
  surface?: ActivityFeedSurface;
  columns?: 1 | 2;
  /** 单行省略（用于变更记录紧凑模式） */
  truncate?: boolean;
  activeId?: number | string | null;
  onSelect?: (id: number | string) => void;
  emptyText?: ReactNode;
  autoScrollTop?: boolean;
  ariaLabelledBy?: string;
  className?: string;
}

export function ActivityFeed({
  items,
  surface = "light",
  columns = 1,
  truncate = false,
  activeId,
  onSelect,
  emptyText = "暂无记录",
  autoScrollTop = false,
  ariaLabelledBy,
  className,
}: ActivityFeedProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScrollTop && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [autoScrollTop, items.length]);

  if (items.length === 0) {
    return (
      <div className={styles.empty} data-surface={surface}>
        {emptyText}
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      role={ariaLabelledBy ? "region" : undefined}
      aria-labelledby={ariaLabelledBy}
      tabIndex={ariaLabelledBy ? 0 : undefined}
      data-surface={surface}
      data-columns={columns}
      data-truncate={truncate ? "true" : undefined}
      className={className ? `${styles.list} ${className}` : styles.list}
    >
      {items.map((item) => {
        const isActive = activeId != null && item.id === activeId;
        const body = (
          <>
            <time className={styles.time}>{item.time}</time>
            <p className={styles.content}>{item.content}</p>
          </>
        );

        if (onSelect) {
          return (
            <button
              key={item.id}
              type="button"
              title={item.title}
              data-interactive="true"
              data-active={isActive ? "true" : undefined}
              className={styles.item}
              onClick={() => onSelect(item.id)}
            >
              {body}
            </button>
          );
        }

        return (
          <div key={item.id} title={item.title} className={styles.item}>
            {body}
          </div>
        );
      })}
    </div>
  );
}
