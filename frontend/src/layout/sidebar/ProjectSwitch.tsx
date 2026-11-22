import { useState } from "react";
import {
  ActionPopover,
  ActionPopoverFooterButton,
} from "../../components/patterns/ActionPopover";
import { BrandMark } from "../../components/patterns/BrandMark";
import { roleLabel } from "../../shared/constants/labels";
import type { ProjectSummary } from "../../shared/types/global";
import { formatDayLabel } from "../../shared/utils/date";
import styles from "./ProjectSwitch.module.css";

interface ProjectSwitchProps {
  projects: ProjectSummary[];
  /** 没有能进的项目时为空 */
  currentId: number | null;
  onSelect: (id: number) => void;
  onCreate: () => void;
}

export default function ProjectSwitch({
  projects,
  currentId,
  onSelect,
  onCreate,
}: ProjectSwitchProps) {
  const [open, setOpen] = useState(false);
  const current = projects.find((p) => p.id === currentId) ?? null;

  return (
    <ActionPopover
      open={open}
      onOpenChange={setOpen}
      title="PROJECTS"
      meta={projects.length}
      width="sm"
      align="start"
      trigger={
        <button
          className={styles.trigger}
          type="button"
          aria-label="切换项目"
        >
          <BrandMark size="sm" tone="inverse" />
          <span className={styles.projectName}>{current?.name ?? "没有项目"}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <path d="M2 4l4 4 4-4" />
          </svg>
        </button>
      }
      footer={
        <ActionPopoverFooterButton
          onClick={() => {
            setOpen(false);
            onCreate();
          }}
        >
          新建项目
        </ActionPopoverFooterButton>
      }
    >
      {projects.map((project) => (
        <button
          key={project.id}
          type="button"
          className={styles.item}
          data-archived={project.status === "ARCHIVED" ? "true" : undefined}
          aria-current={project.id === currentId ? "true" : undefined}
          onClick={() => {
            onSelect(project.id);
            setOpen(false);
          }}
        >
          <span className={styles.status}>
            {project.status === "ARCHIVED" ? "已归档" : "进行中"}
          </span>
          <span className={styles.name}>{project.name}</span>
          <span className={styles.meta}>
            {formatDayLabel(project.startDate)} –{" "}
            {formatDayLabel(project.planEnd)}
            {project.myProjectRole && ` · ${roleLabel[project.myProjectRole]}`}
            {` · 第 ${project.issueNo} 期`}
          </span>
        </button>
      ))}
    </ActionPopover>
  );
}
