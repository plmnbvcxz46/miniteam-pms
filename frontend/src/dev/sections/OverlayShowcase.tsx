import { useState } from "react";
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

const DANGER_TONE: DropdownMenuItemTone = "danger";

export function OverlayShowcase() {
  const [menuAction, setMenuAction] = useState("尚未触发");
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
      </div>

      <p className={styles.panelNote}>最近菜单动作：{menuAction}</p>
    </section>
  );
}
