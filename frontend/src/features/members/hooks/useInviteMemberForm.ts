import { useEffect, useState, type FormEvent } from "react";
import { userApi } from "../../../services/system";
import type {
  MemberPermissions,
  ProjectRole,
  UserBrief,
} from "../../../shared/types/global";
import type { MemberAdd } from "../../../shared/types/members";

const DEFAULT_PERMS: MemberPermissions = {
  canEditTask: false,
  canEditSchedule: false,
  canEditDoc: true,
  canManageMember: false,
};

interface UseInviteMemberFormOptions {
  memberIds: number[];
  onSubmit: (body: MemberAdd) => Promise<void>;
  onClose: () => void;
}

function resolveRoleState(
  newRole: ProjectRole,
  position: string,
  prevPerms: MemberPermissions,
): { perms: MemberPermissions; position: string } {
  if (newRole === "PM") {
    return {
      perms: {
        canEditTask: true,
        canEditSchedule: true,
        canEditDoc: true,
        canManageMember: true,
      },
      position: position || "项目经理",
    };
  }
  if (newRole === "TESTER") {
    return {
      perms: {
        ...prevPerms,
        canEditSchedule: false,
        canManageMember: false,
      },
      position: position || "测试",
    };
  }
  return { perms: prevPerms, position };
}

function defaultPositionForRole(role: ProjectRole): string {
  if (role === "PM") return "项目经理";
  if (role === "TESTER") return "测试";
  return "开发";
}

function useUserSearch(
  memberIds: number[],
  onSearchError: (msg: string) => void,
) {
  const [keyword, setKeyword] = useState("");
  const [found, setFound] = useState<UserBrief[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(0);
  const [userError, setUserError] = useState("");
  const candidates = (found ?? []).filter((u) => !memberIds.includes(u.id));

  // 输入停顿 300ms 后搜；已经选了人时不再搜，丢弃晚到的旧响应
  useEffect(() => {
    const text = keyword.trim();
    if (!text || selectedUserId !== 0) return;
    let stale = false;
    const timer = setTimeout(async () => {
      try {
        const list = await userApi.search(text);
        if (stale) return;
        setFound(list);
        onSearchError("");
      } catch (e) {
        if (stale) return;
        onSearchError(e instanceof Error ? e.message : "搜索失败，请稍后再试");
      } finally {
        if (!stale) setSearching(false);
      }
    }, 300);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [keyword, selectedUserId, onSearchError]);

  const handleKeywordChange = (text: string) => {
    setKeyword(text);
    setSelectedUserId(0);
    setUserError("");
    setSearching(Boolean(text.trim()));
    if (!text.trim()) setFound(null);
  };

  const handlePickUser = (user: UserBrief) => {
    setSelectedUserId(user.id);
    setKeyword(`${user.realName} (${user.username})`);
    setSearching(false);
    setUserError("");
  };

  const resetSearch = () => {
    setKeyword("");
    setFound(null);
    setSearching(false);
    setSelectedUserId(0);
    setUserError("");
  };

  return {
    keyword,
    candidates,
    searching,
    selectedUserId,
    userError,
    setUserError,
    handleKeywordChange,
    handlePickUser,
    resetSearch,
  };
}

export function useInviteMemberForm({
  memberIds,
  onSubmit,
  onClose,
}: UseInviteMemberFormOptions) {
  const [role, setRole] = useState<ProjectRole>("MEMBER");
  const [position, setPosition] = useState("");
  const [perms, setPerms] = useState<MemberPermissions>(DEFAULT_PERMS);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const search = useUserSearch(memberIds, setSubmitError);

  const reset = () => {
    search.resetSearch();
    setRole("MEMBER");
    setPosition("");
    setPerms(DEFAULT_PERMS);
    setSubmitting(false);
    setSubmitError("");
  };

  const handleRoleChange = (newRole: ProjectRole) => {
    setRole(newRole);
    const next = resolveRoleState(newRole, position, perms);
    setPerms(next.perms);
    setPosition(next.position);
  };

  const handlePermToggle = (key: keyof MemberPermissions) => {
    if (role === "PM") return;
    setPerms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const target = search.candidates.find((c) => c.id === search.selectedUserId);
    if (!target) {
      search.setUserError("请先搜索并选择要邀请的用户");
      return;
    }
    search.setUserError("");
    setSubmitError("");
    setSubmitting(true);
    try {
      await onSubmit({
        userId: target.id,
        projectRole: role,
        position: position.trim() || defaultPositionForRole(role),
        ...perms,
      });
      reset();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "邀请失败，请稍后再试");
      setSubmitting(false);
    }
  };

  return {
    ...search,
    role,
    position,
    setPosition,
    perms,
    submitting,
    submitError,
    reset,
    handleRoleChange,
    handlePermToggle,
    handleSubmit,
  };
}
