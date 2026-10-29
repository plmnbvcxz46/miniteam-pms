import { docs } from "../../../data/documents";
import { getDocStatus } from "../utils";

export default function DocumentHeader() {
  const revisingCount = docs.filter((d) => !d.final).length;
  const finalCount = docs.filter((d) => !!d.final).length;
  const lateCount = docs.filter((d) => getDocStatus(d).isLate).length;

  const kickerText = `修订中 ${revisingCount} 份 · 定稿 ${finalCount} 份 · ${
    lateCount > 0 ? `${lateCount} 份逾期` : "没有逾期"
  }`;

  return (
    <div className="vh">
      <div className="vl">
        <div className="k" id="dc-kicker">
          {kickerText}
        </div>
        <h1 className="vt">
          项目<em>文档</em>
        </h1>
      </div>

      <div className="va toolbar">
        <label className="field" htmlFor="dq">
          筛选
          <input id="dq" type="search" placeholder="输入搜索..." />
        </label>
        <button className="btn primary go" type="button">
          + 上传文档
        </button>
      </div>
    </div>
  );
}
