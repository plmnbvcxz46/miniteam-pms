import { useState } from "react";
import { Drawer, DrawerContent } from "../../../components/ui/Drawer";
import { Tabs, TabsList, TabsTrigger } from "../../../components/ui/Tabs";
import { useAccess } from "../../../stores/access/useAccess";
import {
  getVisibleSections,
  resolveSection,
  type SectionId,
} from "../sections";
import { LogsPanel } from "./LogsPanel";
import { MePanel } from "./MePanel";
import { ParamsPanel } from "./ParamsPanel";
import { PeoplePanel } from "./PeoplePanel";
import { ProjectPanel } from "./ProjectPanel";
import styles from "./SettingsDrawer.module.css";

interface SettingsDrawerProps {
  /** 要显示哪个分区；null 表示抽屉关着 */
  section: SectionId | null;
  onClose: () => void;
}

/** 系统设置抽屉：顶部分区标签，按权限显示个人 / 项目信息 / 人员 / 日志 / 系统参数 */
export function SettingsDrawer({ section, onClose }: SettingsDrawerProps) {
  return (
    <Drawer open={section !== null} onOpenChange={(open) => !open && onClose()}>
      {section !== null && <SettingsContent initialSection={section} />}
    </Drawer>
  );
}

function SettingsContent({ initialSection }: { initialSection: SectionId }) {
  const {
    isAdmin,
    permissions,
    currentProject,
    projectDescription,
    projectRole,
    saveProject,
    archiveProject,
  } = useAccess();
  const visibleSections = getVisibleSections({
    isAdmin,
    canManageMember: permissions.canManageMember,
    hasProject: currentProject !== null,
  });
  const [active, setActive] = useState<SectionId>(initialSection);
  // 当前分区在切换账号后没有权限看了，退回第一个能看的
  const current = resolveSection(active, visibleSections);

  return (
    <DrawerContent
      size="lg"
      title={
        <>
          系统<em className={styles.accent}>设置</em>
        </>
      }
      headerExtra={
        <Tabs
          value={current}
          onValueChange={(id) => setActive(id as SectionId)}
        >
          <TabsList aria-label="设置分区">
            {visibleSections.map((s) => (
              <TabsTrigger key={s.id} value={s.id}>
                {s.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      }
      aria-describedby={undefined}
    >
      {current === "me" && <MePanel />}
      {current === "proj" && currentProject && (
        <ProjectPanel
          key={currentProject.id}
          project={currentProject}
          description={projectDescription}
          canEdit={isAdmin || projectRole === "PM"}
          onSave={saveProject}
          onArchive={archiveProject}
        />
      )}
      {current === "people" && <PeoplePanel />}
      {current === "logs" && <LogsPanel />}
      {current === "params" && <ParamsPanel />}
    </DrawerContent>
  );
}
