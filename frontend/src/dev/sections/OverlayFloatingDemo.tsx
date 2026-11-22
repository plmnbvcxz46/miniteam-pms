import { useRef } from "react";
import { Button } from "../../components/ui/Button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTrigger,
  type DrawerContentProps,
  type DrawerSize,
} from "../../components/ui/Drawer";
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
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import {
  Popover,
  PopoverAnchor,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
  type PopoverContentProps,
  type PopoverPadding,
  type PopoverTriggerProps,
} from "../../components/ui/Popover";
import styles from "../UiShowcasePage.module.css";
import widgetStyles from "./ShowcaseWidgets.module.css";

function DemoPopoverTrigger(props: PopoverTriggerProps) { return <PopoverTrigger {...props} />; }
function DemoPopoverContent(props: PopoverContentProps) { return <PopoverContent {...props} />; }
function DemoMenuContent(props: DropdownMenuContentProps) { return <DropdownMenuContent {...props} />; }
function DemoMenuItem(props: DropdownMenuItemProps) { return <DropdownMenuItem {...props} />; }
function DemoMenuLabel(props: DropdownMenuLabelProps) { return <DropdownMenuLabel {...props} />; }
function DemoMenuSeparator(props: DropdownMenuSeparatorProps) { return <DropdownMenuSeparator {...props} />; }
function DemoDrawerContent(props: DrawerContentProps) { return <DrawerContent {...props} />; }

const DANGER_TONE: DropdownMenuItemTone = "danger";
const DEFAULT_POPOVER_PADDING: PopoverPadding = "default";
const DRAWER_SIZES: { size: DrawerSize; label: string }[] = [
  { size: "md", label: "打开 md 表单抽屉（640px）" },
  { size: "lg", label: "打开 lg 设置抽屉（880px）" },
];

function PopoverAndMenuDemo({ onAction }: { onAction: (action: string) => void }) {
  const explicitActionRef = useRef(false);
  return (
    <>
      <Popover
        onOpenChange={(open) => {
          if (open) onAction("Popover：已展开浮层");
          else if (!explicitActionRef.current) onAction("Popover：已关闭浮层（Esc / 点击外部）");
          explicitActionRef.current = false;
        }}
      >
        <PopoverAnchor asChild><DemoPopoverTrigger>展开 Popover 浮层 ▾</DemoPopoverTrigger></PopoverAnchor>
        <DemoPopoverContent padding={DEFAULT_POPOVER_PADDING}>
          <div className={widgetStyles.popoverBody}>
            <span className={styles.kicker}>// ISSUE ARCHIVE</span>
            <span className={styles.code}>第 32 期 · 2026.11.22</span>
            <span className={styles.desc}>基于 Radix Popover Portal 渲染，自动碰撞翻转、Esc 或点击外部关闭并返还焦点。</span>
            <div className={styles.row}>
              <PopoverClose asChild>
                <Button size="sm" variant="primary" onClick={() => { explicitActionRef.current = true; onAction("Popover：已确认切换至第 32 期"); }}>确认切换</Button>
              </PopoverClose>
              <PopoverClose asChild>
                <Button size="sm" variant="default" onClick={() => { explicitActionRef.current = true; onAction("Popover：已取消切换"); }}>取消</Button>
              </PopoverClose>
            </div>
          </div>
        </DemoPopoverContent>
      </Popover>

      <DropdownMenu onOpenChange={(open) => { if (open) onAction("DropdownMenu：已展开菜单"); }}>
        <DropdownMenuTrigger asChild><Button variant="default">账号操作 DropdownMenu ▾</Button></DropdownMenuTrigger>
        <DemoMenuContent>
          <DemoMenuLabel>当前账号 · ADMIN</DemoMenuLabel>
          <DemoMenuItem onSelect={() => onAction("DropdownMenu：打开个人资料与密码")}>个人资料与密码</DemoMenuItem>
          <DemoMenuItem onSelect={() => onAction("DropdownMenu：打开系统参数与日志")}>系统参数与日志</DemoMenuItem>
          <DemoMenuItem disabled>切换演示账号（已禁用）</DemoMenuItem>
          <DemoMenuSeparator />
          <DemoMenuItem tone={DANGER_TONE} onSelect={() => onAction("DropdownMenu：触发退出登录")}>退出登录</DemoMenuItem>
        </DemoMenuContent>
      </DropdownMenu>
    </>
  );
}

export function OverlayFloatingDemo({ onAction }: { onAction: (action: string) => void }) {
  const explicitActionRef = useRef(false);

  return (
    <>
      <PopoverAndMenuDemo onAction={onAction} />

      {DRAWER_SIZES.map(({ size, label }) => (
        <Drawer
          key={size}
          onOpenChange={(open) => {
            if (open) onAction(`Drawer（${size}）：已打开抽屉`);
            else if (!explicitActionRef.current) onAction(`Drawer（${size}）：已关闭抽屉（× / Esc / 遮罩）`);
            explicitActionRef.current = false;
          }}
        >
          <DrawerTrigger asChild><Button variant="default">{label}</Button></DrawerTrigger>
          <DemoDrawerContent
            size={size}
            kicker={`// DRAWER · ${size.toUpperCase()}`}
            title={size === "md" ? "新建任务" : "系统设置"}
            description="基于 Radix Dialog：点阵遮罩、masthead 粗黑刊头双线（5px+1.5px）、大号 × 关闭钮、焦点陷阱与 Esc 关闭。"
            footer={
              <>
                <DrawerClose asChild>
                  <Button variant="accent" onClick={() => { explicitActionRef.current = true; onAction(`Drawer（${size}）：已保存并关闭`); }}>保存并关闭</Button>
                </DrawerClose>
                <DrawerClose asChild>
                  <Button variant="default" onClick={() => { explicitActionRef.current = true; onAction(`Drawer（${size}）：已取消并关闭`); }}>取消</Button>
                </DrawerClose>
              </>
            }
          >
            <div className={widgetStyles.drawerBody}>
              <Field label="名称" required><Input placeholder="输入示例标题，按 Tab 测试焦点陷阱" /></Field>
              <Field label="计划开始日" required><Input type="date" defaultValue="2026-11-22" /></Field>
            </div>
          </DemoDrawerContent>
        </Drawer>
      ))}
    </>
  );
}
