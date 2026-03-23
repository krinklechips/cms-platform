import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { TenantDetails } from "./pages/TenantDetails";
import { TenantDirectory } from "./pages/TenantDirectory";
import { Operations } from "./pages/Operations";
import { Integrations } from "./pages/Integrations";
import { CreateTenant } from "./pages/CreateTenant";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: MainLayout,
    children: [
      { index: true, Component: TenantDirectory },
      { path: "operations", Component: Operations },
      { path: "tenants", Component: TenantDirectory },
      { path: "tenants/create", Component: CreateTenant },
      { path: "tenants/:tenantId", Component: TenantDetails },
      { path: "integrations", Component: Integrations },
    ],
  },
]);
