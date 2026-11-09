import { useState, useMemo } from "react";
import type { PermKey, MemberPermissions, ProjectRole } from "../../types/global";
import type { MemberAdd } from "../../types/members";
import { useAccess } from "../../access/useAccess";
import { useIssue } from "../../issue/useIssue";
import { permDefs } from "../../data/members";
import { getLoadScale } from "../../utils/load";
import { formatCapacity, getOverCapacityCount } from "./utils";
import MembersHeader from "./components/header/MembersHeader";
import MemberCrew from "./components/crew/MemberCrew";
import PermLog from "./components/log/PermLog";
import InviteMemberDrawer from "./components/drawer/InviteMemberDrawer";
import "./css/members.css";

/** 项目经理和有“管理成员”权限的人看到的成员管理页：成员和变更记录来自接口，改了马上刷新 */
export default function MemberAdminView() {
  const {
    permissions,
    isArchived,
    members: accessMembers,
    permLogs: logList,
    inviteMember,
    changeMemberRole,
    setMemberPermissions,
  } = useAccess();

  const { isPast } = useIssue();
  // 看过去的期时，成员的负责任务数已经是那一期快照里的（见 AccessProvider）
  const memberList = accessMembers;

  // 搜索关键字
  const [searchKeyword, setSearchKeyword] = useState<string>("");

  // 抽屉显隐
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  // 改角色、改权限失败时的提示（邀请失败显示在抽屉里）
  const [actionError, setActionError] = useState("");

  // 过去的期只读
  const canManageMember = permissions.canManageMember && !isPast && !isArchived;
  const overCapacityCount = useMemo(
    () => getOverCapacityCount(memberList),
    [memberList],
  );
  // 所有成员共用一根坐标轴，搜索过滤时各条的长度不跟着变
  const loadScale = useMemo(
    () =>
      getLoadScale(
        memberList.map((m) => m.weeklyHours),
        memberList.map((m) => m.weeklyCapacity),
      ),
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

  const run = async (action: () => Promise<void>) => {
    setActionError("");
    try {
      await action();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "操作失败，请稍后再试");
    }
  };

  // 切换成员的一项权限；变更记录由后端写，刷新后出现在下面
  const handleTogglePerm = (userId: number, permKey: PermKey) => {
    const target = memberList.find((m) => m.user.id === userId);
    if (!target || target.projectRole === "PM") return;
    const next: MemberPermissions = {
      canEditTask: target.canEditTask,
      canEditSchedule: target.canEditSchedule,
      canEditDoc: target.canEditDoc,
      canManageMember: target.canManageMember,
      [permKey]: !target[permKey],
    };
    void run(() => setMemberPermissions(userId, next));
  };

  // 修改成员在本项目里的角色：改成项目经理时全部权限打开，从项目经理改成别的角色时回到默认权限（后端处理）
  const handleChangeRole = (userId: number, role: ProjectRole) => {
    const target = memberList.find((m) => m.user.id === userId);
    if (!target || target.projectRole === role) return;
    void run(() => changeMemberRole(userId, role));
  };

  // 邀请成员提交：失败时抛错，由抽屉显示
  const handleInviteSubmit = (body: MemberAdd) => inviteMember(body);

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
        capacityText={formatCapacity(memberList)}
        loadScale={loadScale}
        permDefs={permDefs}
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
        canManageMember={canManageMember}
        onTogglePerm={handleTogglePerm}
        onChangeRole={handleChangeRole}
      />

      {actionError && (
        <p className="msg err" role="alert">
          {actionError}
        </p>
      )}

      <PermLog logs={logList} />

      <InviteMemberDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        memberIds={memberList.map((m) => m.user.id)}
        permDefs={permDefs}
        onSubmit={handleInviteSubmit}
      />
    </section>
  );
}
