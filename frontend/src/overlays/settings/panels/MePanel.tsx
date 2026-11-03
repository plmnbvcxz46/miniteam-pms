import { useState, type FormEvent } from "react";
import { useMe } from "../../../auth/useAuth";
import type { ProfileUpdate } from "../../../types/settings";
import Switch from "../components/Switch";

interface MePanelProps {
  profile: ProfileUpdate;
  /** PUT /auth/me */
  onSave: (values: ProfileUpdate) => void;
}

export default function MePanel({ profile, onSave }: MePanelProps) {
  const currentUser = useMe().user;
  const [realName, setRealName] = useState(profile.realName);
  const [email, setEmail] = useState(profile.email);
  const [skillTags, setSkillTags] = useState(profile.skillTags);
  const [tagInput, setTagInput] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [saved, setSaved] = useState(false);
  const [calm, setCalm] = useState(() => document.body.classList.contains("calm"));
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");

  const dirty =
    realName !== profile.realName ||
    email !== profile.email ||
    skillTags.join("\n") !== profile.skillTags.join("\n");

  const touch = () => setSaved(false);

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !skillTags.includes(tag)) {
      setSkillTags([...skillTags, tag]);
      touch();
    }
    setTagInput("");
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    const name = realName.trim();
    const mail = email.trim();
    const nameMsg = name ? "" : "姓名不能为空";
    const emailMsg =
      mail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail) ? "邮箱格式不对" : "";
    setNameError(nameMsg);
    setEmailError(emailMsg);
    if (nameMsg || emailMsg) return;
    onSave({ realName: name, email: mail, skillTags });
    setRealName(name);
    setEmail(mail);
    setSaved(true);
  };

  // 减少动态效果：全站关掉动画和过渡
  const changeCalm = (on: boolean) => {
    setCalm(on);
    document.body.classList.toggle("calm", on);
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
                  onChange={(e) => setTagInput(e.target.value)}
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
              </div>
            </div>
          </div>
        </div>
        <div className="acts" style={{ marginTop: 10 }}>
          <button className="btn primary" type="submit" disabled={!dirty}>
            保存资料
          </button>
          {saved && <span className="msg">已保存</span>}
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
      <div className="blk">
        <h2>偏好</h2>
        <div className="rows">
          <div className="srow">
            <span className="lb">减少动态效果</span>
            <div>
              <Switch label="减少动态效果" value={calm} onChange={changeCalm} />
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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!oldPassword) setError("填写旧密码");
    else if (newPassword.length < 6) setError("新密码至少 6 位");
    else if (newPassword !== confirm) setError("两次输入的新密码不一致");
    else onDone();
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
