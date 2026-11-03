import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useDismiss } from "../../layouts/useDismiss";
import type { AssigneeCandidate } from "../../types/task";
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
  const uid = useId();
  const valueId = `${uid}-value`;
  const listId = `${uid}-list`;
  const optionId = (userId: number | null) => `${uid}-opt-${userId ?? "none"}`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocus = useRef(false);

  const result = useMemo(
    () => rankAssignees(candidates, query),
    [candidates, query],
  );
  const { searching, rows } = result;
  const recommendedId = getRecommendedId(result);
  const matchedCount = rows.filter((row) => !row.miss).length;
  // 最后一项是“未分配”
  const optionCount = rows.length + 1;
  const selected = candidates.find((c) => c.user.id === value) ?? null;

  const openPicker = (initialQuery = "", last = false) => {
    const ranked = rankAssignees(candidates, initialQuery).rows;
    const at = ranked.findIndex((row) => row.candidate.user.id === value);
    setQuery(initialQuery);
    setActive(last ? ranked.length : Math.max(at, 0));
    setOpen(true);
  };

  const close = (focusToggle: boolean) => {
    restoreFocus.current = focusToggle;
    setOpen(false);
    setQuery("");
  };

  const pick = (userId: number | null) => {
    onChange(userId);
    close(true);
  };

  useDismiss(open, rootRef, () => close(false));

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (restoreFocus.current) {
      restoreFocus.current = false;
      toggleRef.current?.focus();
    }
  }, [open]);

  // 键盘移动高亮时，让当前项留在可见范围里
  const activeId = open
    ? optionId(active < rows.length ? rows[active].candidate.user.id : null)
    : undefined;
  useEffect(() => {
    if (activeId) {
      document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
    }
  }, [activeId]);

  const handleToggleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      openPicker();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      openPicker("", true);
    } else if (
      e.key.length === 1 &&
      e.key !== " " &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      e.preventDefault();
      openPicker(e.key);
    }
  };

  const handleInputKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((active + 1) % optionCount);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((active - 1 + optionCount) % optionCount);
    } else if (e.key === "Enter") {
      // 不能触发表单提交
      e.preventDefault();
      pick(active < rows.length ? rows[active].candidate.user.id : null);
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      close(true);
    } else if (e.key === "Tab") {
      close(false);
    }
  };

  return (
    <div className="ap" ref={rootRef}>
      {open ? (
        <input
          className="u"
          ref={inputRef}
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-autocomplete="list"
          aria-labelledby={labelId}
          aria-activedescendant={activeId}
          placeholder="技能 / 姓名，空格分隔，+必含 -排除"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={handleInputKey}
        />
      ) : (
        <button
          className="ap-tg"
          type="button"
          ref={toggleRef}
          aria-haspopup="listbox"
          aria-expanded="false"
          aria-labelledby={`${labelId} ${valueId}`}
          onClick={() => openPicker()}
          onKeyDown={handleToggleKey}
        >
          <span id={valueId} className={selected ? "nm" : "nm none"}>
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
        </button>
      )}

      {open && (
        <div className="issues ap-pop">
          <h4 aria-hidden="true">
            TEAM<em>{searching ? `${matchedCount}/${rows.length}` : rows.length}</em>
          </h4>
          <div role="listbox" id={listId} aria-labelledby={labelId}>
            <div className="list scroll-y" role="presentation">
              {rows.length === 0 && <div className="pempty">项目里还没有成员</div>}
              {rows.map((row, i) => {
                const { candidate } = row;
                const { shown, hidden } = pickVisibleTags(
                  candidate.skillTags,
                  row.hitTags,
                );
                const recommended = candidate.user.id === recommendedId;
                const classes = ["ap-opt"];
                if (i === active) classes.push("on");
                if (searching) classes.push(row.miss ? "miss" : "hit");
                return (
                  <div
                    key={candidate.user.id}
                    id={optionId(candidate.user.id)}
                    role="option"
                    aria-selected={candidate.user.id === value}
                    aria-label={`${candidate.user.realName}，${candidate.skillTags.join("、") || "无技能标签"}，负载 ${candidate.load}/${candidate.capacity} 小时${isOverloaded(candidate) ? "，超出上限" : ""}${recommended ? "，推荐" : ""}`}
                    className={classes.join(" ")}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => pick(candidate.user.id)}
                  >
                    <span className="ap-nm">
                      <span>
                        {splitNameByHits(candidate.user.realName, row.nameHits).map(
                          (part, k) =>
                            part.hit ? (
                              <mark key={k}>{part.text}</mark>
                            ) : (
                              part.text
                            ),
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
                  </div>
                );
              })}
            </div>
            <div
              id={optionId(null)}
              role="option"
              aria-selected={value === null}
              className={
                active === rows.length ? "ap-opt ap-none on" : "ap-opt ap-none"
              }
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(rows.length)}
              onClick={() => pick(null)}
            >
              未分配
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
