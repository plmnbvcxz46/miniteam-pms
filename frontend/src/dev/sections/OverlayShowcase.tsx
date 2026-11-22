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
import styles from "../UiShowcasePage.module.css";

function DemoPopoverTrigger(props: PopoverTriggerProps) {
  return <PopoverTrigger {...props} />;
}

function DemoPopoverContent(props: PopoverContentProps) {
  return <PopoverContent {...props} />;
}

export function OverlayShowcase() {
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
      </div>
    </section>
  );
}
