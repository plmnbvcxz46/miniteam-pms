import { useState } from "react";
import type { MentionValue } from "../../../../types/collab";
import type { DocumentRef, UserBrief } from "../../../../types/global";
import { finalizeMention } from "../../utils";
import MentionInput from "../input/MentionInput";

const EMPTY_VALUE: MentionValue = { text: "", mentions: [], documents: [] };

interface ReplyFormProps {
  /** 可以 @ 的成员 */
  users: UserBrief[];
  /** 可以 @ 的文档：讨论所属任务下的文档 */
  documents: DocumentRef[];
  /** 草稿对话预先放进输入框的内容 */
  initialValue?: MentionValue | null;
  onSend: (value: MentionValue) => void;
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

  const submit = () => {
    const final = finalizeMention(value);
    if (!final.text) return;
    onSend(final);
    setValue(EMPTY_VALUE);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submit();
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
        onSubmitShortcut={submit}
        placeholder={
          documents.length > 0
            ? "写回复，@ 可提及成员和任务下的文件"
            : "写回复，@ 可提及成员"
        }
      />
      <button className="btn primary" type="submit">
        发送
      </button>
    </form>
  );
}
