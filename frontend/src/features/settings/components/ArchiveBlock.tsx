import { ConfirmDialog } from "../../../components/patterns/ConfirmDialog";
import { Button } from "../../../components/ui/Button";
import { Field } from "../../../components/ui/Field";
import { SettingsBlock } from "./SettingsBlock";
import styles from "./Settings.module.css";

interface ArchiveBlockProps {
  archived: boolean;
  canEdit: boolean;
  archive: {
    archiving: boolean;
    confirmOpen: boolean;
    setConfirmOpen: (open: boolean) => void;
    confirm: () => Promise<void>;
  };
}

/** 项目状态与归档：归档前用 ConfirmDialog 二次确认 */
export function ArchiveBlock({
  archived,
  canEdit,
  archive,
}: ArchiveBlockProps) {
  return (
    <>
      <SettingsBlock kicker="ARCHIVE">
        <Field label="项目状态" htmlFor="settings-archive">
          {archived ? (
            <span className={styles.note}>已归档，项目现在是只读的</span>
          ) : !canEdit ? (
            <span className={styles.note}>进行中</span>
          ) : (
            <Button
              id="settings-archive"
              variant="danger"
              onClick={() => archive.setConfirmOpen(true)}
            >
              归档项目
            </Button>
          )}
        </Field>
      </SettingsBlock>
      <ConfirmDialog
        open={archive.confirmOpen}
        onOpenChange={archive.setConfirmOpen}
        title="归档这个项目？"
        description="归档后项目变为只读，不能再新建或修改任务、成员和文档。"
        confirmLabel="确认归档"
        loading={archive.archiving}
        onConfirm={() => void archive.confirm()}
      />
    </>
  );
}
