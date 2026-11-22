import { useState } from "react";
import { Outlet } from "react-router-dom";
import { NotificationBell, useNotifications } from "../features/notifications";
import { NewProjectDrawer } from "../features/projects";
import SettingsDrawer from "../overlays/settings/SettingDrawer";
import type { SectionId } from "../overlays/settings/sections";
import TaskDrawer from "../overlays/task/TaskDrawer";
import type { ProjectSave } from "../shared/types/global";
import type { ProfileUpdate } from "../shared/types/settings";
import { useAccess } from "../state/access/useAccess";
import { useAuth, useMe } from "../state/auth/useAuth";
import { useTaskStore } from "../state/task/taskStore";
import { getColumnTasks } from "../state/task/utils";
import NoProject from "./NoProject";
import styles from "./Shell.module.css";
import ProjectSwitch from "./sidebar/ProjectSwitch";
import SidebarNav from "./sidebar/SidebarNav";
import SummaryCard from "./sidebar/SummaryCard";
import AccountMenu from "./topbar/AccountMenu";
import IssueSwitch from "./topbar/IssueSwitch";
import WeekLine from "./topbar/WeekLine";
import type { ShellContext } from "./useProjectPeriod";

function ShellDrawers(props: {
  settingsSection: SectionId | null;
  onCloseSettings: () => void;
  profile: ProfileUpdate;
  onSaveProfile: (values: ProfileUpdate) => Promise<void>;
  projectFormOpen: boolean;
  onProjectFormOpenChange: (open: boolean) => void;
  onCreateProject: (values: ProjectSave) => Promise<unknown>;
}) {
  const { taskMap, taskForm, closeTaskForm, saveTaskForm } = useTaskStore();
  return (
    <>
      {props.settingsSection && (
        <SettingsDrawer
          initialSection={props.settingsSection}
          profile={props.profile}
          onSaveProfile={props.onSaveProfile}
          onClose={props.onCloseSettings}
        />
      )}
      <NewProjectDrawer
        open={props.projectFormOpen}
        onOpenChange={props.onProjectFormOpenChange}
        onSubmit={async (values) => {
          await props.onCreateProject(values);
          props.onProjectFormOpenChange(false);
        }}
      />
      {taskForm && (
        <TaskDrawer
          taskId={taskForm.taskId}
          tasks={taskMap}
          onClose={closeTaskForm}
          onSubmit={saveTaskForm}
        />
      )}
    </>
  );
}

export default function Shell() {
  const [settingsSection, setSettingsSection] = useState<SectionId | null>(null);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const me = useMe();
  const { updateProfile } = useAuth();
  const { projects, currentProject, selectProject, createProject } = useAccess();
  const notifications = useNotifications();
  const { taskMap } = useTaskStore();

  const profile: ProfileUpdate = {
    realName: me.user.realName,
    email: me.email ?? "",
    skillTags: me.skillTags,
  };
  const riskCount = getColumnTasks(taskMap, "BLOCKED").length;
  const shellClass = settingsSection !== null ? `${styles.shell} dim` : styles.shell;

  return (
    <div className={shellClass} id="shell">
      <aside className={styles.sidebar} id="index">
        <ProjectSwitch
          projects={projects}
          currentId={currentProject?.id ?? null}
          onSelect={selectProject}
          onCreate={() => setProjectFormOpen(true)}
        />
        <SidebarNav
          riskCount={riskCount}
          onOpenSettings={() => setSettingsSection("people")}
        />
        {currentProject && <SummaryCard period={currentProject} />}
      </aside>

      <header className={styles.masthead} id="masthead">
        <IssueSwitch />
        <div className={styles.slot}>
          {currentProject && <WeekLine period={currentProject} />}
        </div>
        <NotificationBell
          notifications={notifications.list}
          unreadCount={notifications.unreadCount}
          currentProjectId={currentProject?.id ?? null}
          onOpenBell={() => void notifications.refresh().catch(() => undefined)}
          onRead={notifications.markRead}
          onReadAll={notifications.markAllRead}
          onSwitchProject={selectProject}
        />
        <AccountMenu
          realName={profile.realName}
          onOpenProfile={() => setSettingsSection("me")}
        />
      </header>

      <main className={styles.main}>
        {currentProject ? (
          <Outlet context={{ period: currentProject } satisfies ShellContext} />
        ) : (
          <NoProject onCreate={() => setProjectFormOpen(true)} />
        )}
      </main>

      <ShellDrawers
        settingsSection={settingsSection}
        onCloseSettings={() => setSettingsSection(null)}
        profile={profile}
        onSaveProfile={updateProfile}
        projectFormOpen={projectFormOpen}
        onProjectFormOpenChange={setProjectFormOpen}
        onCreateProject={createProject}
      />
    </div>
  );
}
