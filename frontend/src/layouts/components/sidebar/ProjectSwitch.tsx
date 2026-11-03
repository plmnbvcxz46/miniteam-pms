import { useCallback, useRef, useState } from "react";
import { roleLabel } from "../../../data/global";
import type { ProjectSummary } from "../../../types/global";
import { formatDayLabel } from "../../../utils/date";
import { useDismiss } from "../../useDismiss";

interface ProjectSwitchProps {
  projects: ProjectSummary[];
  currentId: number;
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
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(open, rootRef, close);
  const current = projects.find((p) => p.id === currentId) ?? projects[0];

  return (
    <div className="pop-root" ref={rootRef}>
      <button
        className="project"
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="切换项目"
        onClick={() => setOpen((v) => !v)}
      >
        <svg className="logo" viewBox="0 0 34 34" aria-hidden="true">
          <rect x="0" y="0" width="15" height="34" fill="#FAFAF7" />
          <rect x="19" y="0" width="15" height="18" fill="#FF5A1F" />
        </svg>
        <span id="proj-name">{current.name}</span>
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
      {open && (
        <div className="issues projs">
          <h4>
            PROJECTS 我参与的项目
            <em>{projects.length}</em>
          </h4>
          <div className="list scroll-y">
            {projects.map((project) => (
              <button
                key={project.id}
                type="button"
                className={project.status === "ARCHIVED" ? "arch" : undefined}
                aria-current={project.id === currentId ? "true" : undefined}
                onClick={() => {
                  onSelect(project.id);
                  close();
                }}
              >
                <span className="no">
                  {project.status === "ARCHIVED" ? "已归档" : "进行中"}
                </span>
                <span className="hd">{project.name}</span>
                <span className="dt">
                  {formatDayLabel(project.startDate)} –{" "}
                  {formatDayLabel(project.planEnd)}
                  {project.myProjectRole &&
                    ` · ${roleLabel[project.myProjectRole]}`}
                  {` · 第 ${project.issueNo} 期`}
                </span>
                {project.headline && (
                  <span className="hl">{project.headline}</span>
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="pnew"
            onClick={() => {
              close();
              onCreate();
            }}
          >
            新建项目
          </button>
        </div>
      )}
    </div>
  );
}
