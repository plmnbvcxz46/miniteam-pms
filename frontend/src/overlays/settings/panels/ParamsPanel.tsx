import { useState } from "react";
import { useConfigs } from "../../../state/config/useConfigs";

/** 系统参数：读取中、读取失败时只显示提示，读到了才显示表单 */
export default function ParamsPanel() {
  const { status, error } = useConfigs();
  if (status !== "ready") {
    return (
      <section className="ss" id="ss-params">
        <p className={status === "error" ? "msg err" : "msg"}>
          {status === "error" ? error : "加载中…"}
        </p>
      </section>
    );
  }
  return <ParamsForm />;
}

function ParamsForm() {
  const { items, values: saved, save } = useConfigs();
  const [values, setValues] = useState(saved);
  // 参数名称和备注取自接口
  const weightConfigs = items.filter((c) => c.key.startsWith("priority.weight."));
  const nameOf = (key: string) => items.find((c) => c.key === key)?.name ?? key;
  const valueOf = (key: string) => values[key] ?? "";
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
  const handleSave = async () => {
    const badWeight = weightConfigs.find((c) => {
      const n = Number(valueOf(c.key));
      return valueOf(c.key).trim() === "" || Number.isNaN(n) || n < 0 || n > 1;
    });
    if (badWeight) {
      setError(`${badWeight.remark}权重要填 0 到 1 之间的数`);
      return;
    }
    if (Math.abs(weightSum - 1) > 0.001) {
      setError(`四个优先级权重之和须为 1，现在是 ${weightSum.toFixed(2)}`);
      return;
    }
    const alpha = Number(valueOf("priority.alpha"));
    if (valueOf("priority.alpha").trim() === "" || Number.isNaN(alpha) || alpha < 0) {
      setError("关键路径加权系数要填不小于 0 的数");
      return;
    }
    const badInteger = ["priority.top_n", "member.weekly_capacity"].find((key) => {
      const n = Number(valueOf(key));
      return !Number.isInteger(n) || n <= 0;
    });
    if (badInteger) {
      setError(`${nameOf(badInteger)}要填大于 0 的整数`);
      return;
    }
    try {
      await save(values);
      setMessage("已保存");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  return (
    <section className="ss" id="ss-params">
      <div className="blk">
        <h2>优先级权重</h2>
        <div className="rows">
          {weightConfigs.map((config) => (
            <NumberRow
              key={config.key}
              id={`s-${config.key}`}
              label={config.remark ?? config.name}
              unit=""
              value={valueOf(config.key)}
              onChange={(v) => set(config.key, v)}
            />
          ))}
          <div className="srow">
            <span className="lb t-label">合计</span>
            <div className="inl">
              <span className={Math.abs(weightSum - 1) > 0.001 ? "bad" : undefined}>
                {weightSum.toFixed(2)}
              </span>
              <span>(1)</span>
            </div>
          </div>
          <NumberRow
            id="s-alpha"
            label="关键路径加权系数"
            unit="α"
            value={valueOf("priority.alpha")}
            onChange={(v) => set("priority.alpha", v)}
          />
        </div>
      </div>
      <div className="blk">
        <h2>默认值</h2>
        <div className="rows">
          <NumberRow
            id="s-topn"
            label="今日待办条数"
            unit="条"
            value={valueOf("priority.top_n")}
            onChange={(v) => set("priority.top_n", v)}
          />
          <NumberRow
            id="s-cap"
            label="每周工时上限"
            unit="小时"
            value={valueOf("member.weekly_capacity")}
            onChange={(v) => set("member.weekly_capacity", v)}
          />
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
      <label className="t-label" htmlFor={id}>{label}</label>
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
