import { ConfirmDialog } from "../../../components/patterns/ConfirmDialog";
import { PageState } from "../../../components/patterns/PageState";
import { useDocumentsPage } from "../hooks/useDocumentsPage";
import DocumentDetail from "./DocumentDetail";
import DocumentFinal from "./DocumentFinal";
import DocumentHeader from "./DocumentHeader";
import DocumentRevising from "./DocumentRevising";
import styles from "./DocumentsPage.module.css";
import UploadDocDrawer from "./UploadDocDrawer";

function DocumentsOverlays({ page }: { page: ReturnType<typeof useDocumentsPage> }) {
  return (
    <>
      <ConfirmDialog
        open={page.confirmFinalizeOpen}
        onOpenChange={(next) => {
          if (!page.finalizing) page.setConfirmFinalizeOpen(next);
        }}
        title="确认将文档定稿？"
        description={
          page.selectedDoc
            ? `定稿后「${page.selectedDoc.n}」将转为最终定稿版本，不可再上传新版本。`
            : ""
        }
        confirmLabel="确认定稿"
        loading={page.finalizing}
        onConfirm={() => void page.handleConfirmFinalize()}
      />

      {page.canEditDoc && (
        <UploadDocDrawer
          key={page.drawerSeq}
          isOpen={page.isDrawerOpen}
          onClose={page.closeUploadDrawer}
          initialTargetDocId={page.drawerTargetDocId}
          defaultTaskId={page.uploadTaskId}
          revisingDocs={page.allRevisingDocs}
          tasks={page.taskList}
          onSubmit={page.handleUploadSubmit}
        />
      )}
    </>
  );
}

export function DocumentsPage() {
  const page = useDocumentsPage();

  if (page.missing) {
    return (
      <PageState
        status="missing"
        description="这一期没有存档，看不到当时的文档。"
      />
    );
  }
  if (page.error) {
    return (
      <PageState
        status="error"
        description={page.error}
        onRetry={page.reload}
      />
    );
  }
  if (!page.ready) {
    return <PageState status="loading" description="正在加载项目文档…" />;
  }

  const isFiltered = page.searchKeyword.trim().length > 0;

  return (
    <section className={styles.page}>
      <DocumentHeader
        revisingCount={page.allRevisingCount}
        finalCount={page.allFinalCount}
        overdueCount={page.overdueCount}
        searchQuery={page.searchKeyword}
        onSearchChange={page.setSearchKeyword}
        filteredDocs={page.filteredDocs}
        selectedId={page.selectedId}
        onPickDoc={page.handleSelectDoc}
        canEditDoc={page.canEditDoc}
        onUploadClick={() => page.openUploadDrawer(null)}
      />

      <div className={styles.split}>
        <div className={styles.side}>
          <DocumentRevising
            docs={page.revisingDocs}
            selectedId={page.selectedId}
            today={page.today}
            isFiltered={isFiltered}
            onSelect={page.handleSelectDoc}
          />
          <DocumentFinal
            docs={page.finalDocs}
            selectedId={page.selectedId}
            isFiltered={isFiltered}
            onSelect={page.handleSelectDoc}
          />
        </div>

        <DocumentDetail
          doc={page.selectedDoc}
          today={page.today}
          actionError={page.actionError || undefined}
          onTaskClick={page.handleNavigateTask}
          onUploadVersion={
            page.canEditDoc && page.selectedDoc && !page.selectedDoc.final
              ? () => page.openUploadDrawer(page.selectedDoc!.id)
              : undefined
          }
          onFinalize={
            page.canEditDoc && page.selectedDoc && !page.selectedDoc.final
              ? page.handleFinalizeClick
              : undefined
          }
          onDownloadVersion={(ver) => void page.handleDownload(ver)}
        />
      </div>

      <DocumentsOverlays page={page} />
    </section>
  );
}
