import { useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  type AlertDialogContentProps,
} from "../../components/ui/AlertDialog";
import { Button } from "../../components/ui/Button";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  type ToastItem,
  type ToastProps,
  type ToastTone,
  type ToastViewportProps,
} from "../../components/ui/Toast";
import styles from "../UiShowcasePage.module.css";
import { OverlayFloatingDemo } from "./OverlayFloatingDemo";

function DemoAlertDialogContent(props: AlertDialogContentProps) { return <AlertDialogContent {...props} />; }
function DemoToast(props: ToastProps) { return <Toast {...props} />; }
function DemoToastViewport(props: ToastViewportProps) { return <ToastViewport {...props} />; }

function buildToastItem(seq: number, tone: ToastTone): ToastItem {
  return {
    id: `toast-${seq}`,
    tone,
    title: tone === "danger" ? `文档未定稿，无法标记完成 (#${seq})` : `项目参数已保存 (#${seq})`,
    description:
      tone === "danger"
        ? "请先在“项目文档”中完成关联文档定稿后再流转任务状态。"
        : "多条 Toast 最新在上叠放、各自独立计时 4s，也可点 × 单独关闭。",
  };
}

export function OverlayShowcase() {
  const [menuAction, setMenuAction] = useState("尚未触发");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastSeqRef = useRef(0);

  const triggerToast = (tone: ToastTone) => {
    toastSeqRef.current += 1;
    const seq = toastSeqRef.current;
    setToasts((prev) => [buildToastItem(seq, tone), ...prev]);
    setMenuAction(`已触发 Toast #${seq}（${tone === "danger" ? "danger 警告" : "neutral 常规"}）`);
  };

  const handleConfirmArchive = () => {
    setAlertLoading(true);
    setMenuAction("AlertDialog 正在执行归档…");
    window.setTimeout(() => {
      setAlertLoading(false);
      setAlertOpen(false);
      setMenuAction("AlertDialog 已确认归档项目（模拟异步完成）");
    }, 600);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// OVERLAYS · RADIX UI</span>
          <h2 className={styles.panelTitle}>第 2 批浮层组件交互演示</h2>
        </div>
        <p className={styles.panelNote}>点击触发各浮层，验证键盘导航、Esc 关闭、焦点返回与硬阴影暖纸视觉（不含 Tooltip）</p>
      </div>

      <div className={styles.row}>
        <OverlayFloatingDemo onAction={setMenuAction} />

        <AlertDialog
          open={alertOpen}
          onOpenChange={(next) => {
            if (!alertLoading) {
              setAlertOpen(next);
              setMenuAction(next ? "AlertDialog：已打开二次确认弹窗" : "AlertDialog：已取消并关闭");
            }
          }}
        >
          <AlertDialogTrigger asChild><Button variant="danger">打开 AlertDialog 确认</Button></AlertDialogTrigger>
          <DemoAlertDialogContent
            title="确认归档当前项目？"
            description="归档后项目将变为只读状态，成员无法再新建或修改任务。弹窗打开时键盘焦点默认落在“取消”按钮。"
            confirmLabel="确认归档"
            loading={alertLoading}
            onConfirm={handleConfirmArchive}
          />
        </AlertDialog>

        <Button variant="primary" onClick={() => triggerToast("neutral")}>触发 Toast（neutral）</Button>
        <Button variant="danger" onClick={() => triggerToast("danger")}>触发 Toast（danger）</Button>
      </div>

      <p className={styles.panelNote}>最近浮层动作：{menuAction}</p>

      <ToastProvider swipeDirection="right">
        {toasts.map((item) => (
          <DemoToast
            key={item.id}
            tone={item.tone}
            title={item.title}
            description={item.description}
            duration={item.duration}
            onOpenChange={(open) => { if (!open) setToasts((prev) => prev.filter((t) => t.id !== item.id)); }}
          />
        ))}
        <DemoToastViewport />
      </ToastProvider>
    </section>
  );
}
