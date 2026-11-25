import { useState, type FormEvent } from "react";
import { Alert } from "../../../components/ui/Alert";
import { Button } from "../../../components/ui/Button";
import type { MentionValue } from "../../../shared/types/collab";
import type { DocumentRef, UserBrief } from "../../../shared/types/global";
import { finalizeMention } from "../utils/format";
import { MentionInput } from "./MentionInput";
import styles from "./ReplyForm.module.css";

interface ReplyFormProps {
  mentionUsers: UserBrief[];
  taskDocuments: DocumentRef[];
  placeholder?: string;
  initialValue?: MentionValue | null;
  onSend: (value: MentionValue) => Promise<void>;
}

const EMPTY_VALUE: MentionValue = { text: "", mentions: [], documents: [] };

export function ReplyForm({
  mentionUsers,
  taskDocuments,
  placeholder = "写回复，@ 可提及成员和任务下的文件",
  initialValue,
  onSend,
}: ReplyFormProps) {
  const [value, setValue] = useState<MentionValue>(initialValue ?? EMPTY_VALUE);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submitValue = async () => {
    if (sending) return;
    const final = finalizeMention(value);
    if (!final.text) return;
    setSending(true);
    setError("");
    try {
      await onSend(final);
      setValue(EMPTY_VALUE);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发送失败，请稍后再试");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submitValue();
  };

  return (
    <form className={styles.wrap} onSubmit={handleSubmit}>
      <div className={styles.row}>
        <MentionInput
          variant="boxed"
          value={value}
          users={mentionUsers}
          documents={taskDocuments}
          rows={1}
          placeholder={placeholder}
          disabled={sending}
          invalid={Boolean(error)}
          className={styles.mentionWrap}
          textareaClassName={styles.replyTextarea}
          onChange={(next) => {
            setValue(next);
            if (error) setError("");
          }}
          onSubmitShortcut={() => {
            void submitValue();
          }}
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={sending}
          className={styles.sendBtn}
        >
          发送
        </Button>
      </div>
      {error && (
        <Alert variant="inline" tone="danger">
          {error}
        </Alert>
      )}
    </form>
  );
}
