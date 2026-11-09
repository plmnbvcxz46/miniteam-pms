import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import type { MentionValue } from "../../../shared/types/collab";
import type { DocumentRef, UserBrief } from "../../../shared/types/global";

type MentionOption =
  | { kind: "user"; id: number; name: string }
  | { kind: "doc"; id: number; name: string };

interface MentionInputProps {
  value: MentionValue;
  onChange: (value: MentionValue) => void;
  /** 可以 @ 的成员 */
  users: UserBrief[];
  /** 可以 @ 的文档，没有关联任务时为空 */
  documents: DocumentRef[];
  /** Ctrl / Cmd + Enter */
  onSubmitShortcut?: () => void;
  id?: string;
  className?: string;
  placeholder?: string;
  rows?: number;
  /** 挂载时聚焦，光标放在内容末尾 */
  focusOnMount?: boolean;
}

/** 光标前面正在输入的 @ 查询：@ 前面要是行首或空白 */
function getTrigger(text: string, caret: number) {
  const before = text.slice(0, caret);
  const matched = /(^|\s)@([^\s@]*)$/.exec(before);
  if (!matched) return null;
  return { start: before.length - matched[2].length - 1, query: matched[2] };
}

export default function MentionInput({
  value,
  onChange,
  users,
  documents,
  onSubmitShortcut,
  id,
  className,
  placeholder,
  rows = 2,
  focusOnMount = false,
}: MentionInputProps) {
  const listId = useId();
  const innerRef = useRef<HTMLTextAreaElement>(null);
  const pendingCaret = useRef<number | null>(null);
  const [caret, setCaret] = useState(0);
  const [active, setActive] = useState(0);
  // 按 Esc 关掉的那次 @，输入内容变化后才会再弹
  const [dismissedAt, setDismissedAt] = useState<number | null>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!focusOnMount || !el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
    setCaret(el.value.length);
  }, [focusOnMount]);

  // 选中候选后把光标放到插入内容之后
  useLayoutEffect(() => {
    if (pendingCaret.current === null || !innerRef.current) return;
    innerRef.current.setSelectionRange(
      pendingCaret.current,
      pendingCaret.current,
    );
    pendingCaret.current = null;
  });

  const trigger = getTrigger(value.text, caret);
  const query = trigger?.query.toLowerCase() ?? "";
  const options: MentionOption[] = trigger
    ? [
        ...users.map((user) => ({
          kind: "user" as const,
          id: user.id,
          name: user.realName,
        })),
        ...documents.map((doc) => ({
          kind: "doc" as const,
          id: doc.id,
          name: doc.name,
        })),
      ].filter((option) => option.name.toLowerCase().includes(query))
    : [];
  const isOpen =
    trigger !== null && options.length > 0 && trigger.start !== dismissedAt;
  const activeIndex = Math.min(active, Math.max(options.length - 1, 0));

  const choose = (option: MentionOption) => {
    if (!trigger) return;
    const inserted = `@${option.name} `;
    const text =
      value.text.slice(0, trigger.start) + inserted + value.text.slice(caret);
    const nextCaret = trigger.start + inserted.length;
    pendingCaret.current = nextCaret;
    setCaret(nextCaret);
    onChange({
      text,
      mentions:
        option.kind === "user" &&
        !value.mentions.some((u) => u.id === option.id)
          ? [...value.mentions, users.find((user) => user.id === option.id)!]
          : value.mentions,
      documents:
        option.kind === "doc" &&
        !value.documents.some((d) => d.id === option.id)
          ? [...value.documents, documents.find((doc) => doc.id === option.id)!]
          : value.documents,
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const step = e.key === "ArrowDown" ? 1 : -1;
        setActive((activeIndex + step + options.length) % options.length);
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        choose(options[activeIndex]);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setDismissedAt(trigger.start);
        return;
      }
    }
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onSubmitShortcut?.();
    }
  };

  const syncCaret = (el: HTMLTextAreaElement) => setCaret(el.selectionStart);

  const renderGroup = (kind: MentionOption["kind"], title: string) => {
    const items = options
      .map((option, index) => ({ option, index }))
      .filter(({ option }) => option.kind === kind);
    if (items.length === 0) return null;
    return (
      <>
        <li className="mn-h" role="presentation">
          {title}
        </li>
        {items.map(({ option, index }) => (
          <li
            key={`${kind}-${option.id}`}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === activeIndex}
            className="mn-o"
            onMouseDown={(e) => {
              e.preventDefault();
              choose(option);
            }}
            onMouseEnter={() => setActive(index)}
          >
            {option.name}
          </li>
        ))}
      </>
    );
  };

  return (
    <div className="mn">
      <textarea
        ref={innerRef}
        id={id}
        className={className}
        rows={rows}
        placeholder={placeholder}
        value={value.text}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        aria-activedescendant={isOpen ? `${listId}-${activeIndex}` : undefined}
        onChange={(e) => {
          setDismissedAt(null);
          setActive(0);
          syncCaret(e.target);
          onChange({ ...value, text: e.target.value });
        }}
        onKeyDown={handleKeyDown}
        onKeyUp={(e) => syncCaret(e.currentTarget)}
        onClick={(e) => syncCaret(e.currentTarget)}
        onBlur={() => setDismissedAt(trigger?.start ?? null)}
      />
      {isOpen && (
        <ul className="mn-pop" id={listId} role="listbox">
          {renderGroup("user", "成员")}
          {renderGroup("doc", "文件")}
        </ul>
      )}
    </div>
  );
}
