import { useMemo, useState } from "react";
import { useToast } from "../../../components/patterns/ToastHost";
import { permDefs } from "../../../shared/constants/permissions";
import type {
  MemberPermissions,
  PermKey,
  ProjectRole,
} from "../../../shared/types/global";
import type { Member, MemberAdd } from "../../../shared/types/members";
import { getLoadScale } from "../../../shared/utils/load";
import { useAccess } from "../../../stores/access/useAccess";
import { useIssue } from "../../../stores/issue/useIssue";
import { formatCapacity, getOverCapacityCount } from "../utils";

function filterMembers(members: Member[], keyword: string): Member[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return members;
  return members.filter(
    (m) =>
      m.user.realName.toLowerCase().includes(q) ||
      m.user.username.toLowerCase().includes(q),
  );
}

function togglePermission(member: Member, permKey: PermKey): MemberPermissions {
  return {
    canEditTask: member.canEditTask,
    canEditSchedule: member.canEditSchedule,
    canEditDoc: member.canEditDoc,
    canManageMember: member.canManageMember,
    [permKey]: !member[permKey],
  };
}

export function useMemberAdmin() {
  const toast = useToast();
  const {
    permissions,
    isArchived,
    members: memberList,
    permLogs: logList,
    inviteMember,
    changeMemberRole,
    setMemberPermissions,
  } = useAccess();
  const { isPast } = useIssue();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [actionError, setActionError] = useState("");

  const canManageMember = permissions.canManageMember && !isPast && !isArchived;
  const overCapacityCount = useMemo(() => getOverCapacityCount(memberList), [memberList]);
  const capacityText = useMemo(() => formatCapacity(memberList), [memberList]);
  const loadScale = useMemo(
    () =>
      getLoadScale(
        memberList.map((m) => m.weeklyHours),
        memberList.map((m) => m.weeklyCapacity),
      ),
    [memberList],
  );
  const filteredMembers = useMemo(
    () => filterMembers(memberList, searchKeyword),
    [memberList, searchKeyword],
  );

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    setActionError("");
    try {
      await action();
      toast(successMessage);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "操作失败，请稍后再试");
    }
  };

  const handleTogglePerm = (userId: number, permKey: PermKey) => {
    const target = memberList.find((m) => m.user.id === userId);
    if (!target || target.projectRole === "PM") return;
    void runAction(
      () => setMemberPermissions(userId, togglePermission(target, permKey)),
      "成员权限已更新",
    );
  };

  const handleChangeRole = (userId: number, role: ProjectRole) => {
    const target = memberList.find((m) => m.user.id === userId);
    if (!target || target.projectRole === role) return;
    void runAction(() => changeMemberRole(userId, role), "项目角色已更新");
  };

  const handleInviteSubmit = async (body: MemberAdd) => {
    await inviteMember(body);
    toast("已邀请成员加入项目");
  };

  return {
    memberCount: memberList.length,
    overCapacityCount,
    capacityText,
    loadScale,
    filteredMembers,
    memberIds: memberList.map((m) => m.user.id),
    permDefs,
    logList,
    searchKeyword,
    setSearchKeyword,
    isDrawerOpen,
    setIsDrawerOpen,
    actionError,
    canManageMember,
    handleTogglePerm,
    handleChangeRole,
    handleInviteSubmit,
  };
}
