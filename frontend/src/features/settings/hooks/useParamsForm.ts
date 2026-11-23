import { useState } from "react";
import { useToast } from "../../../components/patterns/ToastHost";
import { useConfigs } from "../../../state/config/useConfigs";
import { isWeightSumOk, validateParams, weightSumOf } from "../validation";

/** 系统参数表单：逐项校验后保存（PUT /configs/{key}，由 ConfigProvider 提供） */
export function useParamsForm() {
  const { items, values: saved, save } = useConfigs();
  const toast = useToast();
  const [values, setValues] = useState(saved);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // 参数名称和备注取自接口
  const weightConfigs = items.filter((c) =>
    c.key.startsWith("priority.weight."),
  );
  const nameOf = (key: string) => items.find((c) => c.key === key)?.name ?? key;
  const weightSum = weightSumOf(weightConfigs, values);

  const set = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSave = async () => {
    const message = validateParams(weightConfigs, values, nameOf);
    setError(message);
    if (message) return;
    setSaving(true);
    try {
      await save(values);
      toast("参数已保存");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return {
    weightConfigs,
    values,
    weightSum,
    weightOk: isWeightSumOk(weightSum),
    error,
    saving,
    set,
    handleSave,
  };
}
