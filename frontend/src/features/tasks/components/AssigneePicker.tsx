import { LoadBar } from "../../../components/patterns/LoadBar";
import { SearchDropdown } from "../../../components/patterns/SearchDropdown";
import { Badge } from "../../../components/ui/Badge";
import type { AssigneeCandidate } from "../../../shared/types/task";
import {
  getRecommendedId,
  isOverloaded,
  pickVisibleTags,
  rankAssignees,
  splitNameByHits,
  type RankedCandidate,
} from "../assignee";
import styles from "./AssigneePicker.module.css";

interface AssigneePickerProps {
  /** 当前项目的成员 */
  candidates: AssigneeCandidate[];
  /** 为空是未分配 */
  value: number | null;
  /** labelId：外面“负责人”标签的 id */
  labelId: string;
  /** inputId：关联 Field htmlFor */
  inputId?: string;
  query: string;
  onQueryChange: (query: string) => void;
  onChange: (userId: number | null) => void;
}

function LoadMeter({ candidate }: { candidate: AssigneeCandidate }) {
  return (
    <span
      className={styles.load}
      data-over={isOverloaded(candidate) ? "true" : undefined}
    >
      <span className={styles.barWrap}>
        <LoadBar
          variant="compact"
          hours={candidate.load}
          capacity={candidate.capacity}
          label="本周工时"
        />
      </span>
      {candidate.load}/{candidate.capacity}h
    </span>
  );
}

function AssigneeToggle({ selected }: { selected: AssigneeCandidate | null }) {
  return (
    <>
      <span
        className={styles.selectedName}
        data-empty={!selected ? "true" : undefined}
      >
        {selected ? selected.user.realName : "未分配"}
      </span>
      {selected ? <LoadMeter candidate={selected} /> : <span />}
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
      >
        <path d="M2 4l4 4 4-4" />
      </svg>
    </>
  );
}

function AssigneeOption({
  row,
  searching,
  recommended,
  firstMiss,
}: {
  row: RankedCandidate;
  searching: boolean;
  recommended: boolean;
  firstMiss: boolean;
}) {
  const { candidate } = row;
  const { shown, hidden } = pickVisibleTags(candidate.skillTags, row.hitTags);

  return (
    <div
      className={styles.optionRow}
      data-state={searching ? (row.miss ? "miss" : "hit") : undefined}
      data-first-miss={firstMiss ? "true" : undefined}
    >
      <span className={styles.name}>
        <span>
          {splitNameByHits(candidate.user.realName, row.nameHits).map(
            (part, idx) =>
              part.hit ? (
                <mark key={idx} className={styles.hitMark}>
                  {part.text}
                </mark>
              ) : (
                part.text
              ),
          )}
        </span>
        {recommended && (
          <Badge variant="accent" size="sm">
            推荐
          </Badge>
        )}
      </span>
      <span className={styles.tags}>
        {shown.map((tag) => (
          <span
            key={tag}
            className={styles.tag}
            data-hit={row.hitTags.has(tag) ? "true" : undefined}
          >
            {tag}
          </span>
        ))}
        {hidden > 0 && <span className={styles.moreTags}>+{hidden}</span>}
      </span>
      <LoadMeter candidate={candidate} />
    </div>
  );
}

export default function AssigneePicker({
  candidates,
  value,
  labelId,
  inputId,
  query,
  onQueryChange,
  onChange,
}: AssigneePickerProps) {
  const result = rankAssignees(candidates, query);
  const { searching, rows } = result;
  const recommendedId = getRecommendedId(result);
  const matchedCount = rows.filter((row) => !row.miss).length;
  const firstMissId = searching
    ? (rows.find((row) => row.miss)?.candidate.user.id ?? null)
    : null;
  const selected = candidates.find((c) => c.user.id === value) ?? null;

  const getInitialActive = (initialQuery: string, last: boolean) => {
    const ranked = rankAssignees(candidates, initialQuery).rows;
    const at = ranked.findIndex((row) => row.candidate.user.id === value);
    return last ? ranked.length : Math.max(at, 0);
  };

  return (
    <div className={styles.picker}>
      <SearchDropdown
        inputId={inputId}
        items={rows}
        getKey={(row) => row.candidate.user.id}
        onPick={(row) => onChange(row.candidate.user.id)}
        value={query}
        onChange={onQueryChange}
        labelId={labelId}
        placeholder="技能 / 姓名，空格分隔，+必含 -排除"
        headWord="TEAM"
        count={searching ? `${matchedCount}/${rows.length}` : rows.length}
        emptyText="项目里还没有成员"
        getInitialActive={getInitialActive}
        isSelected={(row) => row.candidate.user.id === value}
        itemLabel={({ candidate }) =>
          `${candidate.user.realName}，${candidate.skillTags.join("、") || "无技能标签"}，负载 ${candidate.load}/${candidate.capacity} 小时${isOverloaded(candidate) ? "，超出上限" : ""}${candidate.user.id === recommendedId ? "，推荐" : ""}`
        }
        renderItem={(row) => (
          <AssigneeOption
            row={row}
            searching={searching}
            recommended={row.candidate.user.id === recommendedId}
            firstMiss={row.candidate.user.id === firstMissId}
          />
        )}
        footer={{
          content: (
            <span
              className={styles.noneOption}
              data-selected={value === null ? "true" : undefined}
            >
              未分配
            </span>
          ),
          selected: value === null,
          onPick: () => onChange(null),
        }}
        toggle={<AssigneeToggle selected={selected} />}
      />
    </div>
  );
}
