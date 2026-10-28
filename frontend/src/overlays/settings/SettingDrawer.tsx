import Drawer from "../../components/Drawer";
import { sections, groups, type SectionId } from "./sections";
import MePanel from "./panels/MePanel";
import ProjectRulesPanel from "./panels/ProjPanel";
import PeoplePanel from "./panels/PeoplePanel";
import RolesPanel from "./panels/RolesPanel";
import DictPanel from "./panels/DictPanel";
import LogsPanel from "./panels/LogsPanel";
import ParamsPanel from "./panels/ParamsPanel";
import type { JSX } from "react/jsx-runtime";

const panels: Record<SectionId, JSX.Element> = {
  me: <MePanel />,
  proj: <ProjectRulesPanel />,
  people: <PeoplePanel />,
  roles: <RolesPanel />,
  dict: <DictPanel />,
  logs: <LogsPanel />,
  params: <ParamsPanel />,
};

export default function SettingsDrawer() {
  const active: SectionId = "people"; // 静态阶段写死

  return (
    <Drawer className="ov drawer" label="设置">
      <header className="ov-head">
        <svg className="logo" viewBox="0 0 34 34" aria-hidden="true">
          <rect x="0" y="0" width="15" height="34" fill="currentColor" />
          <rect x="19" y="0" width="15" height="18" fill="#FF5A1F" />
        </svg>
        <h1 className="ov-title">系统<em>设置</em></h1>

        {/* 顶部标签：分组变化处插一条分隔线 */}
        <nav className="ov-tabs" aria-label="设置分区">
          {sections.map((s, k) => (
            <span key={s.id} style={{ display: "contents" }}>
              {k > 0 && s.group !== sections[k - 1].group && (
                <i className="tsep" aria-hidden="true" />
              )}
              <a tabIndex={0} aria-current={s.id === active ? "page" : undefined}>
                {s.name}
              </a>
            </span>
          ))}
        </nav>

        <button className="ov-close" type="button">
          关闭<span aria-hidden="true">×</span>
        </button>
      </header>

      <div className="double ov-rule"><i /><i /></div>

      <div className="ov-main">
        {/* 左侧索引：按分组，每组一个 nav，最后一组加 admin */}
        <aside className="ov-index">
          {groups.map((g, k) => (
            <nav
              key={g}
              className={"grp" + (k === groups.length - 1 ? " admin" : "")}
              aria-label={g}
            >
              {sections
                .filter((s) => s.group === g)
                .map((s) => (
                  <a key={s.id} tabIndex={0}
                    aria-current={s.id === active ? "page" : undefined}>
                    {s.name}
                  </a>
                ))}
            </nav>
          ))}
        </aside>

        <div className="ov-body">{panels[active]}</div>
      </div>
    </Drawer>
  );
}
