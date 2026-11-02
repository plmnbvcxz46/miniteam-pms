interface CollabHeaderProps {
  kicker: string;
  onCreate: () => void;
}

export default function CollabHeader({ kicker, onCreate }: CollabHeaderProps) {
  return (
    <div className="vh">
      <div className="vl">
        <div className="k" id="tm-kicker">
          {kicker}
        </div>
        <h1 className="vt">
          团队<em>协作</em>
        </h1>
      </div>
      <div className="va">
        <button className="btn go" type="button" onClick={onCreate}>
          + 发起讨论
        </button>
      </div>
    </div>
  );
}
