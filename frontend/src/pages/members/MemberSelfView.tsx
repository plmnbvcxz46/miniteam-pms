import { useMemo } from "react";
import { useAccess } from "../../access/useAccess";
import { useMe } from "../../auth/useAuth";
import { getProfile } from "../../constants/mock";
import { useTaskStore } from "../board/taskStore";
import SelfHeader from "./components/self/SelfHeader";
import SelfIdentity from "./components/self/SelfIdentity";
import SelfLoad from "./components/self/SelfLoad";
import SelfLog from "./components/self/SelfLog";
import SelfPerms from "./components/self/SelfPerms";
import SelfTasks from "./components/self/SelfTasks";
import "./css/members.css";

/** 没有“管理成员”权限的人看到的“我的信息”：只有自己在当前项目里的信息 */
export default function MemberSelfView() {
  const { user } = useMe();
  const { members, permissions, projectRole, permLogs } = useAccess();
  const { taskMap } = useTaskStore();

  const member = members.find((m) => m.user.id === user.id) ?? null;
  const myTasks = useMemo(
    () => Object.values(taskMap).filter((task) => task.assignee?.id === user.id),
    [taskMap, user.id],
  );
  const myLogs = useMemo(
    () =>
      permLogs.filter(
        (log) => log.targetType === "MEMBER" && log.targetId === user.id,
      ),
    [permLogs, user.id],
  );
  const hours = member?.weeklyHours ?? 0;
  const capacity = member?.weeklyCapacity ?? 0;
  const openCount = myTasks.filter((task) => task.status !== "DONE").length;

  return (
    <section className="view" id="view-members" data-view="members-self">
      <SelfHeader openCount={openCount} hours={hours} />
      <div className="me-grid">
        <SelfIdentity
          user={user}
          position={member?.position ?? null}
          projectRole={projectRole}
          skillTags={getProfile(user.id).skillTags}
        />
        <SelfLoad hours={hours} capacity={capacity} />
        <SelfPerms permissions={permissions} />
        <SelfTasks tasks={myTasks} />
        <SelfLog logs={myLogs} />
      </div>
    </section>
  );
}
