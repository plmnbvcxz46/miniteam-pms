import { useState } from "react";
import { configs } from "../../../data/settings";
import Switch from "../components/Switch";

const initialValues = Object.fromEntries(configs.map((c) => [c.key, c.value]));
const weightConfigs = configs.filter((c) => c.key.startsWith("priority.weight."));
const numberKeys = [
  "account.lock_threshold",
  "account.session_minutes",
  "layout.headline_max",
];

export default function ParamsPanel() {
  const [values, setValues] = useState(initialValues);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const set = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setMessage("");
    setError("");
  };
  const weightSum = weightConfigs.reduce(
    (sum, c) => sum + (Number(values[c.key]) || 0),
    0,
  );

  // PUT /configs/{key}：逐项校验后保存
  const handleSave = () => {
    const badNumber = numberKeys.find((key) => {
      const n = Number(values[key]);
      return !Number.isInteger(n) || n <= 0;
    });
    if (badNumber) {
      const name = configs.find((c) => c.key === badNumber)!.name;
      setError(`${name}要填大于 0 的整数`);
      return;
    }
    if (Math.abs(weightSum - 1) > 0.001) {
      setError(`四个优先级权重之和须为 1，现在是 ${weightSum.toFixed(2)}`);
      return;
    }
    if (resettingPassword && newPassword.length < 6) {
      setError("新用户默认密码至少 6 位");
      return;
    }
    setResettingPassword(false);
    setNewPassword("");
    setMessage("已保存");
  };

  return (
    <section className="ss" id="ss-params">
      <h2 className="ss-h">系统参数</h2>
      <div className="blk">
        <h2>账号安全</h2>
        <div className="rows">
          <div className="srow">
            <span className="lb">新用户默认密码</span>
            <div className="inl">
              {resettingPassword ? (
                <input
                  className="in sm"
                  type="password"
                  autoFocus
                  aria-label="新的默认密码"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setError("");
                  }}
                />
              ) : (
                <code>••••••••</code>
              )}
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setResettingPassword((v) => !v);
                  setNewPassword("");
                }}
              >
                {resettingPassword ? "取消" : "重新设置"}
              </button>
            </div>
          </div>
          <div className="srow">
            <span className="lb">允许自助注册</span>
            <div>
              <Switch
                label="允许自助注册"
                value={values["account.allow_register"] === "true"}
                onChange={(on) => set("account.allow_register", String(on))}
              />
            </div>
          </div>
          <NumberRow
            id="s-lock"
            label="登录失败锁定"
            unit="次"
            value={values["account.lock_threshold"]}
            onChange={(v) => set("account.lock_threshold", v)}
          />
          <NumberRow
            id="s-sess"
            label="会话超时"
            unit="分钟"
            value={values["account.session_minutes"]}
            onChange={(v) => set("account.session_minutes", v)}
          />
        </div>
      </div>
      <div className="blk">
        <h2>版面</h2>
        <div className="rows">
          <NumberRow
            id="s-hl"
            label="头条字数上限"
            unit="字"
            value={values["layout.headline_max"]}
            onChange={(v) => set("layout.headline_max", v)}
          />
        </div>
      </div>
      <div className="blk">
        <h2>优先级权重</h2>
        <div className="rows">
          {weightConfigs.map((config) => (
            <NumberRow
              key={config.key}
              id={`s-${config.key}`}
              label={config.name.replace("权重", "")}
              unit=""
              value={values[config.key]}
              onChange={(v) => set(config.key, v)}
            />
          ))}
          <div className="srow">
            <span className="lb">合计</span>
            <div className="inl">
              <span className={Math.abs(weightSum - 1) > 0.001 ? "bad" : undefined}>
                {weightSum.toFixed(2)}
              </span>
              <span>须为 1</span>
            </div>
          </div>
        </div>
      </div>
      <div className="acts">
        <button className="btn primary" type="button" onClick={handleSave}>
          保存
        </button>
        {message && <span className="msg">{message}</span>}
        {error && <span className="msg err">{error}</span>}
      </div>
    </section>
  );
}

interface NumberRowProps {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
}

function NumberRow({ id, label, unit, value, onChange }: NumberRowProps) {
  return (
    <div className="srow">
      <label htmlFor={id}>{label}</label>
      <div className="inl">
        <input
          className="in xs"
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        {unit && <span>{unit}</span>}
      </div>
    </div>
  );
}
