import { useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useAccess } from "../../../access/useAccess";
import { useIssue } from "../../../issue/useIssue";
import type { TaskStatus } from "../../../types/global";
import { useTaskStore } from "../taskStore";
import NoAccess from "./components/NoAccess";
import TaskFigures from "./components/figures/TaskFigures";
import TaskHeader from "./components/header/TaskHeader";
import TaskInfoPanel from "./components/info/TaskInfoPanel";
import TaskLogPanel from "./components/log/TaskLogPanel";
import SchedulePanel from "./components/schedule/SchedulePanel";
import "./css/task.css";

export default function TaskPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { canEditTask, canDeleteTask, canViewTask, canMoveTask } = useAccess();
  const { today } = useIssue();
  const { taskMap, activityMap, moveTask, openTaskForm, deleteTask } =
    useTaskStore();

  // 只在进入页面时判断一次：任务之间跳转会换掉 location.key
  const [openedDirectly] = useState(location.key === "default");

  // 当前任务由地址栏 ?id= 决定
  const task = taskMap[Number(searchParams.get("id"))];

  // 返回进入任务详情之前的页面，直接打开地址时回看板
  const handleBack = () => {
    if (openedDirectly) navigate("/board");
    else navigate(-1);
  };

  // 任务不存在，回看板
  if (!task) return <Navigate to="/board" replace />;
  // 概览、时间线、协作、文档里的链接都能走到这里，所以任务详情这里统一拦住没有权限看的人
  if (!canViewTask(task)) return <NoAccess onBack={handleBack} />;

  // 任务之间跳转不新增历史记录，这样“返回”不用一层层退
  const handleOpenTask = (taskId: number) => {
    navigate(`/board/task?id=${taskId}`, { replace: true });
  };

  // 切换状态时放到目标列最上面
  const handleChangeStatus = (status: TaskStatus) => {
    if (status === task.status) return;
    const blocked = moveTask(task.id, status, 0);
    if (blocked) window.alert(blocked);
  };

  // 删除后这个任务没了，上面的“任务不存在”会自动回到看板
  const handleDelete = () => {
    const blocked = deleteTask(task.id);
    if (blocked) window.alert(blocked);
  };

  return (
    <section className="view" id="view-task" data-view="task">
      <TaskHeader
        task={task}
        onBack={handleBack}
        onChangeStatus={canMoveTask(task) ? handleChangeStatus : undefined}
        onEdit={
          canEditTask ? () => openTaskForm(task.id) : undefined
        }
        onDelete={canDeleteTask ? handleDelete : undefined}
      />
      <TaskFigures task={task} />
      <div className="tkg">
        <SchedulePanel
          task={task}
          activities={activityMap[task.id]}
          onOpenTask={handleOpenTask}
        />
        <TaskInfoPanel
          task={task}
          onOpenDocument={(documentId) =>
            navigate(`/documents?id=${documentId}`)
          }
          onOpenDiscussion={() => navigate("/collab")}
          onUploadDocument={() =>
            navigate("/documents", { state: { uploadTaskId: task.id } })
          }
          onCreateDiscussion={() =>
            navigate("/collab", { state: { newDiscussionTaskId: task.id } })
          }
        />
        <TaskLogPanel activities={activityMap[task.id]} today={today} />
      </div>
    </section>
  );
}
