import { useState } from "react";
import type { MentionValue } from "../../../shared/types/collab";
import type { DocumentRef, UserBrief } from "../../../shared/types/global";
import { finalizeMention } from "../utils";
import MentionInput from "./MentionInput";

const EMPTY_VALUE: MentionValue = { text: "", mentions: [], documents: [] };

interface ReplyFormProps {
  /** 可以 @ 的成员 */
  users: UserBrief[];
  /** 可以 @ 的文档：讨论所属任务下的文档 */
  documents: DocumentRef[];
  /** 草稿对话预先放进输入框的内容 */
  initialValue?: MentionValue | null;
  /** 发送；失败时抛错，message 显示在输入框下面，输入的内容保留 */
  onSend: (value: MentionValue) => Promise<void>;
  autoFocusTrigger?: number | string | null;
}

export default function ReplyForm({
  users,
  documents,
  initialValue,
  onSend,
  autoFocusTrigger,
}: ReplyFormProps) {
  const [value, setValue] = useState<MentionValue>(initialValue ?? EMPTY_VALUE);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    const final = finalizeMention(value);
    if (!final.text || sending) return;
    setSending(true);
    setError("");
    try {
      await onSend(final);
      setValue(EMPTY_VALUE);
    } catch (e) {
      setError(e instanceof Error ? e.message : "发送失败，请稍后再试");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void submit();
  };

  return (
    <form className="reply" id="reply" onSubmit={handleSubmit}>
      <label className="sr" htmlFor="reply-text">
        回复
      </label>
      <MentionInput
        id="reply-text"
        focusOnMount={
          typeof autoFocusTrigger === "number" && autoFocusTrigger < 0
        }
        value={value}
        onChange={setValue}
        users={users}
        documents={documents}
        onSubmitShortcut={() => void submit()}
        placeholder={
          documents.length > 0
            ? "写回复，@ 可提及成员和任务下的文件"
            : "写回复，@ 可提及成员"
        }
      />
      <button className="btn primary" type="submit" disabled={sending}>
        {sending ? "发送中…" : "发送"}
      </button>
      {error && (
        <div className="err t-error" role="alert">
          {error}
        </div>
      )}
    </form>
  );
}
