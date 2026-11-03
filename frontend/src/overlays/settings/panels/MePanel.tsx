import { useState, type FormEvent } from "react";
import { currentUser } from "../../../data/global";
import Switch from "../components/Switch";

export default function MePanel() {
  const [realName, setRealName] = useState(currentUser.realName);
  const [calm, setCalm] = useState(() => document.body.classList.contains("calm"));
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState("");

  // 减少动态效果：全站关掉动画和过渡
  const changeCalm = (on: boolean) => {
    setCalm(on);
    document.body.classList.toggle("calm", on);
  };

  return (
    <section className="ss" id="ss-me">
      <div className="blk">
        <h2>身份</h2>
        <div className="rows">
          <div className="srow">
            <label htmlFor="s-name">姓名</label>
            <div>
              <input
                className="in"
                id="s-name"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
              />
            </div>
          </div>
          <div className="srow">
            <span className="lb">账号</span>
            <div>
              <code>{currentUser.username}</code>
            </div>
          </div>
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
