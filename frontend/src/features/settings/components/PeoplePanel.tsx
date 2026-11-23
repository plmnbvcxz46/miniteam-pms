import { usePeople } from "../hooks/usePeople";
import { NewPersonForm } from "./NewPersonForm";
import { PeopleSide } from "./PeopleSide";
import { PersonDetail } from "./PersonDetail";
import styles from "./People.module.css";

/** 人员：名册搜索、详情编辑（类型/启停/重置/删除）与新增人员 */
export function PeoplePanel() {
  const p = usePeople();

  return (
    <div className={styles.layout}>
      <PeopleSide people={p} />

      <div className={styles.main}>
        {p.creating ? (
          <NewPersonForm
            roles={p.roles}
            existing={p.list.map((u) => u.username)}
            onCancel={() => p.setCreating(false)}
            onSubmit={p.create}
          />
        ) : p.selected ? (
          <PersonDetail
            user={p.selected}
            roles={p.roles}
            isSelf={p.isSelf}
            resetNotice={p.resetNotice}
            confirmDelete={p.confirmDelete}
            removing={p.removing}
            onChangeRole={(id) => void p.changeRole(id)}
            onChangeStatus={(enabled) => void p.changeStatus(enabled)}
            onResetPassword={() => void p.resetPassword()}
            onConfirmDeleteChange={p.setConfirmDelete}
            onRemove={() => void p.remove()}
          />
        ) : (
          !p.loading && <p className={styles.note}>没有人员</p>
        )}
      </div>
    </div>
  );
}
