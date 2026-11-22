import { useRef, useState } from "react";
import { Button } from "../../components/ui/Button";
import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  type PopoverContentProps,
  type PopoverTriggerProps,
} from "../../components/ui/Popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  type DropdownMenuContentProps,
  type DropdownMenuItemProps,
  type DropdownMenuItemTone,
  type DropdownMenuLabelProps,
  type DropdownMenuSeparatorProps,
} from "../../components/ui/DropdownMenu";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
  type DrawerContentProps,
  type DrawerSize,
} from "../../components/ui/Drawer";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
  type AlertDialogContentProps,
} from "../../components/ui/AlertDialog";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  type ToastItem,
  type ToastProps,
  type ToastTone,
  type ToastViewportProps,
} from "../../components/ui/Toast";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import styles from "../UiShowcasePage.module.css";

function DemoPopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverTrigger {...props} />;
}

function DemoPopoverContent(props: PopoverContentProps) {
  return <PopoverContent {...props} />;
}

function DemoMenuContent(props: DropdownMenuContentProps) {
  return <DropdownMenuContent {...props} />;
}

function DemoMenuItem(props: DropdownMenuItemProps) {
  return <DropdownMenuItem {...props} />;
}

function DemoMenuLabel(props: DropdownMenuLabelProps) {
  return <DropdownMenuLabel {...props} />;
}

function DemoMenuSeparator(props: DropdownMenuSeparatorProps) {
  return <DropdownMenuSeparator {...props} />;
}

function DemoDrawerContent(props: DrawerContentProps) {
  return <DrawerContent {...props} />;
}

function DemoAlertDialogContent(props: AlertDialogContentProps) {
  return <AlertDialogContent {...props} />;
}

function DemoToast(props: ToastProps) {
  return <Toast {...props} />;
}

function DemoToastViewport(props: ToastViewportProps) {
  return <ToastViewport {...props} />;
}

const DANGER_TONE: DropdownMenuItemTone = "danger";
const DRAWER_SIZES: { size: DrawerSize; label: string }[] = [
  { size: "md", label: "打开 md 表单抽屉（640px）" },
  { size: "lg", label: "打开 lg 设置抽屉（880px）" },
];

export function OverlayShowcase() {
  const [menuAction, setMenuAction] = useState("尚未触发");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertLoading, setAlertLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastSeqRef = useRef(0);

  const triggerToast = (tone: ToastTone) => {
    toastSeqRef.current += 1;
    const seq = toastSeqRef.current;
    const nextItem: ToastItem = {
      id: `toast-${seq}`,
      tone,
      title:
        tone === "danger"
          ? `文档未定稿，无法标记完成 (#${seq})`
          : `项目参数已保存 (#${seq})`,
      description:
        tone === "danger"
          ? "请先在“项目文档”中完成关联文档定稿后再流转任务状态。"
          : "多条 Toast 最新在上叠放、各自独立计时 4s，也可点 × 单独关闭。",
    };
    setToasts((prev) => [nextItem, ...prev]);
  };

  const handleConfirmArchive = () => {
    setAlertLoading(true);
    window.setTimeout(() => {
      setAlertLoading(false);
      setAlertOpen(false);
      setMenuAction("已确认归档项目（模拟异步完成）");
    }, 600);
  };
  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.panelHeading}>
          <span className={styles.kicker}>// OVERLAYS · RADIX UI</span>
          <h2 className={styles.panelTitle}>第 2 批浮层组件交互演示</h2>
        </div>
        <p className={styles.panelNote}>
          点击触发各浮层，验证键盘导航、Esc 关闭、焦点返回与硬阴影暖纸视觉（不含 Tooltip）
        </p>
      </div>

      <div className={styles.row}>
        <Popover>
          <PopoverAnchor asChild>
            <DemoPopoverTrigger>展开 Popover 浮层 ▾</DemoPopoverTrigger>
          </PopoverAnchor>
          <DemoPopoverContent>
            <div className={styles.popoverBody}>
              <span className={styles.kicker}>// ISSUE ARCHIVE</span>
              <span className={styles.code}>第 32 期 · 2026.11.22</span>
              <span className={styles.desc}>
                基于 Radix Popover Portal 渲染，自动碰撞翻转、Esc 或点击外部关闭并返还焦点。
              </span>
              <div className={styles.row}>
                <PopoverClose asChild>
                  <Button size="sm" variant="primary">
                    确认切换
                  </Button>
                </PopoverClose>
                <PopoverClose asChild>
                  <Button size="sm" variant="default">
                    取消
                  </Button>
                </PopoverClose>
              </div>
            </div>
          </DemoPopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default">账号操作 DropdownMenu ▾</Button>
          </DropdownMenuTrigger>
          <DemoMenuContent>
            <DemoMenuLabel>当前账号 · ADMIN</DemoMenuLabel>
            <DemoMenuItem onSelect={() => setMenuAction("打开个人资料")}>
              个人资料与密码
            </DemoMenuItem>
            <DemoMenuItem onSelect={() => setMenuAction("打开系统设置")}>
              系统参数与日志
            </DemoMenuItem>
            <DemoMenuItem disabled>切换演示账号（已禁用）</DemoMenuItem>
            <DemoMenuSeparator />
            <DemoMenuItem
              tone={DANGER_TONE}
              onSelect={() => setMenuAction("退出当前登录")}
            >
              退出登录
            </DemoMenuItem>
          </DemoMenuContent>
        </DropdownMenu>

        {DRAWER_SIZES.map(({ size, label }) => (
          <Drawer key={size}>
            <DrawerTrigger asChild>
              <Button variant="default">{label}</Button>
            </DrawerTrigger>
            <DemoDrawerContent
              size={size}
              kicker={`// DRAWER · ${size.toUpperCase()}`}
              title={size === "md" ? "新建任务" : "系统设置"}
              description="基于 Radix Dialog：点阵遮罩、双横线刊头、焦点陷阱、按 Esc 关闭并返还焦点。"
              footer={
                <>
                  <DrawerClose asChild>
                    <Button variant="accent">保存并关闭</Button>
                  </DrawerClose>
                  <DrawerClose asChild>
                    <Button variant="default">取消</Button>
                  </DrawerClose>
                </>
              }
            >
              <div className={styles.drawerBody}>
                <Field label="名称" required>
                  <Input placeholder="输入示例标题，按 Tab 测试焦点陷阱" />
                </Field>
                <Field label="计划开始日" required>
                  <Input type="date" defaultValue="2026-11-22" />
                </Field>
              </div>
            </DemoDrawerContent>
          </Drawer>
        ))}

        <AlertDialog
          open={alertOpen}
          onOpenChange={(next) => {
            if (!alertLoading) setAlertOpen(next);
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant="danger">打开 AlertDialog 确认</Button>
          </AlertDialogTrigger>
          <DemoAlertDialogContent
            title="确认归档当前项目？"
            description="归档后项目将变为只读状态，成员无法再新建或修改任务。弹窗打开时键盘焦点默认落在“取消”按钮。"
            confirmLabel="确认归档"
            loading={alertLoading}
            onConfirm={handleConfirmArchive}
          />
        </AlertDialog>

        <Button variant="primary" onClick={() => triggerToast("neutral")}>
          触发 Toast（neutral）
        </Button>
        <Button variant="danger" onClick={() => triggerToast("danger")}>
          触发 Toast（danger）
        </Button>
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
            onOpenChange={(open) => {
              if (!open) {
                setToasts((prev) => prev.filter((t) => t.id !== item.id));
              }
            }}
          />
        ))}
        <DemoToastViewport />
      </ToastProvider>
    </section>
  );
}
