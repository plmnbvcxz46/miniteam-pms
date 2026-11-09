import { useAccess } from "../../state/access/useAccess";
import MemberAdminView from "./MemberAdminView";
import MemberSelfView from "./MemberSelfView";

/**
 * 成员与权限：有“管理成员”权限的人（项目经理、系统管理员）看全部成员，
 * 其他人只看自己的信息
 */
export default function MembersPage() {
  const { permissions } = useAccess();
  return permissions.canManageMember ? <MemberAdminView /> : <MemberSelfView />;
}
