import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import AccessProvider from "./access/AccessProvider";
import AuthProvider from "./auth/AuthProvider";
import { useAuth } from "./auth/useAuth";
import ConfigProvider from "./config/ConfigProvider";
import IssueProvider from "./issue/IssueProvider";
import LoginPage from "./pages/login/LoginPage";
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

/** 没登录只显示登录页，登录后才挂上各页面的数据 */
function AuthGate() {
  const { me, loading } = useAuth();
  // 正在用 token 恢复登录：先别闪一下登录页
  if (loading) return null;
  if (!me) return <LoginPage />;
  return (
    <IssueProvider>
      <AccessProvider>
        <DocumentProvider>
          <TaskProvider>
            <RouterProvider router={router} />
          </TaskProvider>
        </DocumentProvider>
      </AccessProvider>
    </IssueProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <AuthGate />
      </ConfigProvider>
    </AuthProvider>
  );
}
