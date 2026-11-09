interface CollabHeaderProps {
  kicker: string;
  /** 为空时不显示按钮（过去的期只读） */
  onCreate?: () => void;
}

export default function CollabHeader({ kicker, onCreate }: CollabHeaderProps) {
  return (
    <div className="vh">
      <div className="vl">
        <div className="k" id="tm-kicker">
          {kicker}
        </div>
        <h1 className="vt t-page-title">
          团队<em>协作</em>
        </h1>
      </div>
      {onCreate && (
        <div className="va">
          <button className="btn go" type="button" onClick={onCreate}>
            + 发起讨论
          </button>
        </div>
      )}
    </div>
  );
}
