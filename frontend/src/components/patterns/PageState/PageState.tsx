import type { ReactNode } from "react";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { Spinner } from "../../ui/Spinner";
import { EmptyState } from "../EmptyState";
import { PageHeader } from "../PageHeader";
import { Panel } from "../Panel";
import styles from "./PageState.module.css";

export type PageStateStatus = "loading" | "missing" | "error" | "empty";

export interface PageStateProps {
  /** 页面状态：loading（加载中）| missing（往期无存档）| error（加载失败）| empty（无数据） */
  status: PageStateStatus;
  /** 可选页头刊头小标 */
  kicker?: ReactNode;
  /** 可选页头主标题 */
  title?: ReactNode;
  /** 可选页头信号橙强调词 */
  accentTitle?: ReactNode;
  /** 状态说明文案 */
  description?: ReactNode;
  /** 可选自定义操作槽 */
  action?: ReactNode;
  /** error 态重试回调 */
  onRetry?: () => void;
  /** 重试按钮文案，默认“重试” */
  retryLabel?: string;
  className?: string;
}

export function PageState({
  status,
  kicker,
  title,
  accentTitle,
  description,
  action,
  onRetry,
  retryLabel = "重试",
  className,
}: PageStateProps) {
  const retryButton =
    action ??
    (onRetry ? (
      <Button size="sm" variant="default" onClick={onRetry}>
        {retryLabel}
      </Button>
    ) : undefined);

  return (
    <section className={className ? `${styles.root} ${className}` : styles.root}>
      {title != null && (
        <PageHeader kicker={kicker} title={title} accentTitle={accentTitle} />
      )}

      {status === "loading" && (
        <div className={styles.loading} role="status">
          <Spinner size="md" />
          <span>{description ?? "正在加载…"}</span>
        </div>
      )}

      {status === "missing" && (
        <Alert variant="inline" tone="info" action={action}>
          {description ?? "这一期没有存档。"}
        </Alert>
      )}

      {status === "error" && (
        <Alert variant="inline" tone="danger" action={retryButton}>
          {description ?? "加载失败，请稍后重试。"}
        </Alert>
      )}

      {status === "empty" && (
        <Panel>
          <EmptyState
            description={description ?? "暂无内容"}
            action={action}
          />
        </Panel>
      )}
    </section>
  );
}
