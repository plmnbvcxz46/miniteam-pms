import { logActionLabel, logs, logTargetLabel } from "../../../data/settings";
import { groupLogsByDay } from "../utils";

export default function LogsPanel() {
  const days = groupLogsByDay(logs);

  return (
    <section className="ss" id="ss-logs">
      {days.length === 0 && <p className="msg">没有日志</p>}
      {days.map((day) => (
        <div className="logday" key={day.day}>
          <h3>{day.day}</h3>
          {day.items.map((log) => {
            // 接口没有成败字段，约定失败的动作以 _FAIL 结尾，原因放在 detail
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
