import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { currentUser, taskStatusLabel } from "../../../data/global";
import {
  defaultTaskId,
  taskActivities as initialTaskActivities,
  taskDetails as initialTaskDetails,
  taskTodayDate,
} from "../../../data/task";
import type { Activity, TaskStatus } from "../../../types/global";
import type { TaskDetail } from "../../../types/task";
import TaskFigures from "./components/figures/TaskFigures";
import TaskHeader from "./components/header/TaskHeader";
import TaskInfoPanel from "./components/info/TaskInfoPanel";
import TaskLogPanel from "./components/log/TaskLogPanel";
import SchedulePanel from "./components/schedule/SchedulePanel";
import { applyTaskStatus } from "./utils";
import "./css/task.css";

export default function TaskPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 顶层状态
  const [taskMap, setTaskMap] =
    useState<Record<number, TaskDetail>>(initialTaskDetails);
  const [activityMap, setActivityMap] = useState<Record<number, Activity[]>>(
    initialTaskActivities,
  );
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

  // 切换任务状态，并追加一条操作记录
  const handleChangeStatus = (status: TaskStatus) => {
    if (status === task.status) return;

    setTaskMap((prev) => applyTaskStatus(prev, task.id, status, taskTodayDate));

    const newActivity: Activity = {
      id: Date.now(),
      user: currentUser,
      targetType: "TASK",
      targetId: task.id,
      action: "STATUS",
      detail: `${currentUser.realName} 把任务移到${taskStatusLabel[status]}`,
      createdAt: `${taskTodayDate} 刚刚`,
    };

    setActivityMap((prev) => ({
      ...prev,
      [task.id]: [newActivity, ...prev[task.id]],
    }));
  };

  return (
    <section className="view" id="view-task" data-view="task">
      <TaskHeader
        task={task}
        onBack={handleBack}
        onChangeStatus={handleChangeStatus}
      />
      <TaskFigures task={task} />
      <div className="tkg">
        <SchedulePanel
          task={task}
          today={taskTodayDate}
          onOpenTask={handleOpenTask}
        />
        <TaskInfoPanel
          task={task}
          onOpenDocument={() => navigate("/documents")}
          onOpenDiscussion={() => navigate("/collab")}
        />
        <TaskLogPanel activities={activityMap[task.id]} today={taskTodayDate} />
      </div>
    </section>
  );
}
