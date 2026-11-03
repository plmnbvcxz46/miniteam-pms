import { useState, type FormEvent } from "react";
import { authApi } from "../../../api/auth";
import { useMe } from "../../../auth/useAuth";
import type { ProfileUpdate } from "../../../types/settings";

/** 技能标签：每个最长 12 个字，最多 10 个 */
const MAX_TAG_LENGTH = 12;
const MAX_TAGS = 10;

interface MePanelProps {
  profile: ProfileUpdate;
  /** PUT /auth/me，失败时抛 ApiError */
  onSave: (values: ProfileUpdate) => Promise<void>;
}

export default function MePanel({ profile, onSave }: MePanelProps) {
  const currentUser = useMe().user;
  const [realName, setRealName] = useState(profile.realName);
  const [email, setEmail] = useState(profile.email);
  const [skillTags, setSkillTags] = useState(profile.skillTags);
  const [tagInput, setTagInput] = useState("");
  const [tagError, setTagError] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");

  const dirty =
    realName !== profile.realName ||
    email !== profile.email ||
    skillTags.join("\n") !== profile.skillTags.join("\n");

  const touch = () => setSaved(false);

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) {
      setTagInput("");
      return;
    }
    if (tag.length > MAX_TAG_LENGTH) {
      setTagError(`标签最长 ${MAX_TAG_LENGTH} 个字`);
      return;
    }
    if (skillTags.length >= MAX_TAGS) {
      setTagError(`最多 ${MAX_TAGS} 个标签`);
      return;
    }
    // React 和 react 算同一个标签
    if (!skillTags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
      setSkillTags([...skillTags, tag]);
      touch();
    }
    setTagError("");
    setTagInput("");
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    const name = realName.trim();
    const mail = email.trim();
    const nameMsg = !name ? "姓名不能为空" : name.length > 32 ? "姓名最长 32 个字" : "";
    const emailMsg =
      mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ? "邮箱格式不对" : "";
    setNameError(nameMsg);
    setEmailError(emailMsg);
    setSaveError("");
    if (nameMsg || emailMsg) return;
    try {
      await onSave({ realName: name, email: mail, skillTags });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存失败");
      return;
    }
    setRealName(name);
    setEmail(mail);
    setSaved(true);
  };

  return (
    <section className="ss" id="ss-me">
      <form className="blk" noValidate onSubmit={handleSave}>
        <h2>身份</h2>
        <div className="rows">
          <div className="srow">
            <label htmlFor="s-name">姓名</label>
            <div className="inl">
              <input
                className="in"
                id="s-name"
                value={realName}
                onChange={(e) => {
                  setRealName(e.target.value);
                  setNameError("");
                  touch();
                }}
              />
              {nameError && <span className="msg err">{nameError}</span>}
            </div>
          </div>
          <div className="srow">
            <span className="lb">账号</span>
            <div>
              <code>{currentUser.username}</code>
            </div>
          </div>
          <div className="srow">
            <label htmlFor="s-mail">邮箱</label>
            <div className="inl">
              <input
                className="in"
                id="s-mail"
                type="email"
                placeholder="可不填"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                  touch();
                }}
              />
              {emailError && <span className="msg err">{emailError}</span>}
            </div>
          </div>
          <div className="srow top">
            <span className="lb">技能标签</span>
            <div>
              <div className="roles">
                {skillTags.map((tag) => (
                  <label key={tag}>
                    <button
                      className="perm"
                      type="button"
                      aria-pressed="true"
                      aria-label={`移除 ${tag}`}
                      onClick={() => {
                        setSkillTags(skillTags.filter((t) => t !== tag));
                        touch();
                      }}
                    />
                    {tag} ×
                  </label>
                ))}
              </div>
              <div className="inl" style={{ marginTop: 6 }}>
                <input
                  className="in sm"
                  aria-label="新技能标签"
                  placeholder="输入后回车"
                  value={tagInput}
                  onChange={(e) => {
                    setTagInput(e.target.value);
                    setTagError("");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button className="btn" type="button" onClick={addTag}>
                  添加
                </button>
                {tagError && <span className="msg err">{tagError}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="acts" style={{ marginTop: 10 }}>
          <button className="btn primary" type="submit" disabled={!dirty}>
            保存资料
          </button>
          {saved && <span className="msg">已保存</span>}
          {saveError && <span className="msg err">{saveError}</span>}
        </div>
      </form>
      <div className="blk">
        <h2>安全</h2>
        <div className="rows">
          <div className="srow top">
            <span className="lb">密码</span>
            <div>
              {changingPassword ? (
                <PasswordForm
                  onCancel={() => setChangingPassword(false)}
                  onDone={() => {
                    setChangingPassword(false);
                    setMessage("密码已修改");
                  }}
                />
              ) : (
                <div className="inl">
                  <button
                    className="btn"
                    type="button"
                    onClick={() => {
                      setChangingPassword(true);
                      setMessage("");
                    }}
                  >
                    修改密码
                  </button>
                  {message && <span className="msg">{message}</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** PUT /auth/password：旧密码、新密码、确认 */
function PasswordForm({
  onCancel,
  onDone,
}: {
  onCancel: () => void;
  onDone: () => void;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!oldPassword) return setError("填写旧密码");
    if (newPassword.length < 6) return setError("新密码至少 6 位");
    if (newPassword.length > 64) return setError("新密码最长 64 位");
    if (newPassword !== confirm) return setError("两次输入的新密码不一致");
    try {
      await authApi.changePassword({ oldPassword, newPassword });
    } catch (error) {
      return setError(error instanceof Error ? error.message : "修改失败");
    }
    onDone();
  };

  return (
    <form noValidate onSubmit={handleSubmit}>
      <div className="inl">
        <input
          className="in sm"
          type="password"
          autoFocus
          placeholder="旧密码"
          aria-label="旧密码"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
        <input
          className="in sm"
          type="password"
          placeholder="新密码"
          aria-label="新密码"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          className="in sm"
          type="password"
          placeholder="再输一次"
          aria-label="确认新密码"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </div>
      <div className="inl" style={{ marginTop: 8 }}>
        <button className="btn primary" type="submit">
          确认修改
        </button>
        <button className="btn" type="button" onClick={onCancel}>
          取消
        </button>
        {error && <span className="msg err">{error}</span>}
      </div>
    </form>
  );
}
