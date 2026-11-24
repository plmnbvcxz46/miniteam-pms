import { PageHeader } from "../../../components/patterns/PageHeader";
import {
  SearchDropdown,
  SearchDropdownRow,
} from "../../../components/patterns/SearchDropdown";
import { Button } from "../../../components/ui/Button";
import type { BoundDocument } from "../../../shared/types/documents";
import styles from "./DocumentHeader.module.css";

interface DocumentHeaderProps {
  revisingCount: number;
  finalCount: number;
  overdueCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filteredDocs: BoundDocument[];
  selectedId: number | null;
  onPickDoc: (id: number) => void;
  canEditDoc: boolean;
  onUploadClick: () => void;
}

export default function DocumentHeader({
  revisingCount,
  finalCount,
  overdueCount,
  searchQuery,
  onSearchChange,
  filteredDocs,
  selectedId,
  onPickDoc,
  canEditDoc,
  onUploadClick,
}: DocumentHeaderProps) {
  const overduePart = overdueCount > 0 ? ` · ${overdueCount} 份逾期` : "";
  const kicker = `修订中 ${revisingCount} 份 · 定稿 ${finalCount} 份${overduePart}`;

  return (
    <PageHeader
      kicker={kicker}
      title="项目"
      accentTitle="文档"
      actions={
        <div className={styles.actions}>
          <div className={styles.searchWrap}>
            <SearchDropdown
              variant="box"
              boxLabel="筛选"
              placeholder="搜索..."
              ariaLabel="筛选文档"
              headWord="DOCS"
              count={filteredDocs.length}
              items={filteredDocs}
              getKey={(doc) => doc.id}
              isSelected={(doc) => doc.id === selectedId}
              onPick={(doc) => onPickDoc(doc.id)}
              value={searchQuery}
              onChange={onSearchChange}
              emptyText="没有匹配的文档"
              align="right"
              minWidth={320}
              renderItem={(doc) => (
                <SearchDropdownRow
                  name={doc.n}
                  sub={doc.taskTitle}
                  end={doc.v}
                />
              )}
            />
          </div>
          {canEditDoc && (
            <Button variant="accent" onClick={onUploadClick}>
              + 上传文档
            </Button>
          )}
        </div>
      }
    />
  );
}
