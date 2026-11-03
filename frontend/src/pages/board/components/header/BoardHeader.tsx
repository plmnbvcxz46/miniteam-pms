export type BoardFilter = "all" | "mine" | "crit";

const FILTERS: { key: BoardFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "mine", label: "我的" },
  { key: "crit", label: "关键路径" },
];

interface BoardHeaderProps {
  kicker: string;
  filter: BoardFilter;
  onChangeFilter: (filter: BoardFilter) => void;
  /** 没有“编辑任务”权限时不传，按钮不显示 */
  onCreateTask?: () => void;
}

export default function BoardHeader({
  kicker,
  filter,
  onChangeFilter,
  onCreateTask,
}: BoardHeaderProps) {
  return (
    <div className="vh">
      <div className="vl">
        <div className="k">{kicker}</div>
        <h1 className="vt">
          任务<em>看板</em>
        </h1>
      </div>
      <div className="va">
        <div className="seg" role="group" aria-label="筛选">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              type="button"
              aria-pressed={item.key === filter}
              onClick={() => onChangeFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
        {onCreateTask && (
          <button className="btn go" type="button" onClick={onCreateTask}>
            + 新建任务
          </button>
        )}
      </div>
    </div>
  );
}
