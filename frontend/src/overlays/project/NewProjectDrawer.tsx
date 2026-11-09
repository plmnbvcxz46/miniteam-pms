import { useState, type FormEvent } from "react";
import Drawer from "../../components/Drawer";
import type { ProjectSave } from "../../types/global";
import { addDays, daysBetween, getLocalToday } from "../../utils/date";

interface NewProjectDrawerProps {
  onClose: () => void;
  /** POST /projects，成功后由调用方关掉抽屉；失败抛错，message 显示在表单里 */
  onSubmit: (values: ProjectSave) => Promise<void>;
}

export default function NewProjectDrawer({
  onClose,
  onSubmit,
}: NewProjectDrawerProps) {
  const today = getLocalToday();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [planEnd, setPlanEnd] = useState(addDays(today, 69));
  const [nameError, setNameError] = useState("");
  const [dateError, setDateError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 校验规则和后端一致：名称 ≤64、说明 ≤500、结束不早于开始、跨度不超过 10 年
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const nameMsg = !trimmedName
      ? "填写项目名称后才能新建"
      : trimmedName.length > 64
        ? "项目名称不能超过 64 个字"
        : "";
    const dateMsg =
      !startDate || !planEnd
        ? "开始日期和计划结束日期都要填"
        : planEnd < startDate
          ? "计划结束日期不能早于开始日期"
          : daysBetween(startDate, planEnd) > 3650
            ? "项目时间跨度不能超过 10 年"
            : "";
    setNameError(nameMsg || (description.length > 500 ? "项目说明不能超过 500 个字" : ""));
    setDateError(dateMsg);
    setSubmitError("");
    if (nameMsg || dateMsg || description.length > 500) return;
    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        description: description.trim() || undefined,
        startDate,
        planEnd,
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "新建失败，请稍后再试");
      setSubmitting(false);
    }
  };

  return (
    <Drawer className="ov fx" labelledBy="fx-title" onClose={onClose}>
      <div className="fx-head">
        <h2 className="fx-title t-overlay-title" id="fx-title">
          新建项目
        </h2>
        <button className="ov-close" type="button" onClick={onClose}>
          关闭<span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="double">
        <i />
        <i />
      </div>
      <form className="fx-body" noValidate onSubmit={handleSubmit}>
        <div className="fr">
          <span className="lb t-label">
            项目名称<b>*</b>
          </span>
          <div>
            <input
              className="u"
              autoFocus
              value={name}
              placeholder="例如 课程设计网站"
              onChange={(e) => {
                setName(e.target.value);
                setNameError("");
              }}
            />
          </div>
          {nameError && <div className="err t-error">{nameError}</div>}
        </div>

        <div className="fr top">
          <span className="lb t-label">项目说明</span>
          <div>
            <textarea
              className="u"
              rows={3}
              value={description}
              placeholder="一句话说明做什么，可不填"
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="fr">
          <span className="lb t-label">
            起止日期<b>*</b>
          </span>
          <div>
            <div className="inl">
              从
              <input
                className="u n"
                type="date"
                style={{ width: "150px" }}
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDateError("");
                }}
              />
              到
              <input
                className="u n"
                type="date"
                style={{ width: "150px" }}
                value={planEnd}
                onChange={(e) => {
                  setPlanEnd(e.target.value);
                  setDateError("");
                }}
              />
            </div>
          </div>
          {dateError && <div className="err t-error">{dateError}</div>}
        </div>

        {submitError && <div className="err t-error">{submitError}</div>}
        <div className="fx-acts">
          <button className="btn primary" type="submit" disabled={submitting}>
            {submitting ? "新建中…" : "新建项目"}
          </button>
          <button className="btn" type="button" onClick={onClose}>
            取消
          </button>
        </div>
      </form>
    </Drawer>
  );
}
