import { Alert } from "../../../components/ui/Alert";
import { useMemberAdmin } from "../hooks/useMemberAdmin";
import InviteMemberDrawer from "./InviteMemberDrawer";
import styles from "./MemberAdminView.module.css";
import MemberCrew from "./MemberCrew";
import MembersHeader from "./MembersHeader";
import PermLog from "./PermLog";

/** 项目经理和有“管理成员”权限的人看到的成员管理页：成员和变更记录来自接口，改了马上刷新 */
export default function MemberAdminView() {
  const admin = useMemberAdmin();

  return (
    <section className={styles.view}>
      <MembersHeader
        memberCount={admin.memberCount}
        overCapacityCount={admin.overCapacityCount}
        canInvite={admin.canManageMember}
        onInviteClick={() => admin.setIsDrawerOpen(true)}
      />

      <MemberCrew
        members={admin.filteredMembers}
        capacityText={admin.capacityText}
        loadScale={admin.loadScale}
        permDefs={admin.permDefs}
        searchKeyword={admin.searchKeyword}
        onSearchChange={admin.setSearchKeyword}
        canManageMember={admin.canManageMember}
        onTogglePerm={admin.handleTogglePerm}
        onChangeRole={admin.handleChangeRole}
      />

      {admin.actionError && (
        <Alert variant="inline" tone="danger">
          {admin.actionError}
        </Alert>
      )}

      <PermLog logs={admin.logList} />

      <InviteMemberDrawer
        isOpen={admin.isDrawerOpen}
        onClose={() => admin.setIsDrawerOpen(false)}
        memberIds={admin.memberIds}
        permDefs={admin.permDefs}
        onSubmit={admin.handleInviteSubmit}
      />
    </section>
  );
}
