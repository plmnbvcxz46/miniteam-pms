import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import styles from "./Settings.module.css";

interface SkillTagsProps {
  inputId: string;
  tags: string[];
  input: string;
  error: string;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (tag: string) => void;
}

/** 技能标签：已有标签点一下移除，下面输入后回车或点“添加” */
export function SkillTags({
  inputId,
  tags,
  input,
  error,
  onInputChange,
  onAdd,
  onRemove,
}: SkillTagsProps) {
  return (
    <div className={styles.stack}>
      {tags.length > 0 && (
        <div className={styles.chips}>
          {tags.map((tag) => (
            <Button
              key={tag}
              size="sm"
              variant="primary"
              aria-label={`移除 ${tag}`}
              onClick={() => onRemove(tag)}
            >
              {tag} ×
            </Button>
          ))}
        </div>
      )}
      <div className={styles.inline}>
        <Input
          id={inputId}
          size="sm"
          className={styles.narrowInput}
          placeholder="输入后回车"
          aria-label="新技能标签"
          invalid={Boolean(error)}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
        />
        <Button size="sm" onClick={onAdd}>
          添加
        </Button>
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  );
}
