import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { TradePage } from "./pages/TradePage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { MyAccountPage } from "./pages/MyAccountPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "trade", Component: TradePage },
      { path: "projects", Component: ProjectsPage },
      { path: "account", Component: MyAccountPage },
    ],
  },
]);
