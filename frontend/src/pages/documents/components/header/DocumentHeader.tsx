import type { DocumentItem } from "../../../../types/documents";
import { getDocStatus } from "../../utils";

interface DocumentHeaderProps {
  /** 文档列表数据源 */
  docs: DocumentItem[];
  /** 搜索关键词 */
  searchKeyword: string;
  /** 搜索关键词变更回调 */
  onSearchChange: (keyword: string) => void;
  /** 点击上传文档回调 */
  onUploadClick?: () => void;
}

export default function DocumentHeader({
  docs,
  searchKeyword,
  onSearchChange,
  onUploadClick,
}: DocumentHeaderProps) {
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
          <input
            id="dq"
            type="search"
            placeholder="搜索..."
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </label>
        <button
          className="btn primary go"
          type="button"
          onClick={onUploadClick}
        >
          + 上传文档
        </button>
      </div>
    </div>
  );
}

