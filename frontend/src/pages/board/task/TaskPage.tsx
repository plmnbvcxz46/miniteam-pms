import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { defaultTaskId, taskTodayDate } from "../../../data/task";
import type { TaskStatus } from "../../../types/global";
import { useTaskStore } from "../taskStore";
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
  const { taskMap, activityMap, moveTask, openTaskForm } = useTaskStore();

  // 只在进入页面时判断一次：任务之间跳转会换掉 location.key
  const [openedDirectly] = useState(location.key === "default");

  // 当前任务由地址栏 ?id= 决定，没带或不存在时打开默认任务
  const task =
    taskMap[Number(searchParams.get("id"))] ?? taskMap[defaultTaskId];

  // 返回进入任务详情之前的页面，直接打开地址时回看板
  const handleBack = () => {
    if (openedDirectly) navigate("/board");
    else navigate(-1);
  };

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

  return (
    <section className="view" id="view-task" data-view="task">
      <TaskHeader
        task={task}
        onBack={handleBack}
        onChangeStatus={handleChangeStatus}
        onEdit={() => openTaskForm(task.id)}
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
        <TaskLogPanel activities={activityMap[task.id]} today={taskTodayDate} />
      </div>
    </section>
  );
}
