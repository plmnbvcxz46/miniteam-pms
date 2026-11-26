import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import type { MentionValue } from "../../../shared/types/collab";
import type { DocumentRef, UserBrief } from "../../../shared/types/global";
import {
  applyPickedMention,
  buildMentionOptions,
  detectMentionTrigger,
  type MentionOption,
} from "../utils/mention";

function useWindowMentionEscape(
  isOpen: boolean,
  triggerStart: number | null,
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  onDismiss: (start: number) => void,
) {
  useEffect(() => {
    if (!isOpen || triggerStart === null) return;
    const onWindowEscape = (e: KeyboardEvent) => {
      if (e.isComposing || e.key !== "Escape") return;
      if (e.target !== textareaRef.current) return;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      onDismiss(triggerStart);
    };
    window.addEventListener("keydown", onWindowEscape, true);
    return () => window.removeEventListener("keydown", onWindowEscape, true);
  }, [isOpen, onDismiss, textareaRef, triggerStart]);
}

export function useMentionInput(
  textareaRef: RefObject<HTMLTextAreaElement | null>,
  value: MentionValue,
  users: UserBrief[],
  documents: DocumentRef[],
  onChange: (next: MentionValue) => void,
) {
  const pendingCaretRef = useRef<number | null>(null);
  const [focused, setFocused] = useState(false);
  const [caret, setCaret] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [dismissedStart, setDismissedStart] = useState<number | null>(null);

  const trigger = useMemo(
    () => (focused ? detectMentionTrigger(value.text, caret) : null),
    [caret, focused, value.text],
  );
  const options = useMemo(
    () => (trigger ? buildMentionOptions(users, documents, trigger.query) : []),
    [documents, trigger, users],
  );
  const safeIndex = options.length > 0 ? Math.min(activeIndex, options.length - 1) : 0;
  const isOpen =
    trigger !== null && options.length > 0 && dismissedStart !== trigger.start;

  useWindowMentionEscape(
    isOpen,
    trigger?.start ?? null,
    textareaRef,
    setDismissedStart,
  );

  useLayoutEffect(() => {
    const pos = pendingCaretRef.current;
    if (pos === null || !textareaRef.current) return;
    pendingCaretRef.current = null;
    textareaRef.current.focus();
    textareaRef.current.setSelectionRange(pos, pos);
  }, [textareaRef, value.text]);

  const pickOption = (option: MentionOption) => {
    if (!trigger) return;
    const { nextValue, nextCaret } = applyPickedMention(value, trigger, option);
    pendingCaretRef.current = nextCaret;
    setCaret(nextCaret);
    setDismissedStart(null);
    setActiveIndex(0);
    onChange(nextValue);
  };

  return {
    isOpen,
    options,
    safeIndex,
    pickOption,
    onFocus: (pos: number) => {
      setFocused(true);
      setCaret(pos);
    },
    onBlur: () => setFocused(false),
    onCaretMove: (pos: number) => setCaret(pos),
    onTextChange: (text: string, pos: number) => {
      setFocused(true);
      setCaret(pos);
      setActiveIndex(0);
      setDismissedStart(null);
      onChange({ ...value, text });
    },
    onMove: (delta: number) =>
      setActiveIndex((prev) => (prev + delta + options.length) % options.length),
    onDismiss: () => {
      if (trigger) setDismissedStart(trigger.start);
    },
  };
}
