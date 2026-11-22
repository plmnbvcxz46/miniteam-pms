import { useState, type FormEvent } from "react";
import type { ProjectSave } from "../../../shared/types/global";
import { addDays, daysBetween, getLocalToday } from "../../../shared/utils/date";

interface UseNewProjectFormOptions {
  onSubmit: (values: ProjectSave) => Promise<void>;
}

/** 校验规则和后端一致：名称 ≤64、说明 ≤500、结束不早于开始、跨度不超过 10 年 */
function validateProjectForm(
  name: string,
  description: string,
  startDate: string,
  planEnd: string,
) {
  const trimmedName = name.trim();
  const nameError = !trimmedName
    ? "填写项目名称后才能新建"
    : trimmedName.length > 64
      ? "项目名称不能超过 64 个字"
      : "";
  const descriptionError =
    description.length > 500 ? "项目说明不能超过 500 个字" : "";
  const dateError =
    !startDate || !planEnd
      ? "开始日期和计划结束日期都要填"
      : planEnd < startDate
        ? "计划结束日期不能早于开始日期"
        : daysBetween(startDate, planEnd) > 3650
          ? "项目时间跨度不能超过 10 年"
          : "";
  return {
    trimmedName,
    nameError,
    descriptionError,
    dateError,
    valid: !nameError && !descriptionError && !dateError,
  };
}

export function useNewProjectForm({ onSubmit }: UseNewProjectFormOptions) {
  const initialToday = getLocalToday();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(initialToday);
  const [planEnd, setPlanEnd] = useState(() => addDays(initialToday, 69));
  const [nameError, setNameError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [dateError, setDateError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    const today = getLocalToday();
    setName("");
    setDescription("");
    setStartDate(today);
    setPlanEnd(addDays(today, 69));
    setNameError("");
    setDescriptionError("");
    setDateError("");
    setSubmitError("");
    setSubmitting(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const result = validateProjectForm(name, description, startDate, planEnd);
    setNameError(result.nameError);
    setDescriptionError(result.descriptionError);
    setDateError(result.dateError);
    setSubmitError("");
    if (!result.valid) return;

    setSubmitting(true);
    try {
      await onSubmit({
        name: result.trimmedName,
        description: description.trim() || undefined,
        startDate,
        planEnd,
      });
      reset();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "新建失败，请稍后再试",
      );
      setSubmitting(false);
    }
  };

  return {
    name,
    description,
    startDate,
    planEnd,
    nameError,
    descriptionError,
    dateError,
    submitError,
    submitting,
    reset,
    handleNameChange: (v: string) => {
      setName(v);
      if (nameError) setNameError("");
    },
    handleDescriptionChange: (v: string) => {
      setDescription(v);
      if (descriptionError) setDescriptionError("");
    },
    handleStartDateChange: (v: string) => {
      setStartDate(v);
      if (dateError) setDateError("");
    },
    handlePlanEndChange: (v: string) => {
      setPlanEnd(v);
      if (dateError) setDateError("");
    },
    handleSubmit,
  };
}
