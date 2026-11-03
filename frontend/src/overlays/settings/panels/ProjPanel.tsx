import { useState } from "react";
import { currentProjectPeriod, projects } from "../../../data/global";
import { formatDayLabel } from "../../../utils/date";
import Switch from "../components/Switch";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

interface Holiday {
  start: string;
  end: string;
  name: string;
}

/** 节假日，接口没有这块，先放前端 */
const initialHolidays: Holiday[] = [
  { start: "2026-10-01", end: "2026-10-07", name: "国庆节" },
];

export default function ProjectRulesPanel() {
  const project = projects[0];
  const [period, setPeriod] = useState(currentProjectPeriod);
  const [workdays, setWorkdays] = useState([true, true, true, true, true, false, false]);
  const [holidays, setHolidays] = useState(initialHolidays);
  const [adding, setAdding] = useState<Holiday | null>(null);
  const [capacity, setCapacity] = useState("40");
  const [snapshotOn, setSnapshotOn] = useState(true);
  const [snapshotTime, setSnapshotTime] = useState("00:00");
  const [archiveState, setArchiveState] = useState<"idle" | "confirm" | "done">("idle");

  const saveHoliday = () => {
    if (!adding || !adding.name.trim() || !adding.start || !adding.end) return;
    if (adding.end < adding.start) return;
    setHolidays((prev) => [...prev, { ...adding, name: adding.name.trim() }]);
    setAdding(null);
  };

  return (
    <section className="ss" id="ss-proj">
      <h2 className="ss-h">刊物规则</h2>
      <div className="blk">
        <h2>日历</h2>
        <div className="rows">
          <div className="srow">
            <span className="lb">项目周期</span>
            <div className="inl">
              <input
                className="in sm"
                type="date"
                aria-label="开始日期"
                value={period.startDate}
                onChange={(e) => setPeriod({ ...period, startDate: e.target.value })}
              />
              <span>至</span>
              <input
                className="in sm"
                type="date"
                aria-label="结束日期"
                value={period.planEnd}
                onChange={(e) => setPeriod({ ...period, planEnd: e.target.value })}
              />
              {period.planEnd < period.startDate && (
                <span className="msg err">结束早于开始</span>
              )}
            </div>
          </div>
          <div className="srow">
            <span className="lb">工作日</span>
            <div className="inl days7">
              {WEEKDAYS.map((day, i) => (
                <span key={day} style={{ display: "contents" }}>
                  <button
                    className="perm"
                    type="button"
                    aria-pressed={workdays[i]}
                    aria-label={`周${day}`}
                    onClick={() =>
                      setWorkdays((prev) => prev.map((v, k) => (k === i ? !v : v)))
                    }
                  />
                  <span>{day}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="srow top">
            <span className="lb">节假日</span>
            <div>
              {holidays.map((h, i) => (
                <div className="inl" key={`${h.start}-${h.name}`} style={{ marginBottom: 6 }}>
                  <span className="v">
                    {formatDayLabel(h.start)} – {formatDayLabel(h.end)} {h.name}
                  </span>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => setHolidays((prev) => prev.filter((_, k) => k !== i))}
                  >
                    删除
                  </button>
                </div>
              ))}
              {adding ? (
                <div className="inl">
                  <input
                    className="in sm"
                    type="date"
                    aria-label="节假日开始"
                    value={adding.start}
                    onChange={(e) => setAdding({ ...adding, start: e.target.value })}
                  />
                  <span>至</span>
                  <input
                    className="in sm"
                    type="date"
                    aria-label="节假日结束"
                    value={adding.end}
                    onChange={(e) => setAdding({ ...adding, end: e.target.value })}
                  />
                  <input
                    className="in sm"
                    placeholder="名称"
                    aria-label="节假日名称"
                    value={adding.name}
                    onChange={(e) => setAdding({ ...adding, name: e.target.value })}
                  />
                  <button className="btn primary" type="button" onClick={saveHoliday}>
                    确定
                  </button>
                  <button className="btn" type="button" onClick={() => setAdding(null)}>
                    取消
                  </button>
                </div>
              ) : (
                <button
                  className="btn"
                  type="button"
                  onClick={() => setAdding({ start: "", end: "", name: "" })}
                >
                  添加
                </button>
              )}
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
              <input
                className="in xs"
                id="s-cap"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
              <span>小时</span>
            </div>
          </div>
          <div className="srow">
            <span className="lb">每日快照</span>
            <div className="inl">
              <Switch label="每日快照" value={snapshotOn} onChange={setSnapshotOn} />
              <span>生成时间</span>
              <input
                className="in xs"
                type="time"
                aria-label="生成时间"
                disabled={!snapshotOn}
                value={snapshotTime}
                onChange={(e) => setSnapshotTime(e.target.value)}
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
            <div className="inl">
              {archiveState === "done" ? (
                <>
                  <span className="v">{project.name} 已归档</span>
                  <button className="btn" type="button" onClick={() => setArchiveState("idle")}>
                    恢复项目
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn risk"
                    type="button"
                    onClick={() =>
                      setArchiveState(archiveState === "idle" ? "confirm" : "done")
                    }
                  >
                    {archiveState === "idle"
                      ? `归档${project.name}`
                      : "再点一次确认归档"}
                  </button>
                  {archiveState === "confirm" && (
                    <button className="btn" type="button" onClick={() => setArchiveState("idle")}>
                      取消
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
