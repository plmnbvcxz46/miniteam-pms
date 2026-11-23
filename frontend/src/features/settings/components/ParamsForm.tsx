import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import { useParamsForm } from "../hooks/useParamsForm";
import { SettingsBlock } from "./SettingsBlock";
import styles from "./Settings.module.css";

interface NumberFieldProps {
  label: string;
  unit?: string;
  value: string;
  onChange: (value: string) => void;
}

function NumberField({ label, unit, value, onChange }: NumberFieldProps) {
  return (
    <Field label={label}>
      <div className={styles.inline}>
        <Input
          size="sm"
          mono
          inputMode="decimal"
          className={styles.numberInput}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {unit && <span className={styles.note}>{unit}</span>}
      </div>
    </Field>
  );
}

/** 系统参数：优先级权重、关键路径系数、今日待办条数、每周工时上限 */
export function ParamsForm() {
  const form = useParamsForm();
  const valueOf = (key: string) => form.values[key] ?? "";

  return (
    <div className={styles.panel}>
      <SettingsBlock kicker="WEIGHTS">
        {form.weightConfigs.map((config) => (
          <NumberField
            key={config.key}
            label={config.remark ?? config.name}
            value={valueOf(config.key)}
            onChange={(v) => form.set(config.key, v)}
          />
        ))}
        <Field label="合计" htmlFor="settings-weight-sum">
          <span
            id="settings-weight-sum"
            className={form.weightOk ? styles.note : styles.error}
          >
            {form.weightSum.toFixed(2)} (1)
          </span>
        </Field>
        <NumberField
          label="关键路径加权系数"
          unit="α"
          value={valueOf("priority.alpha")}
          onChange={(v) => form.set("priority.alpha", v)}
        />
      </SettingsBlock>
      <SettingsBlock kicker="DEFAULTS">
        <NumberField
          label="今日待办条数"
          unit="条"
          value={valueOf("priority.top_n")}
          onChange={(v) => form.set("priority.top_n", v)}
        />
        <NumberField
          label="每周工时上限"
          unit="小时"
          value={valueOf("member.weekly_capacity")}
          onChange={(v) => form.set("member.weekly_capacity", v)}
        />
      </SettingsBlock>
      <div className={styles.actions}>
        <Button
          variant="primary"
          loading={form.saving}
          onClick={() => void form.handleSave()}
        >
          保存
        </Button>
      </div>
      {form.error && (
        <Alert variant="inline" tone="danger">
          {form.error}
        </Alert>
      )}
    </div>
  );
}
