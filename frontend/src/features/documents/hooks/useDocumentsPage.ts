import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type {
  BoundDocument,
  DocumentItem,
} from "../../../shared/types/documents";
import { useAccess } from "../../../state/access/useAccess";
import { useDocumentStore } from "../../../state/document/documentStore";
import { useIssue } from "../../../state/issue/useIssue";
import { useTaskStore } from "../../../state/task/taskStore";
import { getDocStatus, withTaskTitle } from "../utils";
import { useDocumentActions } from "./useDocumentActions";

export type { UploadSubmitPayload } from "./useDocumentActions";

function filterDocuments(
  docs: BoundDocument[],
  keyword: string,
): BoundDocument[] {
  const q = keyword.trim().toLowerCase();
  if (!q) return docs;
  return docs.filter(
    (doc) =>
      doc.n.toLowerCase().includes(q) ||
      doc.taskTitle.toLowerCase().includes(q) ||
      doc.who.toLowerCase().includes(q),
  );
}

function resolveSelectedId(
  urlId: number | null,
  pickedId: number | null,
  filteredDocs: BoundDocument[],
  allDocs: BoundDocument[],
): number | null {
  if (urlId !== null && allDocs.some((d) => d.id === urlId)) return urlId;
  if (pickedId !== null && filteredDocs.some((d) => d.id === pickedId)) {
    return pickedId;
  }
  return filteredDocs[0]?.id ?? allDocs[0]?.id ?? null;
}

function deriveDocumentLists(
  docs: DocumentItem[],
  searchKeyword: string,
  today: string,
) {
  const allDocs = docs.map(withTaskTitle);
  const filteredDocs = filterDocuments(allDocs, searchKeyword);
  const revisingDocs = filteredDocs.filter((d) => !d.final);
  const finalDocs = filteredDocs.filter((d) => d.final);
  const allRevisingDocs = allDocs.filter((d) => !d.final);
  const overdueCount = allRevisingDocs.filter(
    (d) => getDocStatus(d, today).isLate,
  ).length;
  const allFinalCount = allDocs.filter((d) => d.final).length;

  return {
    allDocs,
    filteredDocs,
    revisingDocs,
    finalDocs,
    allRevisingDocs,
    overdueCount,
    allFinalCount,
  };
}

function useDocumentSelection(
  allDocs: BoundDocument[],
  filteredDocs: BoundDocument[],
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [pickedId, setPickedId] = useState<number | null>(null);
  const rawId = searchParams.get("id");
  const urlId = rawId && !Number.isNaN(Number(rawId)) ? Number(rawId) : null;
  const selectedId = resolveSelectedId(urlId, pickedId, filteredDocs, allDocs);
  const selectedDoc = useMemo(
    () => allDocs.find((d) => d.id === selectedId) ?? null,
    [allDocs, selectedId],
  );
  const clearUrlId = () => {
    if (searchParams.has("id")) setSearchParams({}, { replace: true });
  };
  return { selectedId, selectedDoc, setPickedId, clearUrlId };
}

function useUploadDrawerState(canEditDoc: boolean) {
  const navigate = useNavigate();
  const location = useLocation();
  const routeTaskId =
    (location.state as { uploadTaskId?: number } | null)?.uploadTaskId ?? null;
  const shouldAutoOpen = Boolean(routeTaskId && canEditDoc);

  const [uploadTaskId, setUploadTaskId] = useState<number | null>(() =>
    shouldAutoOpen ? routeTaskId : null,
  );
  const [drawerTargetDocId, setDrawerTargetDocId] = useState<number | null>(
    null,
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(shouldAutoOpen);
  const [drawerSeq, setDrawerSeq] = useState(0);

  // 消费一次路由 state 中的 uploadTaskId，防止刷新重复弹出
  useEffect(() => {
    if (!shouldAutoOpen) return;
    navigate(location.pathname + location.search, { replace: true, state: {} });
  }, [shouldAutoOpen, location.pathname, location.search, navigate]);

  const openDrawer = (targetDocId: number | null = null) => {
    setUploadTaskId(null);
    setDrawerTargetDocId(targetDocId);
    setDrawerSeq((n) => n + 1);
    setIsDrawerOpen(true);
  };

  const closeUploadDrawer = () => {
    setIsDrawerOpen(false);
    setUploadTaskId(null);
  };

  return {
    uploadTaskId,
    drawerTargetDocId,
    isDrawerOpen,
    drawerSeq,
    openDrawer,
    closeUploadDrawer,
  };
}

export function useDocumentsPage() {
  const navigate = useNavigate();
  const { today, isPast } = useIssue();
  const { permissions, isArchived } = useAccess();
  const { docs, ready, error, missing, reload } = useDocumentStore();
  const { taskMap } = useTaskStore();
  const canEditDoc = permissions.canEditDoc && !isPast && !isArchived;

  const [searchKeyword, setSearchKeyword] = useState("");
  const lists = useMemo(
    () => deriveDocumentLists(docs, searchKeyword, today),
    [docs, searchKeyword, today],
  );
  const selection = useDocumentSelection(lists.allDocs, lists.filteredDocs);
  const drawer = useUploadDrawerState(canEditDoc);
  const actions = useDocumentActions({
    canEditDoc,
    selectedDoc: selection.selectedDoc,
    setPickedId: selection.setPickedId,
  });
  const taskList = useMemo(
    () => Object.values(taskMap).sort((a, b) => a.taskNo - b.taskNo),
    [taskMap],
  );

  const handleSelectDoc = (id: number) => {
    selection.setPickedId(id);
    actions.setActionError("");
    selection.clearUrlId();
  };

  const openUploadDrawer = (targetDocId: number | null = null) => {
    if (!canEditDoc) return;
    actions.setActionError("");
    drawer.openDrawer(targetDocId);
  };

  return {
    today,
    canEditDoc,
    ready,
    error,
    missing,
    reload,
    allRevisingCount: lists.allRevisingDocs.length,
    allFinalCount: lists.allFinalCount,
    overdueCount: lists.overdueCount,
    filteredDocs: lists.filteredDocs,
    revisingDocs: lists.revisingDocs,
    finalDocs: lists.finalDocs,
    allRevisingDocs: lists.allRevisingDocs,
    searchKeyword,
    setSearchKeyword,
    selectedId: selection.selectedId,
    selectedDoc: selection.selectedDoc,
    taskList,
    ...drawer,
    ...actions,
    handleSelectDoc,
    openUploadDrawer,
    handleNavigateTask: (taskId: number) => navigate(`/tasks?open=${taskId}`),
  };
}
