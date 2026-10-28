import type { ReactNode } from "react";

type Props = {
  className: string;      // 设置用 "ov drawer"，表单用 "ov fx"
  label?: string;         // 设置用：aria-label="设置"
  labelledBy?: string;    // 表单用：aria-labelledby="fx-title"
  children: ReactNode;
};

export default function Drawer({ className, label, labelledBy, children }: Props) {
  return (
    <>
      <div className="ov-bd" />
      <div
        className={className}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        aria-labelledby={labelledBy}
      >
        {children}
      </div>
    </>
  );
}
