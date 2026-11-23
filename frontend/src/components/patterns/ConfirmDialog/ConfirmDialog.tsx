import type { ReactNode } from "react";
import { AlertDialog, AlertDialogContent } from "../../ui/AlertDialog";

export interface ConfirmDialogProps {
  /** 是否显示 */
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 标题：明确动词 + 对象，如“删除账号？” */
  title: ReactNode;
  /** 后果说明 */
  description: ReactNode;
  /** 确认按钮文案：明确的破坏性动词，如“确认删除” */
  confirmLabel: string;
  cancelLabel?: string;
  /** 异步提交中：禁用取消、确认钮显示 Spinner */
  loading?: boolean;
  /** 点击确认；由调用方在完成后关闭（支持异步） */
  onConfirm: () => void;
}

/** 破坏性操作二次确认：默认焦点落在“取消”，替代 window.confirm 与双击确认 */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
  loading,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        loading={loading}
        onConfirm={onConfirm}
      />
    </AlertDialog>
  );
}
