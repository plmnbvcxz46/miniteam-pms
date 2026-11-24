import { useState } from "react";
import { useToast } from "../../../components/patterns/ToastHost";
import type {
  BoundDocument,
  DocumentVersionItem,
} from "../../../shared/types/documents";
import { useDocumentStore } from "../../../state/document/documentStore";
import { useTaskStore } from "../../../state/task/taskStore";

export interface UploadSubmitPayload {
  targetDocId: number | null;
  file: File;
  name: string;
  taskId: number | null;
  changeNote: string;
}

export function useDocumentActions({
  canEditDoc,
  selectedDoc,
  setPickedId,
}: {
  canEditDoc: boolean;
  selectedDoc: BoundDocument | null;
  setPickedId: (id: number) => void;
}) {
  const toast = useToast();
  const { createDocument, addVersion, finalizeDocument, downloadVersion } =
    useDocumentStore();
  const { reload: reloadTasks } = useTaskStore();
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [actionError, setActionError] = useState("");

  const handleUploadSubmit = async (payload: UploadSubmitPayload) => {
    if (payload.targetDocId === null) {
      const createdId = await createDocument({
        file: payload.file,
        name: payload.name,
        taskId: payload.taskId,
        changeNote: payload.changeNote,
      });
      setPickedId(createdId);
      toast("新文档已上传");
    } else {
      await addVersion(payload.targetDocId, {
        file: payload.file,
        changeNote: payload.changeNote,
      });
      setPickedId(payload.targetDocId);
      toast("新版本已上传");
    }
    await reloadTasks();
  };

  const handleFinalizeClick = () => {
    if (!selectedDoc || selectedDoc.final || !canEditDoc) return;
    setActionError("");
    setConfirmFinalizeOpen(true);
  };

  const handleConfirmFinalize = async () => {
    if (!selectedDoc || selectedDoc.final || !canEditDoc) return;
    setFinalizing(true);
    setActionError("");
    try {
      await finalizeDocument(selectedDoc.id);
      await reloadTasks();
      setConfirmFinalizeOpen(false);
      toast("文档已定稿");
    } catch (err) {
      setConfirmFinalizeOpen(false);
      setActionError(err instanceof Error ? err.message : "定稿失败，请稍后重试");
    } finally {
      setFinalizing(false);
    }
  };

  const handleDownload = async (ver: DocumentVersionItem) => {
    setActionError("");
    try {
      await downloadVersion(ver.id, ver.fileName);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "下载失败，请稍后重试");
    }
  };

  return {
    confirmFinalizeOpen,
    setConfirmFinalizeOpen,
    finalizing,
    actionError,
    setActionError,
    handleUploadSubmit,
    handleFinalizeClick,
    handleConfirmFinalize,
    handleDownload,
  };
}
