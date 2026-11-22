import { useId, type FormEvent, type ReactNode } from "react";
import { Alert } from "../../ui/Alert";
import { Button } from "../../ui/Button";
import { Drawer, DrawerContent } from "../../ui/Drawer";
import styles from "./FormDrawer.module.css";

export interface FormDrawerProps {
  /** 是否展开抽屉 */
  open: boolean;
  /** 开关状态变化回调 */
  onOpenChange: (open: boolean) => void;
  /** 可选上方英文小标 */
  kicker?: ReactNode;
  /** 抽屉标题前半段 */
  title: ReactNode;
  /** 抽屉标题信号橙强调词 */
  accentTitle?: ReactNode;
  /** 可选标题下方说明 */
  description?: ReactNode;
  /** 主提交按钮文案 */
  submitLabel: string;
  /** 取消按钮文案，默认“取消” */
  cancelLabel?: string;
  /** 提交中状态 */
  submitting?: boolean;
  /** 是否禁用提交按钮 */
  submitDisabled?: boolean;
  /** 提交失败等表单级错误提示 */
  submitError?: ReactNode;
  /** 可选底部右侧辅助说明 */
  footerNote?: ReactNode;
  /** 表单提交回调 */
  onSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
  children: ReactNode;
}

export function FormDrawer({
  open,
  onOpenChange,
  kicker,
  title,
  accentTitle,
  description,
  submitLabel,
  cancelLabel = "取消",
  submitting = false,
  submitDisabled = false,
  submitError,
  footerNote,
  onSubmit,
  children,
}: FormDrawerProps) {
  const formId = useId();
  const fullTitle =
    accentTitle != null ? (
      <>
        {title}
        <em className={styles.accent}>{accentTitle}</em>
      </>
    ) : (
      title
    );

  const footer = (
    <div className={styles.footerRow}>
      <div className={styles.footerActions}>
        <Button
          type="submit"
          form={formId}
          variant="accent"
          loading={submitting}
          disabled={submitDisabled}
        >
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="default"
          disabled={submitting}
          onClick={() => onOpenChange(false)}
        >
          {cancelLabel}
        </Button>
      </div>
      {footerNote != null && (
        <span className={styles.footerNote}>{footerNote}</span>
      )}
    </div>
  );

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        size="md"
        kicker={kicker}
        title={fullTitle}
        description={description}
        footer={footer}
      >
        <form id={formId} className={styles.form} noValidate onSubmit={onSubmit}>
          {children}
          {Boolean(submitError) && (
            <Alert variant="inline" tone="danger">
              {submitError}
            </Alert>
          )}
        </form>
      </DrawerContent>
    </Drawer>
  );
}
