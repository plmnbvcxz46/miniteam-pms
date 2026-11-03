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
          {day.items.map((log) => (
            <div className="lg" key={log.id}>
              <time>{log.createdAt.slice(11, 16)}</time>
              <span>{log.user?.realName ?? "系统"}</span>
              <p>
                {logTargetLabel[log.targetType] ?? log.targetType} ·{" "}
                {logActionLabel[log.action] ?? log.action}
                {log.detail && (
                  <>
                    {" "}
                    <em>{log.detail}</em>
                  </>
                )}
              </p>
              <b>{log.ip}</b>
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
