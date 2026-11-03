import { useState } from "react";
import Drawer from "../../components/Drawer";
import { useMe } from "../../auth/useAuth";
import { getVisibleSections, resolveSection, type SectionId } from "./sections";
import type { ProfileUpdate } from "../../types/settings";
import MePanel from "./panels/MePanel";
import ProjectRulesPanel from "./panels/ProjPanel";
import PeoplePanel from "./panels/PeoplePanel";
import RolesPanel from "./panels/RolesPanel";
import LogsPanel from "./panels/LogsPanel";
import ParamsPanel from "./panels/ParamsPanel";
import type { JSX } from "react/jsx-runtime";

const panels: Record<Exclude<SectionId, "me">, JSX.Element> = {
  proj: <ProjectRulesPanel />,
  people: <PeoplePanel />,
  roles: <RolesPanel />,
  logs: <LogsPanel />,
  params: <ParamsPanel />,
};

interface SettingsDrawerProps {
  /** 打开时先显示哪个分区 */
  initialSection?: SectionId;
  profile: ProfileUpdate;
  onSaveProfile: (values: ProfileUpdate) => void;
  onClose: () => void;
}

export default function SettingsDrawer({
  initialSection = "people",
  profile,
  onSaveProfile,
  onClose,
}: SettingsDrawerProps) {
  const me = useMe();
  const visibleSections = getVisibleSections(me);
  const [active, setActive] = useState<SectionId>(() =>
    resolveSection(initialSection, visibleSections),
  );
  // 当前分区在切换账号后没有权限看了，退回第一个能看的
  const current = resolveSection(active, visibleSections);
  // 标签和左侧索引共用：点击或回车切换分区
  const link = (id: SectionId) => ({
    role: "button" as const,
    tabIndex: 0,
    "aria-current": id === current ? ("page" as const) : undefined,
    onClick: () => setActive(id),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setActive(id);
      }
    },
  });

  return (
    <Drawer className="ov drawer" label="设置" onClose={onClose}>
      <header className="ov-head">
        <svg className="logo" viewBox="0 0 34 34" aria-hidden="true">
          <rect x="0" y="0" width="15" height="34" fill="currentColor" />
          <rect x="19" y="0" width="15" height="18" fill="#FF5A1F" />
        </svg>
        <h1 className="ov-title">系统<em>设置</em></h1>

        {/* 顶部标签：分组变化处插一条分隔线 */}
        <nav className="ov-tabs" aria-label="设置分区">
          {visibleSections.map((s, k) => (
            <span key={s.id} style={{ display: "contents" }}>
              {k > 0 && s.group !== visibleSections[k - 1].group && (
                <i className="tsep" aria-hidden="true" />
              )}
              <a {...link(s.id)}>{s.name}</a>
            </span>
          ))}
        </nav>

        <button className="ov-close" type="button" onClick={onClose}>
          关闭<span aria-hidden="true">×</span>
        </button>
      </header>

      <div className="double ov-rule"><i /><i /></div>

      <div className="ov-main">
        <div className="ov-body">{current === "me" ? (
            <MePanel profile={profile} onSave={onSaveProfile} />
          ) : (
            panels[current as Exclude<SectionId, "me">]
          )}</div>
      </div>
    </Drawer>
  );
}
