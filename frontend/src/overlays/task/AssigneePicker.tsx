import { useMemo, useState } from "react";
import SearchDropdown from "../../shared/components/SearchDropdown";
import type { AssigneeCandidate } from "../../shared/types/task";
import {
  getRecommendedId,
  isOverloaded,
  loadRatio,
  pickVisibleTags,
  rankAssignees,
  splitNameByHits,
} from "./assignee";

interface AssigneePickerProps {
  /** 当前项目的成员 */
  candidates: AssigneeCandidate[];
  /** 为空是未分配 */
  value: number | null;
  /** labelledBy：外面“负责人”标签的 id */
  labelId: string;
  onChange: (userId: number | null) => void;
}

function LoadMeter({ candidate }: { candidate: AssigneeCandidate }) {
  return (
    <span className={isOverloaded(candidate) ? "ap-load over" : "ap-load"}>
      <span className="ap-bar">
        <i style={{ width: `${loadRatio(candidate) * 100}%` }} />
      </span>
      {candidate.load}/{candidate.capacity}h
    </span>
  );
}

export default function AssigneePicker({
  candidates,
  value,
  labelId,
  onChange,
}: AssigneePickerProps) {
  // 输入框内容由选择器自己管：打开时清空，关闭时清空
  const [query, setQuery] = useState("");

  const result = useMemo(
    () => rankAssignees(candidates, query),
    [candidates, query],
  );
  const { searching, rows } = result;
  const recommendedId = getRecommendedId(result);
  const matchedCount = rows.filter((row) => !row.miss).length;
  const selected = candidates.find((c) => c.user.id === value) ?? null;

  // 打开时高亮当前负责人；用 ↑ 打开则落在最后一行“未分配”
  const getInitialActive = (initialQuery: string, last: boolean) => {
    const ranked = rankAssignees(candidates, initialQuery).rows;
    const at = ranked.findIndex((row) => row.candidate.user.id === value);
    return last ? ranked.length : Math.max(at, 0);
  };

  return (
    <SearchDropdown
      items={rows}
      getKey={(row) => row.candidate.user.id}
      onPick={(row) => onChange(row.candidate.user.id)}
      value={query}
      onChange={setQuery}
      labelId={labelId}
      placeholder="技能 / 姓名，空格分隔，+必含 -排除"
      headWord="TEAM"
      count={searching ? `${matchedCount}/${rows.length}` : rows.length}
      emptyText="项目里还没有成员"
      getInitialActive={getInitialActive}
      isSelected={(row) => row.candidate.user.id === value}
      itemClassName={(row) => {
        const classes = ["ap-opt"];
        if (searching) classes.push(row.miss ? "miss" : "hit");
        return classes.join(" ");
      }}
      itemLabel={({ candidate }) =>
        `${candidate.user.realName}，${candidate.skillTags.join("、") || "无技能标签"}，负载 ${candidate.load}/${candidate.capacity} 小时${isOverloaded(candidate) ? "，超出上限" : ""}${candidate.user.id === recommendedId ? "，推荐" : ""}`
      }
      renderItem={(row) => {
        const { candidate } = row;
        const { shown, hidden } = pickVisibleTags(
          candidate.skillTags,
          row.hitTags,
        );
        const recommended = candidate.user.id === recommendedId;
        return (
          <>
            <span className="ap-nm">
              <span>
                {splitNameByHits(candidate.user.realName, row.nameHits).map(
                  (part, k) =>
                    part.hit ? <mark key={k}>{part.text}</mark> : part.text,
                )}
              </span>
              {recommended && <b className="chip">推荐</b>}
            </span>
            <span className="ap-tags">
              {shown.map((tag) => (
                <span
                  key={tag}
                  className={row.hitTags.has(tag) ? "ap-tag hit" : "ap-tag"}
                >
                  {tag}
                </span>
              ))}
              {hidden > 0 && <span className="ap-more">+{hidden}</span>}
            </span>
            <LoadMeter candidate={candidate} />
          </>
        );
      }}
      footer={{
        content: "未分配",
        selected: value === null,
        className: "ap-none",
        onPick: () => onChange(null),
      }}
      toggle={
        <>
          <span className={selected ? "ap-val" : "ap-val none"}>
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
      }
    />
  );
}
