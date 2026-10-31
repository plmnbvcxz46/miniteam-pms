import { useState, useMemo } from "react";
import type { PermKey, Activity } from "../../types/global";
import type { Member } from "../../types/members";
import { currentUser, myPermissions } from "../../data/global";
import {
  members as initialMembers,
  permLogs as initialPermLogs,
  permDefs,
  inviteCandidates,
} from "../../data/members";
import { formatFullDateTime, getOverCapacityCount } from "./utils";
import MembersHeader from "./components/header/MembersHeader";
import MemberCrew from "./components/crew/MemberCrew";
import PermLog from "./components/log/PermLog";
import InviteMemberDrawer from "./components/drawer/InviteMemberDrawer";
import "./css/members.css";

export default function MembersPage() {
  // 顶层状态：成员列表与变更动态
  const [memberList, setMemberList] = useState<Member[]>(initialMembers);
  const [logList, setLogList] = useState<Activity[]>(initialPermLogs);

  // 搜索关键字
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // 抽屉显隐
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // 权限与人数统计
  const canManageMember = myPermissions.canManageMember;
  const overCapacityCount = useMemo(
    () => getOverCapacityCount(memberList),
    [memberList],
  );

  // 搜索过滤后的成员列表
  const filteredMembers = useMemo(() => {
    const q = searchKeyword.trim().toLowerCase();
    if (!q) return memberList;
    return memberList.filter(
      (m) =>
        m.user.realName.toLowerCase().includes(q) ||
        m.user.username.toLowerCase().includes(q),
    );
  }, [memberList, searchKeyword]);

  // 抽屉中过滤掉已在项目内的候选人
  const availableCandidates = useMemo(() => {
    const existingUserIds = new Set(memberList.map((m) => m.user.id));
    return inviteCandidates.filter((c) => !existingUserIds.has(c.id));
  }, [memberList]);

  // 切换成员权限并追加变更日志
  const handleTogglePerm = (userId: number, permKey: PermKey) => {
    const targetMember = memberList.find((m) => m.user.id === userId);
    if (!targetMember || targetMember.projectRole === "PM") {
      return;
    }

    const nextVal = !targetMember[permKey];
    const permDef = permDefs.find((p) => p.key === permKey);
    const verb = nextVal ? "授予" : "收回";

    // 更新成员权限列表
    setMemberList((prev) =>
      prev.map((m) =>
        m.user.id === userId ? { ...m, [permKey]: nextVal } : m,
      ),
    );

    // 记录权限变更动态
    const newLog: Activity = {
      id: Date.now(),
      user: currentUser,
      targetType: "MEMBER",
      targetId: userId,
      action: nextVal ? "GRANT" : "REVOKE",
      detail: `${currentUser.realName} ${verb} ${targetMember.user.realName} ${permDef?.label || ""}`,
      createdAt: formatFullDateTime(new Date()),
    };
    setLogList((prev) => [newLog, ...prev]);
  };

  // 邀请成员提交
  const handleInviteSubmit = (data: {
    user: typeof inviteCandidates[number];
    projectRole: Member["projectRole"];
    position: string;
    permissions: Member["canEditTask" & string] extends boolean ? import("../../types/global").MemberPermissions : never;
  }) => {
    const nowStr = formatFullDateTime(new Date());
    const newMember: Member = {
      user: data.user,
      projectRole: data.projectRole,
      position: data.position,
      weeklyHours: 0,
      weeklyCapacity: 40,
      overCapacity: false,
      taskCount: 0,
      joinedAt: nowStr,
      ...data.permissions,
    };

    setMemberList((prev) => [...prev, newMember]);

    // 记录邀请动态
    const newLog: Activity = {
      id: Date.now(),
      user: currentUser,
      targetType: "MEMBER",
      targetId: data.user.id,
      action: "INVITE",
      detail: `${currentUser.realName} 邀请 ${data.user.realName} 加入项目`,
      createdAt: nowStr,
    };
    setLogList((prev) => [newLog, ...prev]);
  };

  return (
    <section className="view" id="view-members" data-view="members">
      <MembersHeader
        memberCount={memberList.length}
        overCapacityCount={overCapacityCount}
        canInvite={canManageMember}
        onInviteClick={() => setIsDrawerOpen(true)}
      />

      <MemberCrew
        members={filteredMembers}
        permDefs={permDefs}
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        canManageMember={canManageMember}
        onTogglePerm={handleTogglePerm}
      />

      <PermLog logs={logList} />

      <InviteMemberDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        candidates={availableCandidates}
        permDefs={permDefs}
        onSubmit={handleInviteSubmit}
      />
    </section>
  );
}
