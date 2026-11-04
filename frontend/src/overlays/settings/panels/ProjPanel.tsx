import { useState, type FormEvent } from "react";
import type { ProjectSave, ProjectSummary } from "../../../types/global";
import { daysBetween } from "../../../utils/date";

interface ProjectInfoPanelProps {
  project: ProjectSummary;
  /** GET /projects/{projectId} 的 description */
  description: string;
  /** 只有项目经理和系统管理员能改、能归档，后端也会校验 */
  canEdit: boolean;
  /** PUT /projects/{projectId}，失败抛错，message 显示在表单里 */
  onSave: (values: ProjectSave) => Promise<void>;
  /** POST /projects/{projectId}/archive，失败抛错 */
  onArchive: () => Promise<void>;
}

export default function ProjectInfoPanel({
  project,
  description,
  canEdit,
  onSave,
  onArchive,
}: ProjectInfoPanelProps) {
  const archived = project.status === "ARCHIVED";
  const readOnly = archived || !canEdit;
  const [name, setName] = useState(project.name);
  const [text, setText] = useState(description);
  const [startDate, setStartDate] = useState(project.startDate);
  const [planEnd, setPlanEnd] = useState(project.planEnd);
  const [nameError, setNameError] = useState("");
  const [dateError, setDateError] = useState("");
  const [saved, setSaved] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    setError("");
  };

  // 校验规则和后端一致：名称 ≤64、说明 ≤500、结束不早于开始、跨度不超过 10 年
  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const nameMsg = !trimmedName
      ? "项目名称不能为空"
      : trimmedName.length > 64
        ? "项目名称不能超过 64 个字"
        : text.trim().length > 500
          ? "项目说明不能超过 500 个字"
          : "";
    const dateMsg =
      !startDate || !planEnd
        ? "开始日期和计划结束日期都要填"
        : planEnd < startDate
          ? "计划结束日期不能早于开始日期"
          : daysBetween(startDate, planEnd) > 3650
            ? "项目时间跨度不能超过 10 年"
            : "";
    setNameError(nameMsg);
    setDateError(dateMsg);
    if (nameMsg || dateMsg) return;
    setSaving(true);
    setError("");
    try {
      await onSave({
        name: trimmedName,
        description: text.trim() || undefined,
        startDate,
        planEnd,
      });
      setName(trimmedName);
      setText(text.trim());
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请稍后再试");
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (!confirmArchive) {
      setConfirmArchive(true);
      return;
    }
    setConfirmArchive(false);
    setError("");
    try {
      await onArchive();
    } catch (err) {
      setError(err instanceof Error ? err.message : "归档失败，请稍后再试");
    }
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
                readOnly={readOnly}
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
                readOnly={readOnly}
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
                readOnly={readOnly}
                value={startDate}
                onChange={(e) => edit(() => setStartDate(e.target.value))}
              />
              <span>至</span>
              <input
                className="in sm"
                type="date"
                aria-label="计划结束日期"
                readOnly={readOnly}
                value={planEnd}
                onChange={(e) => edit(() => setPlanEnd(e.target.value))}
              />
              {dateError && <span className="msg err">{dateError}</span>}
            </div>
          </div>
        </div>
        {!readOnly && (
          <div className="acts" style={{ marginTop: 10 }}>
            <button className="btn primary" type="submit" disabled={!dirty || saving}>
              {saving ? "保存中…" : "保存"}
            </button>
            {saved && <span className="msg">已保存</span>}
            {error && <span className="msg err">{error}</span>}
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
                <span className="v">已归档，项目现在是只读的</span>
              ) : !canEdit ? (
                <span className="v">进行中</span>
              ) : (
                <>
                  <button className="btn risk" type="button" onClick={() => void handleArchive()}>
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
