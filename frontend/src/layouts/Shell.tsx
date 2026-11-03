import { Outlet } from "react-router-dom";
import SettingsDrawer from "../overlays/settings/SettingDrawer";
import TaskDrawer from "../overlays/task/TaskDrawer";
import { useState } from "react";
import { useTaskStore } from "../pages/board/taskStore";
import { getColumnTasks } from "../pages/board/utils";
import ArchiveCard from "./components/sidebar/ArchiveCard";
import ProjectSwitch from "./components/sidebar/ProjectSwitch";
import SidebarNav from "./components/sidebar/SidebarNav";
import IssueSwitch from "./components/topbar/IssueSwitch";
import NotificationBell from "./components/topbar/NotificationBell";
import UserChip from "./components/topbar/UserChip";
import WeekLine from "./components/topbar/WeekLine";

export default function Shell() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { taskMap, taskForm, closeTaskForm, saveTaskForm } = useTaskStore();
  const riskCount = getColumnTasks(taskMap, "BLOCKED").length;
  const openSettings = () => setSettingsOpen(true);
  return (
    <div className={settingsOpen ? "shell dim" : "shell"} id="shell">
      {/* 左侧边栏 */}
      <aside className="index" id="index">
        <ProjectSwitch />
        <SidebarNav riskCount={riskCount} onOpenSettings={openSettings} />
        <ArchiveCard />
      </aside>

      {/* 顶部栏 */}
      <header className="masthead" id="masthead">
        <IssueSwitch />
        <div className="slot">
          <WeekLine />
        </div>
        <NotificationBell />
        <UserChip onClick={openSettings} />
      </header>

      {/* 主视图内容区域 */}
      <main>
        <Outlet />
      </main>

      {/* 设置抽屉 */}
      {settingsOpen && <SettingsDrawer onClose={() => setSettingsOpen(false)} />}

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
