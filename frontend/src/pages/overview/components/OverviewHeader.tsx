interface OverviewHeaderProps {
  kicker: string;
  /** 没有“编辑任务”权限时不传，按钮不显示 */
  onCreateTask?: () => void;
}

export default function OverviewHeader({
  kicker,
  onCreateTask,
}: OverviewHeaderProps) {
  return (
    <div className="vh">
      <div className="vl">
        <div className="k">{kicker}</div>
        <h1 className="vt t-page-title">
          项目<em>日报</em>
        </h1>
      </div>
      {onCreateTask && (
        <div className="va">
          <button className="btn go" type="button" onClick={onCreateTask}>
            + 新建任务
          </button>
        </div>
      )}
    </div>
  );
}
