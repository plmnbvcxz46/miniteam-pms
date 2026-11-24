import { useMemo } from "react";
import { useAccess } from "../../../state/access/useAccess";
import { useMe } from "../../../state/auth/useAuth";
import { useTaskStore } from "../../../state/task/taskStore";
import styles from "./MemberSelfView.module.css";
import SelfHeader from "./SelfHeader";
import SelfIdentity from "./SelfIdentity";
import SelfLoad from "./SelfLoad";
import SelfLog from "./SelfLog";
import SelfPerms from "./SelfPerms";
import SelfTasks from "./SelfTasks";

/** 没有“管理成员”权限的人看到的“我的信息”：只有自己在当前项目里的信息 */
export default function MemberSelfView() {
  const { user, skillTags } = useMe();
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
    <section className={styles.view}>
      <SelfHeader openCount={openCount} hours={hours} />
      <div className={styles.grid}>
        <SelfIdentity
          user={user}
          position={member?.position ?? null}
          projectRole={projectRole}
          skillTags={skillTags}
        />
        <SelfLoad hours={hours} capacity={capacity} />
        <SelfPerms permissions={permissions} />
        <SelfTasks tasks={myTasks} className={styles.span2} />
        <SelfLog logs={myLogs} />
      </div>
    </section>
  );
}
