import { useState, type FormEvent } from "react";
import type {
  ProjectSave,
  ProjectStatus,
  ProjectSummary,
} from "../../../types/global";

interface ProjectInfoPanelProps {
  project: ProjectSummary;
  /** GET /projects/{projectId} 的 description */
  description: string;
  /** PUT /projects/{projectId} */
  onSave: (values: ProjectSave) => void;
  /** POST /projects/{projectId}/archive 和 /restore */
  onSetStatus: (status: ProjectStatus) => void;
}

export default function ProjectInfoPanel({
  project,
  description,
  onSave,
  onSetStatus,
}: ProjectInfoPanelProps) {
  const archived = project.status === "ARCHIVED";
  const [name, setName] = useState(project.name);
  const [text, setText] = useState(description);
  const [startDate, setStartDate] = useState(project.startDate);
  const [planEnd, setPlanEnd] = useState(project.planEnd);
  const [nameError, setNameError] = useState("");
  const [dateError, setDateError] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);

  const dirty =
    name !== project.name ||
    text !== description ||
    startDate !== project.startDate ||
    planEnd !== project.planEnd;

  const edit = (apply: () => void) => {
    apply();
    setSaved(false);
    setNameError("");
    setDateError("");
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const nameMsg = trimmedName ? "" : "项目名称不能为空";
    const dateMsg =
      !startDate || !planEnd
        ? "开始日期和计划结束日期都要填"
        : planEnd < startDate
          ? "计划结束日期不能早于开始日期"
          : "";
    setNameError(nameMsg);
    setDateError(dateMsg);
    if (nameMsg || dateMsg) return;
    onSave({
      name: trimmedName,
      description: text.trim() || undefined,
      startDate,
      planEnd,
    });
    setName(trimmedName);
    setText(text.trim());
    setSaved(true);
  };

  return (
    <section className="ss" id="ss-proj">
      <form className="blk" noValidate onSubmit={handleSave}>
        <h2>基本信息</h2>
        <div className="rows">
          <div className="srow">
            <label htmlFor="s-pname">项目名称</label>
            <div className="inl">
              <input
                className="in"
                id="s-pname"
                readOnly={archived}
                value={name}
                onChange={(e) => edit(() => setName(e.target.value))}
              />
              {nameError && <span className="msg err">{nameError}</span>}
            </div>
          </div>
          <div className="srow">
            <label htmlFor="s-pdesc">项目说明</label>
            <div>
              <input
                className="in"
                id="s-pdesc"
                readOnly={archived}
                placeholder="可不填"
                value={text}
                onChange={(e) => edit(() => setText(e.target.value))}
              />
            </div>
          </div>
          <div className="srow">
            <span className="lb">项目周期</span>
            <div className="inl">
              <input
                className="in sm"
                type="date"
                aria-label="开始日期"
                readOnly={archived}
                value={startDate}
                onChange={(e) => edit(() => setStartDate(e.target.value))}
              />
              <span>至</span>
              <input
                className="in sm"
                type="date"
                aria-label="计划结束日期"
                readOnly={archived}
                value={planEnd}
                onChange={(e) => edit(() => setPlanEnd(e.target.value))}
              />
              {dateError && <span className="msg err">{dateError}</span>}
            </div>
          </div>
        </div>
        {!archived && (
          <div className="acts" style={{ marginTop: 10 }}>
            <button className="btn primary" type="submit" disabled={!dirty}>
              保存
            </button>
            {saved && <span className="msg">已保存</span>}
          </div>
        )}
      </form>
      <div className="blk">
        <h2>存档</h2>
        <div className="rows">
          <div className="srow">
            <span className="lb">项目状态</span>
            <div className="inl">
              {archived ? (
                <>
                  <span className="v">已归档</span>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => onSetStatus("ACTIVE")}
                  >
                    取消归档
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn risk"
                    type="button"
                    onClick={() => {
                      if (!confirmArchive) {
                        setConfirmArchive(true);
                        return;
                      }
                      setConfirmArchive(false);
                      onSetStatus("ARCHIVED");
                    }}
                  >
                    {confirmArchive ? "再点一次确认归档" : "归档项目"}
                  </button>
                  {confirmArchive && (
                    <button
                      className="btn"
                      type="button"
                      onClick={() => setConfirmArchive(false)}
                    >
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
