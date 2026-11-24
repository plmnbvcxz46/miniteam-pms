import { PageHeader } from "../../../components/patterns/PageHeader";

interface SelfHeaderProps {
  openCount: number;
  hours: number;
}

export default function SelfHeader({ openCount, hours }: SelfHeaderProps) {
  return (
    <PageHeader
      kicker={`未完成 ${openCount} 项 · 本周工时 ${hours}`}
      title="我的"
      accentTitle="信息"
    />
  );
}
