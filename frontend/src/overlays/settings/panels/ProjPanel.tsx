export default function ProjPanel() {
  return (
    <section
      className="ss"
      id="ss-proj"
      data-sub="proj"
      data-g="本项目"
      data-name="刊物规则"
    >
      <h2 className="ss-h">刊物规则</h2>
      <div className="blk">
        <h2>日历</h2>
        <div className="rows">
          <div className="srow">
            <span className="lb">项目周期</span>
            <div className="inl">
              <input
                className="in sm"
                defaultValue="2026-09-21"
                aria-label="开始日期"
              />
              <span>至</span>
              <input
                className="in sm"
                defaultValue="2026-11-29"
                aria-label="结束日期"
              />
            </div>
          </div>
          <div className="srow">
            <span className="lb">工作日</span>
            <div className="inl days7">
              <button
                className="perm"
                type="button"
                aria-pressed="true"
                aria-label="周一"
                data-d="一"
              />
              <span>一</span>
              <button
                className="perm"
                type="button"
                aria-pressed="true"
                aria-label="周二"
                data-d="二"
              />
              <span>二</span>
              <button
                className="perm"
                type="button"
                aria-pressed="true"
                aria-label="周三"
                data-d="三"
              />
              <span>三</span>
              <button
                className="perm"
                type="button"
                aria-pressed="true"
                aria-label="周四"
                data-d="四"
              />
              <span>四</span>
              <button
                className="perm"
                type="button"
                aria-pressed="true"
                aria-label="周五"
                data-d="五"
              />
              <span>五</span>
              <button
                className="perm"
                type="button"
                aria-pressed="false"
                aria-label="周六"
                data-d="六"
              />
              <span>六</span>
              <button
                className="perm"
                type="button"
                aria-pressed="false"
                aria-label="周日"
                data-d="日"
              />
              <span>日</span>
            </div>
          </div>
          <div className="srow">
            <span className="lb">节假日</span>
            <div className="inl">
              <span className="v">10.01 – 10.07 国庆节</span>
              <button className="btn" type="button">
                添加
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="blk">
        <h2>出版</h2>
        <div className="rows">
          <div className="srow">
            <label htmlFor="s-cap">每周工时上限</label>
            <div className="inl">
              <input className="in xs" id="s-cap" defaultValue="40" />
              <span>小时</span>
            </div>
          </div>
          <div className="srow">
            <span className="lb">每日快照</span>
            <div className="inl">
              <span className="sw2" role="group" aria-label="每日快照">
                <button type="button" aria-pressed="true">
                  开
                </button>
                <button type="button" aria-pressed="false">
                  关
                </button>
              </span>
              <span>生成时间</span>
              <input
                className="in xs"
                defaultValue="00:00"
                aria-label="生成时间"
              />
            </div>
          </div>
          <div className="srow top">
            <span className="lb">头条规则</span>
            <div>
              <ol className="rank">
                <li>有逾期时报逾期</li>
                <li>有阻塞时报阻塞</li>
                <li>都没有时报按计划推进</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
      <div className="blk">
        <h2>存档</h2>
        <div className="rows">
          <div className="srow">
            <span className="lb">归档项目</span>
            <div>
              <button className="btn risk" type="button">
                归档测试项目 App
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

