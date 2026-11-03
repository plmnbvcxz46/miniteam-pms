interface SelfHeaderProps {
  openCount: number;
  hours: number;
}

export default function SelfHeader({ openCount, hours }: SelfHeaderProps) {
  return (
    <div className="vh">
      <div className="vl">
        <div className="k">
          未完成 {openCount} 项 · 本周工时 {hours}
        </div>
        <h1 className="vt">
          我的<em>信息</em>
        </h1>
      </div>
    </div>
  );
}
