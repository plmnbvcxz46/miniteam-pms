import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import Shell from "./layouts/Shell";
import OverviewPage from "./pages/overview/OverviewPage";
import ReportsPage from "./pages/reports/ReportsPage";

const router = createHashRouter([
  {
    path: "/",
    element: <Shell />,
    children: [
      { index: true, element: <Navigate to="/overview" replace /> },
      { path: "overview", element: <OverviewPage /> },
      { path: "reports", element: <ReportsPage /> }
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
