import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { Input } from "../../../components/ui/Input";
import type { ProjectSave, ProjectSummary } from "../../../shared/types/global";
import { useProjectForm } from "../hooks/useProjectForm";
import { ArchiveBlock } from "./ArchiveBlock";
import { SettingsBlock } from "./SettingsBlock";
import styles from "./Settings.module.css";

interface ProjectPanelProps {
  project: ProjectSummary;
  description: string;
  /** 只有项目经理和系统管理员能改、能归档，后端也会校验 */
  canEdit: boolean;
  onSave: (values: ProjectSave) => Promise<void>;
  onArchive: () => Promise<void>;
}

/** 项目信息：当前项目的名称、说明、周期，以及归档 */
export function ProjectPanel({ canEdit, ...options }: ProjectPanelProps) {
  const archived = options.project.status === "ARCHIVED";
  const readOnly = archived || !canEdit;
  const form = useProjectForm(options);

  return (
    <div className={styles.panel}>
      <form noValidate onSubmit={form.handleSave}>
        <SettingsBlock kicker="PROJECT">
          <Field label="项目名称" error={form.nameError || undefined}>
            <Input
              readOnly={readOnly}
              value={form.name}
              onChange={(e) => form.setName(e.target.value)}
            />
          </Field>
          <Field label="项目说明">
            <Input
              readOnly={readOnly}
              placeholder="可不填"
              value={form.text}
              onChange={(e) => form.setText(e.target.value)}
            />
          </Field>
          <Field
            label="项目周期"
            htmlFor="settings-start"
            error={form.dateError || undefined}
          >
            <div className={styles.inline}>
              <Input
                id="settings-start"
                size="sm"
                type="date"
                aria-label="开始日期"
                className={styles.narrowInput}
                readOnly={readOnly}
                value={form.startDate}
                onChange={(e) => form.setStartDate(e.target.value)}
              />
              <span className={styles.note}>至</span>
              <Input
                size="sm"
                type="date"
                aria-label="计划结束日期"
                className={styles.narrowInput}
                readOnly={readOnly}
                value={form.planEnd}
                onChange={(e) => form.setPlanEnd(e.target.value)}
              />
            </div>
          </Field>
        </SettingsBlock>
        {!readOnly && (
          <div className={styles.actions}>
            <Button
              type="submit"
              variant="primary"
              disabled={!form.dirty}
              loading={form.saving}
            >
              保存
            </Button>
          </div>
        )}
        {form.error && (
          <Alert variant="inline" tone="danger">
            {form.error}
          </Alert>
        )}
      </form>
      <ArchiveBlock
        archived={archived}
        canEdit={canEdit}
        archive={form.archive}
      />
    </div>
  );
}
