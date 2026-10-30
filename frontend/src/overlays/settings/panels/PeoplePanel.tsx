export default function PeoplePanel() {
  return (
    <section
      className="ss"
      id="ss-people"
      data-sub="people"
      data-g="系统"
      data-name="人员"
    >
      <h2 className="ss-h">人员</h2>
      <div className="g4">
        <div className="block span2">
          <div className="toolbar">
            <label className="field" htmlFor="pq">
              搜索
              <input
                id="pq"
                type="search"
                placeholder="姓名或账号"
              />
            </label>
            <button className="btn primary" type="button">
              新增人员
            </button>
          </div>
          <div className="roster" id="roster" />
        </div>
        <div className="block span2 cl" id="person" />
      </div>
    </section>
  );
}

