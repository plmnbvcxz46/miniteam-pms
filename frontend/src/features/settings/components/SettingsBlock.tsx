import { Children, Fragment, type ReactNode } from "react";
import { Separator } from "../../../components/ui/Separator";
import styles from "./SettingsBlock.module.css";

interface SettingsBlockProps {
  /** 上方 // 英文小标 */
  kicker: string;
  children: ReactNode;
}

/** 设置分区里的一块：粗线 + // 小标，下面是用虚线隔开的表单行 */
export function SettingsBlock({ kicker, children }: SettingsBlockProps) {
  const rows = Children.toArray(children);
  return (
    <section className={styles.block}>
      <h2 className={styles.kicker}>// {kicker}</h2>
      <div className={styles.rows}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <Separator variant="dashed" />}
            {row}
          </Fragment>
        ))}
      </div>
    </section>
  );
}
