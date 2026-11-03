import { currentProjectName } from "../../../data/global";

export default function ProjectSwitch() {
  return (
    <button
      className="project"
      type="button"
      aria-haspopup="true"
      aria-expanded="false"
      aria-label="切换项目"
    >
      <svg className="logo" viewBox="0 0 34 34" aria-hidden="true">
        <rect x="0" y="0" width="15" height="34" fill="#FAFAF7" />
        <rect x="19" y="0" width="15" height="18" fill="#FF5A1F" />
      </svg>
      <span id="proj-name">{currentProjectName}</span>
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
  );
}
