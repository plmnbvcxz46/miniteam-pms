import {
  SearchDropdown,
  SearchDropdownRow,
} from "../../../components/patterns/SearchDropdown";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import { Spinner } from "../../../components/ui/Spinner";
import type { usePeople } from "../hooks/usePeople";
import { PeopleRoster } from "./PeopleRoster";
import styles from "./People.module.css";

/** 人员左栏：搜索框 + 新增按钮 + 名册 */
export function PeopleSide({
  people,
}: {
  people: ReturnType<typeof usePeople>;
}) {
  return (
    <div className={styles.side}>
      <div className={styles.toolbar}>
        <SearchDropdown
          variant="box"
          boxLabel="搜索"
          inputId="people-search"
          items={people.visible}
          getKey={(u) => u.id}
          value={people.query}
          onChange={people.setQuery}
          onPick={(u) => {
            people.setQuery(u.realName);
            people.select(u.id);
          }}
          placeholder="姓名或账号"
          headWord="PEOPLE"
          emptyText="没有匹配的人员"
          minWidth={300}
          renderItem={(u) => (
            <SearchDropdownRow
              name={u.realName}
              sub={u.username}
              end={u.roleName}
            />
          )}
        />
        <Button
          variant="primary"
          disabled={people.loading || people.roles.length === 0}
          onClick={() => people.setCreating(true)}
        >
          新增人员
        </Button>
      </div>
      {people.loading && (
        <p className={styles.note}>
          <Spinner size="sm" /> 加载中…
        </p>
      )}
      {people.loadError && (
        <Alert variant="inline" tone="danger">
          {people.loadError}
        </Alert>
      )}
      {!people.loading && !people.loadError && people.visible.length === 0 && (
        <p className={styles.note}>没有匹配的人员</p>
      )}
      <PeopleRoster
        users={people.visible}
        selectedId={people.creating ? null : (people.selected?.id ?? null)}
        onSelect={people.select}
      />
    </div>
  );
}
