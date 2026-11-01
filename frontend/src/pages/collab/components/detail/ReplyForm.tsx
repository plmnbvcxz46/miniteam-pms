import { useEffect, useRef, useState } from "react";

interface ReplyFormProps {
  onSend: (content: string) => void;
  autoFocusTrigger?: number | string | null;
}

export default function ReplyForm({
  onSend,
  autoFocusTrigger,
}: ReplyFormProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (
      autoFocusTrigger !== undefined &&
      autoFocusTrigger !== null &&
      typeof autoFocusTrigger === "number" &&
      autoFocusTrigger < 0
    ) {
      textareaRef.current?.focus();
    }
  }, [autoFocusTrigger]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form className="reply" id="reply" onSubmit={handleSubmit}>
      <label className="sr" htmlFor="reply-text">
        回复
      </label>
      <textarea
        ref={textareaRef}
        id="reply-text"
        rows={2}
        placeholder="写回复，@ 可提及成员"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className="btn primary" type="submit">
        发送
      </button>
    </form>
  );
}
