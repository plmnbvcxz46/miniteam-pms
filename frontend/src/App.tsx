import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import Shell from "./layouts/Shell";
import OverviewPage from "./pages/overview/OverviewPage";
import BoardPage from "./pages/board/BoardPage";
import TaskProvider from "./pages/board/TaskProvider";
import DocumentProvider from "./pages/documents/DocumentProvider";
import ReportsPage from "./pages/reports/ReportsPage";
import DocumentsPage from "./pages/documents/DocumentsPage";
import MembersPage from "./pages/members/MembersPage";
import TimelinePage from "./pages/timeline/TimelinePage";
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
      { path: "timeline", element: <TimelinePage /> },
      { path: "reports", element: <ReportsPage /> },
      { path: "collab", element: <CollabPage /> },
      { path: "documents", element: <DocumentsPage /> },
      { path: "members", element: <MembersPage /> },
    ],
  },
]);

export default function App() {
  return (
    <DocumentProvider>
      <TaskProvider>
        <RouterProvider router={router} />
      </TaskProvider>
    </DocumentProvider>
  );
}
