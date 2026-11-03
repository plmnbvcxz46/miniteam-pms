import { Outlet } from "react-router-dom";
import SettingsDrawer from "../overlays/settings/SettingDrawer";
import type { SectionId } from "../overlays/settings/sections";
import { useAuth, useMe } from "../auth/useAuth";
import { getProfile } from "../data/settings";
import type { ProfileUpdate } from "../types/settings";
import TaskDrawer from "../overlays/task/TaskDrawer";
import { useState } from "react";
import NewProjectDrawer from "../overlays/project/NewProjectDrawer";
import { notifications as initialNotifications, projects as initialProjects } from "../data/global";
import type { ProjectSave, ProjectSummary } from "../types/global";
import { useTaskStore } from "../pages/board/taskStore";
import { getColumnTasks } from "../pages/board/utils";
import ProjectSwitch from "./components/sidebar/ProjectSwitch";
import SidebarNav from "./components/sidebar/SidebarNav";
import SummaryCard from "./components/sidebar/SummaryCard";
import IssueSwitch from "./components/topbar/IssueSwitch";
import NotificationBell from "./components/topbar/NotificationBell";
import AccountMenu from "./components/topbar/AccountMenu";
import WeekLine from "./components/topbar/WeekLine";

export default function Shell() {
  const [settingsSection, setSettingsSection] = useState<SectionId | null>(null);
  const settingsOpen = settingsSection !== null;
  const me = useMe();
  const { switchAccount } = useAuth();
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
  const [projectList, setProjectList] = useState(initialProjects);
  const [currentProjectId, setCurrentProjectId] = useState(initialProjects[0].id);
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

  // POST /projects：新建后加进列表并切过去，创建人是项目经理
  const handleCreateProject = (values: ProjectSave) => {
    const project: ProjectSummary = {
      id: Math.max(0, ...projectList.map((p) => p.id)) + 1,
      name: values.name,
      status: "ACTIVE",
      startDate: values.startDate,
      planEnd: values.planEnd,
      issueNo: 1,
      headline: null,
      myProjectRole: "PM",
    };
    setProjectList((prev) => [project, ...prev]);
    setCurrentProjectId(project.id);
    setProjectFormOpen(false);
  };
  return (
    <div className={settingsOpen ? "shell dim" : "shell"} id="shell">
      {/* 左侧边栏 */}
      <aside className="index" id="index">
        <ProjectSwitch
          projects={projectList}
          currentId={currentProjectId}
          onSelect={setCurrentProjectId}
          onCreate={() => setProjectFormOpen(true)}
        />
        <SidebarNav
          riskCount={riskCount}
          onOpenSettings={() => setSettingsSection("people")}
        />
        <SummaryCard />
      </aside>

      {/* 顶部栏 */}
      <header className="masthead" id="masthead">
        <IssueSwitch />
        <div className="slot">
          <WeekLine />
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

      {/* 主视图内容区域 */}
      <main>
        <Outlet />
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
          onSubmit={handleCreateProject}
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
