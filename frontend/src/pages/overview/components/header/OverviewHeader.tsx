interface OverviewHeaderProps {
  kicker: string;
  onCreateTask: () => void;
}

export default function OverviewHeader({
  kicker,
  onCreateTask,
}: OverviewHeaderProps) {
  return (
    <div className="vh">
      <div className="vl">
        <div className="k">{kicker}</div>
        <h1 className="vt">
          项目<em>日报</em>
        </h1>
      </div>
      <div className="va">
        <button className="btn go" type="button" onClick={onCreateTask}>
          + 新建任务
        </button>
      </div>
    </div>
  );
}
