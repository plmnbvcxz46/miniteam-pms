interface NoProjectProps {
  onCreate: () => void;
}

/** 没有能进的项目时，主区域显示这个（比如刚注册、还没被项目经理邀请的账号） */
export default function NoProject({ onCreate }: NoProjectProps) {
  return (
    <section className="view" data-view="no-project">
      <div className="vh">
        <div className="vl">
          <div className="k">[ 项目 ]</div>
          <h1 className="vt t-page-title">
            还没有<em>项目</em>
          </h1>
        </div>
        <div className="va">
          <button className="btn go" type="button" onClick={onCreate}>
            + 新建项目
          </button>
        </div>
      </div>
      <section className="pnl">
        <p>你还没有加入任何项目，可以自己新建一个，或者请项目经理邀请你。</p>
      </section>
    </section>
  );
}
