import { useState } from "react";
import { logActionLabel, logs, logTargetLabel } from "../../../data/settings";
import { groupLogsByDay } from "../utils";

/** 筛选：全部或某个 targetType */
const filters = ["ALL", ...Object.keys(logTargetLabel)].filter((key) =>
  key === "ALL" || logs.some((log) => log.targetType === key),
);

export default function LogsPanel() {
  const [filter, setFilter] = useState("ALL");
  const visible = logs.filter(
    (log) => filter === "ALL" || log.targetType === filter,
  );
  const days = groupLogsByDay(visible);

  return (
    <section className="ss" id="ss-logs">
      <h2 className="ss-h">日志</h2>
      <div className="roles" role="group" aria-label="日志类型">
        {filters.map((key) => (
          <label key={key}>
            <button
              className="perm"
              type="button"
              aria-pressed={key === filter}
              aria-label={key === "ALL" ? "全部" : logTargetLabel[key]}
              onClick={() => setFilter(key)}
            />
            {key === "ALL" ? "全部" : logTargetLabel[key]}
          </label>
        ))}
      </div>
      {days.length === 0 && <p className="msg">没有日志</p>}
      {days.map((day) => (
        <div className="logday" key={day.day}>
          <h3>{day.day}</h3>
          {day.items.map((log) => {
            const failed = log.action.endsWith("_FAIL");
            return (
              <div className={failed ? "lg fail" : "lg"} key={log.id}>
                <time>{log.createdAt.slice(11, 16)}</time>
                <span>{log.user?.realName ?? "系统"}</span>
                <p>
                  {logTargetLabel[log.targetType] ?? log.targetType} ·{" "}
                  {logActionLabel[log.action] ?? log.action}
                  {log.detail && !failed && (
                    <>
                      {" "}
                      <em>{log.detail}</em>
                    </>
                  )}
                </p>
                <b>{failed ? `失败：${log.detail ?? ""}` : "成功"}</b>
              </div>
            );
          })}
        </div>
      ))}
    </section>
  );
}
