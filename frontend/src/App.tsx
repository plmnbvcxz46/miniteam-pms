import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import Shell from "./layouts/Shell";
import OverviewPage from "./pages/overview/OverviewPage";
import BoardPage from "./pages/board/BoardPage";
import ReportsPage from "./pages/reports/ReportsPage";
import DocumentsPage from "./pages/documents/DocumentsPage";
import MembersPage from "./pages/members/MembersPage";
import ProgressPage from "./pages/progress/ProgressPage";
import CollabPage from "./pages/collab/CollabPage";
import TaskPage from "./pages/board/task/TaskPage";

const router = createHashRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: "overview", element: <OverviewPage /> },
      { path: "board", element: <BoardPage /> },
      { path: "board/task", element: <TaskPage /> },
      { path: "progress", element: <ProgressPage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "collab", element: <CollabPage /> },
      { path: "documents", element: <DocumentsPage /> },
      { path: "members", element: <MembersPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
