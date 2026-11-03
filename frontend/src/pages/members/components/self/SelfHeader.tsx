interface SelfHeaderProps {
  openCount: number;
  hours: number;
}

export default function SelfHeader({ openCount, hours }: SelfHeaderProps) {
  return (
    <div className="vh">
      <div className="vl">
        <div className="k">
          {openCount} 项未完成 · 本周 {hours} 小时
        </div>
        <h1 className="vt">
          我的<em>信息</em>
        </h1>
      </div>
    </div>
  );
}
