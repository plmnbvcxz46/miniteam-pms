import { Outlet } from "react-router-dom";
import SettingsDrawer from "../overlays/settings/SettingDrawer";
import type { SectionId } from "../overlays/settings/sections";
import { useAccess } from "../access/useAccess";
import { useAuth, useMe } from "../auth/useAuth";
import { getProfile } from "../data/settings";
import type { ProfileUpdate } from "../types/settings";
import TaskDrawer from "../overlays/task/TaskDrawer";
import { useState } from "react";
import NewProjectDrawer from "../overlays/project/NewProjectDrawer";
import { notifications as initialNotifications } from "../data/global";
import { useTaskStore } from "../pages/board/taskStore";
import { getColumnTasks } from "../pages/board/utils";
import NoProject from "./components/NoProject";
import ProjectSwitch from "./components/sidebar/ProjectSwitch";
import SidebarNav from "./components/sidebar/SidebarNav";
import SummaryCard from "./components/sidebar/SummaryCard";
import IssueSwitch from "./components/topbar/IssueSwitch";
import NotificationBell from "./components/topbar/NotificationBell";
import AccountMenu from "./components/topbar/AccountMenu";
import WeekLine from "./components/topbar/WeekLine";
import type { ShellContext } from "./useProjectPeriod";

export default function Shell() {
  const [settingsSection, setSettingsSection] = useState<SectionId | null>(null);
  const settingsOpen = settingsSection !== null;
  const me = useMe();
  const { switchAccount } = useAuth();
  const { projects, currentProject, selectProject, canCreateProject, createProject } =
    useAccess();
  // 改过的个人资料按账号记着，切换账号后各看各的
  const [profileEdits, setProfileEdits] = useState<Record<number, ProfileUpdate>>({});
  // 新注册的账号不在人员列表里，姓名取登录身份
  const profile = profileEdits[me.user.id] ?? {
    ...getProfile(me.user.id),
    realName: me.user.realName,
  };
  const setProfile = (values: ProfileUpdate) =>
    setProfileEdits((prev) => ({ ...prev, [me.user.id]: values }));
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [notificationList, setNotificationList] = useState(initialNotifications);
  const { taskMap, taskForm, closeTaskForm, saveTaskForm } = useTaskStore();
  const riskCount = getColumnTasks(taskMap, "BLOCKED").length;

  // 切换账号：先收起上一个身份打开的抽屉，避免残留它的可编辑表单
  const handleSwitchAccount = (userId: number) => {
    setSettingsSection(null);
    setProjectFormOpen(false);
    closeTaskForm();
    switchAccount(userId);
  };

  return (
    <div className={settingsOpen ? "shell dim" : "shell"} id="shell">
      {/* 左侧边栏 */}
      <aside className="index" id="index">
        <ProjectSwitch
          projects={projects}
          currentId={currentProject?.id ?? null}
          onSelect={selectProject}
          onCreate={canCreateProject ? () => setProjectFormOpen(true) : undefined}
        />
        <SidebarNav
          riskCount={riskCount}
          onOpenSettings={() => setSettingsSection("people")}
        />
        {currentProject && <SummaryCard period={currentProject} />}
      </aside>

      {/* 顶部栏 */}
      <header className="masthead" id="masthead">
        <IssueSwitch />
        <div className="slot">
          {currentProject && <WeekLine period={currentProject} />}
        </div>
        <NotificationBell
          notifications={notificationList}
          onRead={(id) =>
            setNotificationList((prev) =>
              prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
            )
          }
          onReadAll={() =>
            setNotificationList((prev) => prev.map((n) => ({ ...n, isRead: true })))
          }
        />
        <AccountMenu
          realName={profile.realName}
          onOpenProfile={() => setSettingsSection("me")}
          onSwitch={handleSwitchAccount}
        />
      </header>

      {/* 主视图内容区域：没有能进的项目时没有页面可看 */}
      <main>
        {currentProject ? (
          <Outlet context={{ period: currentProject } satisfies ShellContext} />
        ) : (
          <NoProject canCreate={canCreateProject} onCreate={() => setProjectFormOpen(true)} />
        )}
      </main>

      {/* 设置抽屉 */}
      {settingsSection && (
        <SettingsDrawer
          initialSection={settingsSection}
          profile={profile}
          onSaveProfile={setProfile}
          onClose={() => setSettingsSection(null)}
        />
      )}

      {/* 新建项目抽屉 */}
      {projectFormOpen && (
        <NewProjectDrawer
          onClose={() => setProjectFormOpen(false)}
          onSubmit={(values) => {
            createProject(values);
            setProjectFormOpen(false);
          }}
        />
      )}

      {/* 任务表单抽屉 */}
      {taskForm && (
        <TaskDrawer
          taskId={taskForm.taskId}
          tasks={taskMap}
          onClose={closeTaskForm}
          onSubmit={saveTaskForm}
        />
      )}
    </div>
  );
}
