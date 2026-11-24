import { Input } from "../../../components/ui/Input";
import type { PermDef } from "../../../shared/types/members";
import styles from "./MemberCrew.module.css";

interface CrewLabelsProps {
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  permDefs: PermDef[];
  capacityText: string;
}

export default function CrewLabels({
  searchKeyword,
  onSearchChange,
  permDefs,
  capacityText,
}: CrewLabelsProps) {
  return (
    <>
      <div className={`${styles.labelCell} ${styles.toolsCell}`}>
        <Input
          variant="boxed"
          size="sm"
          mono
          type="search"
          placeholder="姓名或账号"
          value={searchKeyword}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="按姓名或账号搜索成员"
        />
      </div>

      <div className={styles.labelCell}>
        <b className={styles.labelTitle}>本周工时</b>
        <small className={styles.labelSub}>
          单位：小时{capacityText && ` · ${capacityText}/周`}
        </small>
      </div>

      <div className={styles.labelCell}>
        <b className={styles.labelTitle}>负责任务</b>
      </div>

      <div className={styles.labelCell}>
        <b className={styles.labelTitle}>项目角色</b>
      </div>

      {permDefs.map((def) => (
        <div key={def.key} className={styles.labelCell}>
          <b className={styles.labelTitle}>{def.label}</b>
          <small className={styles.labelSub}>{def.desc}</small>
        </div>
      ))}
    </>
  );
}
