import { useState, type FormEvent } from "react";
import Drawer from "../../../../components/Drawer";
import type {
  DiscussionFormValues,
  MentionValue,
} from "../../../../types/collab";
import type { UserBrief } from "../../../../types/global";
import type { TaskDetail } from "../../../../types/task";
import { finalizeMention, getTaskDocumentRefs } from "../../utils";
import MentionInput from "../input/MentionInput";

interface NewDiscussionDrawerProps {
  tasks: Record<number, TaskDetail>;
  /** 一开始关联的任务 */
  initialTaskId: number | null;
  /** 从任务页发起时锁定任务，不让改 */
  lockTask: boolean;
  /** 可以 @ 的成员 */
  users: UserBrief[];
  onClose: () => void;
  onSubmit: (values: DiscussionFormValues) => void;
}

export default function NewDiscussionDrawer({
  tasks,
  initialTaskId,
  lockTask,
  users,
  onClose,
  onSubmit,
}: NewDiscussionDrawerProps) {
  const [title, setTitle] = useState("");
  const [taskId, setTaskId] = useState<number | null>(initialTaskId);
  const [content, setContent] = useState<MentionValue>({
    text: "",
    mentions: [],
    documents: [],
  });
  const [titleError, setTitleError] = useState("");
  const [contentError, setContentError] = useState("");
  const [notice, setNotice] = useState("");

  const taskOptions = Object.values(tasks)
    .filter((task) => task.status !== "DONE" || task.id === taskId)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const documents = getTaskDocumentRefs(taskId, tasks);

  // 换了任务：把不属于新任务的文件提及从内容里去掉
  const handleChangeTask = (nextId: number | null) => {
    setTaskId(nextId);
    const kept = getTaskDocumentRefs(nextId, tasks);
    const removed = content.documents.filter(
      (doc) => !kept.some((item) => item.id === doc.id),
    );
    if (removed.length === 0) {
      setNotice("");
      return;
    }
    const text = removed.reduce(
      (acc, doc) =>
        acc.split(`@${doc.name} `).join("").split(`@${doc.name}`).join(""),
      content.text,
    );
    setContent({
      ...content,
      text,
      documents: content.documents.filter((doc) =>
        kept.some((item) => item.id === doc.id),
      ),
    });
    setNotice(
      `已移除不属于新任务的文件：${removed.map((doc) => doc.name).join("、")}`,
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const final = finalizeMention(content);
    const trimmedTitle = title.trim();
    if (!trimmedTitle) setTitleError("填写标题后才能发起");
    if (!final.text) setContentError("填写第一条消息后才能发起");
    if (!trimmedTitle || !final.text) return;
    onSubmit({ title: trimmedTitle, taskId, content: final });
  };

  return (
    <Drawer className="ov fx" labelledBy="fx-title" onClose={onClose}>
      <div className="fx-head">
        <h2 className="fx-title" id="fx-title">
          发起讨论
        </h2>
        <button className="ov-close" type="button" onClick={onClose}>
          关闭<span aria-hidden="true">×</span>
        </button>
      </div>
      <div className="double">
        <i />
        <i />
      </div>
      <form
        id="discussion-form"
        className="fx-body"
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="fr">
          <span className="lb">
            标题<b>*</b>
          </span>
          <div>
            <input
              className="u"
              autoFocus
              value={title}
              placeholder="例如 菜单接口要不要分页"
              onChange={(e) => {
                setTitle(e.target.value);
                setTitleError("");
              }}
            />
          </div>
          {titleError && <div className="err">{titleError}</div>}
        </div>

        <div className="fr top">
          <span className="lb">关联任务</span>
          <div className="chips">
            {!lockTask && (
              <button
                type="button"
                aria-pressed={taskId === null}
                onClick={() => handleChangeTask(null)}
              >
                不关联任务
              </button>
            )}
            {taskOptions
              .filter((task) => !lockTask || task.id === taskId)
              .map((task) => (
                <button
                  key={task.id}
                  type="button"
                  aria-pressed={task.id === taskId}
                  disabled={lockTask}
                  onClick={() => handleChangeTask(task.id)}
                >
                  {task.title}
                </button>
              ))}
          </div>
          {lockTask && <div className="hint">从任务页发起，已关联这个任务</div>}
        </div>

        <div className="fr top">
          <span className="lb">
            第一条消息<b>*</b>
          </span>
          <div>
            <MentionInput
              className="u"
              rows={5}
              value={content}
              onChange={(value) => {
                setContent(value);
                setContentError("");
                setNotice("");
              }}
              users={users}
              documents={documents}
              onSubmitShortcut={() =>
                (
                  document.getElementById(
                    "discussion-form",
                  ) as HTMLFormElement | null
                )?.requestSubmit()
              }
              placeholder="说一下想讨论什么"
            />
          </div>
          <div className="hint">
            {notice ||
              (documents.length > 0
                ? "@ 可提及成员和这个任务下的文件"
                : "@ 可提及成员；关联任务后还能 @ 任务下的文件")}
          </div>
          {contentError && <div className="err">{contentError}</div>}
        </div>

        <div className="fx-acts">
          <button className="btn primary" type="submit">
            发起讨论
          </button>
          <button className="btn" type="button" onClick={onClose}>
            取消
          </button>
        </div>
      </form>
    </Drawer>
  );
}
