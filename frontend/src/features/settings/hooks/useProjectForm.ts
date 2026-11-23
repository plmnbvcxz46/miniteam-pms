import { useState, type FormEvent } from "react";
import { useToast } from "../../../components/patterns/ToastHost";
import type { ProjectSave, ProjectSummary } from "../../../shared/types/global";
import { validateProject } from "../validation";

interface Options {
  project: ProjectSummary;
  /** GET /projects/{projectId} 的 description */
  description: string;
  /** PUT /projects/{projectId}，失败抛错 */
  onSave: (values: ProjectSave) => Promise<void>;
  /** POST /projects/{projectId}/archive，失败抛错 */
  onArchive: () => Promise<void>;
}

/** 归档项目：先弹确认框，确认后调接口，失败用红色 Toast 提示 */
function useArchive(onArchive: () => Promise<void>) {
  const toast = useToast();
  const [archiving, setArchiving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const confirm = async () => {
    setArchiving(true);
    try {
      await onArchive();
      toast("项目已归档");
    } catch (err) {
      toast(err instanceof Error ? err.message : "归档失败，请稍后再试", {
        tone: "danger",
      });
    } finally {
      setArchiving(false);
      setConfirmOpen(false);
    }
  };

  return { archiving, confirmOpen, setConfirmOpen, confirm };
}

/** 项目信息：名称、说明、周期的编辑保存，以及归档 */
export function useProjectForm({
  project,
  description,
  onSave,
  onArchive,
}: Options) {
  const toast = useToast();
  const [name, setName] = useState(project.name);
  const [text, setText] = useState(description);
  const [startDate, setStartDate] = useState(project.startDate);
  const [planEnd, setPlanEnd] = useState(project.planEnd);
  const [nameError, setNameError] = useState("");
  const [dateError, setDateError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const archive = useArchive(onArchive);

  const dirty =
    name !== project.name ||
    text !== description ||
    startDate !== project.startDate ||
    planEnd !== project.planEnd;

  const edit = (apply: () => void) => {
    apply();
    setNameError("");
    setDateError("");
    setError("");
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const [nameMsg, dateMsg] = validateProject({
      name,
      description: text,
      startDate,
      planEnd,
    });
    setNameError(nameMsg);
    setDateError(dateMsg);
    if (nameMsg || dateMsg) return;
    setSaving(true);
    setError("");
    try {
      await onSave({
        name: name.trim(),
        description: text.trim() || undefined,
        startDate,
        planEnd,
      });
      setName(name.trim());
      setText(text.trim());
      toast("项目信息已保存");
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请稍后再试");
    } finally {
      setSaving(false);
    }
  };

  return {
    name,
    text,
    startDate,
    planEnd,
    nameError,
    dateError,
    error,
    saving,
    dirty,
    archive,
    setName: (v: string) => edit(() => setName(v)),
    setText: (v: string) => edit(() => setText(v)),
    setStartDate: (v: string) => edit(() => setStartDate(v)),
    setPlanEnd: (v: string) => edit(() => setPlanEnd(v)),
    handleSave,
  };
}
