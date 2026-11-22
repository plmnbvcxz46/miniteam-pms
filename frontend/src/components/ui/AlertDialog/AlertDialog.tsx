import { useRef, type ComponentPropsWithRef, type ReactNode } from "react";
import { AlertDialog as RadixAlertDialog } from "radix-ui";
import { Button } from "../Button";
import styles from "./AlertDialog.module.css";

export const AlertDialog = RadixAlertDialog.Root;
export const AlertDialogTrigger = RadixAlertDialog.Trigger;

export interface AlertDialogContentProps
  extends Omit<
    ComponentPropsWithRef<typeof RadixAlertDialog.Content>,
    "title" | "asChild" | "children"
  > {
  /** 可选上方英文警示标（默认 // CONFIRM） */
  kicker?: ReactNode;
  /** 弹窗标题（明确动词 + 对象，如“归档项目？”） */
  title: ReactNode;
  /** 后果说明文案 */
  description: ReactNode;
  /** 取消按钮文案，默认“取消” */
  cancelLabel?: string;
  /** 确认按钮文案（明确破坏性动词，如“确认删除”） */
  confirmLabel: string;
  /** 异步提交中状态：禁用取消钮、确认钮展示 Spinner 防连点 */
  loading?: boolean;
  /** 点击确认回调（由调用方控制关闭，支持异步完成后再关闭） */
  onConfirm: () => void;
}

export function AlertDialogContent({
  kicker = "// CONFIRM",
  title,
  description,
  cancelLabel = "取消",
  confirmLabel,
  loading = false,
  onConfirm,
  onOpenAutoFocus,
  className,
  ref,
  ...rest
}: AlertDialogContentProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <RadixAlertDialog.Portal>
      <RadixAlertDialog.Overlay className={styles.overlay} />
      <RadixAlertDialog.Content
        ref={ref}
        onOpenAutoFocus={(event) => {
          onOpenAutoFocus?.(event);
          if (!event.defaultPrevented) {
            event.preventDefault();
            cancelRef.current?.focus();
          }
        }}
        className={
          className ? `${styles.content} ${className}` : styles.content
        }
        {...rest}
      >
        <div className={styles.header}>
          <span className={styles.kicker}>{kicker}</span>
          <RadixAlertDialog.Title className={styles.title}>
            {title}
          </RadixAlertDialog.Title>
        </div>

        <RadixAlertDialog.Description className={styles.description}>
          {description}
        </RadixAlertDialog.Description>

        <div className={styles.actions}>
          <RadixAlertDialog.Cancel asChild>
            <Button ref={cancelRef} variant="default" disabled={loading}>
              {cancelLabel}
            </Button>
          </RadixAlertDialog.Cancel>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </RadixAlertDialog.Content>
    </RadixAlertDialog.Portal>
  );
}
