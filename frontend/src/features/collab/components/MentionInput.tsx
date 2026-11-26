import { useId, useRef, type KeyboardEvent } from "react";
import { Textarea, type TextareaVariant } from "../../../components/ui/Textarea";
import type { MentionValue } from "../../../shared/types/collab";
import type { DocumentRef, UserBrief } from "../../../shared/types/global";
import { useMentionInput } from "../hooks/useMentionInput";
import type { MentionOption } from "../utils/mention";
import styles from "./MentionInput.module.css";

export interface MentionInputProps {
  id?: string;
  variant?: TextareaVariant;
  value: MentionValue;
  users: UserBrief[];
  documents: DocumentRef[];
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  invalid?: boolean;
  onChange: (next: MentionValue) => void;
  onSubmitShortcut?: () => void;
  className?: string;
  textareaClassName?: string;
}

function MentionPopover({
  listboxId,
  options,
  activeIndex,
  onPick,
}: {
  listboxId: string;
  options: MentionOption[];
  activeIndex: number;
  onPick: (opt: MentionOption) => void;
}) {
  return (
    <div id={listboxId} role="listbox" className={styles.popover}>
      <div className={styles.popHead}>提及成员或任务文件</div>
      {options.map((opt, index) => (
        <button
          key={opt.key}
          type="button"
          role="option"
          aria-selected={index === activeIndex}
          className={styles.option}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(opt);
          }}
        >
          <span className={styles.kindTag}>
            {opt.kind === "user" ? "成员" : "文件"}
          </span>
          <span className={styles.optName}>{opt.name}</span>
          <span className={styles.optSub}>{opt.sub}</span>
        </button>
      ))}
    </div>
  );
}

function runMentionKeyDown(
  e: KeyboardEvent<HTMLTextAreaElement>,
  params: {
    isOpen: boolean;
    onMove: (delta: number) => void;
    onConfirm: () => void;
    onDismiss: () => void;
    onSubmitShortcut?: () => void;
  },
) {
  if (e.nativeEvent.isComposing) return;
  const { isOpen, onMove, onConfirm, onDismiss, onSubmitShortcut } = params;
  if (isOpen && e.key === "ArrowDown") {
    e.preventDefault();
    onMove(1);
    return;
  }
  if (isOpen && e.key === "ArrowUp") {
    e.preventDefault();
    onMove(-1);
    return;
  }
  if (isOpen && ((e.key === "Enter" && !e.shiftKey) || e.key === "Tab")) {
    e.preventDefault();
    onConfirm();
    return;
  }
  if (isOpen && e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    onDismiss();
    return;
  }
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    e.preventDefault();
    onSubmitShortcut?.();
  }
}

export function MentionInput({
  id,
  variant = "boxed",
  value,
  users,
  documents,
  placeholder,
  rows = 2,
  disabled,
  invalid,
  onChange,
  onSubmitShortcut,
  className,
  textareaClassName,
}: MentionInputProps) {
  const listboxId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const state = useMentionInput(
    textareaRef,
    value,
    users,
    documents,
    onChange,
  );

  return (
    <div className={className ? `${styles.root} ${className}` : styles.root}>
      <Textarea
        ref={textareaRef}
        id={id}
        variant={variant}
        invalid={invalid}
        disabled={disabled}
        rows={rows}
        value={value.text}
        placeholder={placeholder}
        className={textareaClassName}
        aria-expanded={state.isOpen}
        aria-controls={state.isOpen ? listboxId : undefined}
        onFocus={(e) =>
          state.onFocus(e.currentTarget.selectionStart ?? value.text.length)
        }
        onBlur={state.onBlur}
        onClick={(e) => state.onCaretMove(e.currentTarget.selectionStart ?? 0)}
        onKeyUp={(e) => state.onCaretMove(e.currentTarget.selectionStart ?? 0)}
        onKeyDown={(e) =>
          runMentionKeyDown(e, {
            isOpen: state.isOpen,
            onMove: state.onMove,
            onConfirm: () => state.pickOption(state.options[state.safeIndex]),
            onDismiss: state.onDismiss,
            onSubmitShortcut,
          })
        }
        onChange={(e) =>
          state.onTextChange(
            e.target.value,
            e.currentTarget.selectionStart ?? e.target.value.length,
          )
        }
      />
      {state.isOpen && (
        <MentionPopover
          listboxId={listboxId}
          options={state.options}
          activeIndex={state.safeIndex}
          onPick={state.pickOption}
        />
      )}
    </div>
  );
}
