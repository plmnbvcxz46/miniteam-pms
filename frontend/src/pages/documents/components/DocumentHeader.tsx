import type { DocumentItem } from "../../../shared/types/documents";
import SearchDropdown from "../../../shared/components/SearchDropdown";
import { getDocStatus } from "../utils";

interface DocumentHeaderProps {
  /** 文档列表数据源 */
  docs: DocumentItem[];
  /** 今天，yyyy-MM-dd */
  today: string;
  /** 搜索关键词 */
  searchKeyword: string;
  /** 搜索关键词变更回调 */
  onSearchChange: (keyword: string) => void;
  /** 当前关键字匹配到的文档，作为下拉建议 */
  matches: DocumentItem[];
  /** 在建议里选中一份文档 */
  onPickDoc: (doc: DocumentItem) => void;
  /** 点击上传文档回调 */
  onUploadClick?: () => void;
}

export default function DocumentHeader({
  docs,
  today,
  searchKeyword,
  onSearchChange,
  matches,
  onPickDoc,
  onUploadClick,
}: DocumentHeaderProps) {
  const revisingCount = docs.filter((d) => !d.final).length;
  const finalCount = docs.filter((d) => !!d.final).length;
  const lateCount = docs.filter((d) => getDocStatus(d, today).isLate).length;

  const kickerText = `修订中 ${revisingCount} 份 · 定稿 ${finalCount} 份 · ${
    lateCount > 0 ? `${lateCount} 份逾期` : "没有逾期"
  }`;

  return (
    <div className="vh">
      <div className="vl">
        <div className="k" id="dc-kicker">
          {kickerText}
        </div>
        <h1 className="vt t-page-title">
          项目<em>文档</em>
        </h1>
      </div>

      <div className="va toolbar">
        <SearchDropdown
          variant="box"
          boxLabel="筛选"
          inputId="dq"
          items={matches}
          getKey={(d) => d.id}
          onPick={onPickDoc}
          value={searchKeyword}
          onChange={onSearchChange}
          placeholder="搜索..."
          headWord="FILES"
          emptyText="没有匹配的文档"
          align="right"
          minWidth={360}
          itemClassName={() => "sd-row"}
          renderItem={(d) => (
            <>
              <span className="sd-nm">{d.n}</span>
              <span className="sd-end">
                {d.v} · {d.final ? "定稿" : "修订中"}
              </span>
            </>
          )}
        />
        {onUploadClick && (
          <button
            className="btn primary go"
            type="button"
            onClick={onUploadClick}
          >
            + 上传文档
          </button>
        )}
      </div>
    </div>
  );
}

