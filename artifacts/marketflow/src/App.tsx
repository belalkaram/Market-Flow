import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "next-themes";
import { GlobalErrorBoundary, ErrorBoundary } from "@/components/ErrorBoundary";
import { useEffect } from "react";

import SplashPage from "@/pages/SplashPage";
import LoginPage from "@/pages/LoginPage";
import RegisterStorePage from "@/pages/RegisterStorePage";
import BranchSelectionPage from "@/pages/BranchSelectionPage";
import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";
import POSPage from "@/pages/POSPage";
import ProductsPage from "@/pages/ProductsPage";
import AddProductPage from "@/pages/AddProductPage";
import CategoriesPage from "@/pages/CategoriesPage";
import InventoryPage from "@/pages/InventoryPage";
import StockMovementsPage from "@/pages/StockMovementsPage";
import PurchasesPage from "@/pages/PurchasesPage";
import SuppliersPage from "@/pages/SuppliersPage";
import SupplierDetailPage from "@/pages/SupplierDetailPage";
import SalesPage from "@/pages/SalesPage";
import ReturnsPage from "@/pages/ReturnsPage";
import CustomersPage from "@/pages/CustomersPage";
import ExpensesPage from "@/pages/ExpensesPage";
import AccountingPage from "@/pages/AccountingPage";
import ReportsPage from "@/pages/ReportsPage";
import EmployeesPage from "@/pages/EmployeesPage";
import RolesPage from "@/pages/RolesPage";
import BranchesPage from "@/pages/BranchesPage";
import NotificationsPage from "@/pages/NotificationsPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfilePage from "@/pages/ProfilePage";
import ActivityLogsPage from "@/pages/ActivityLogsPage";
import TasksPage from "@/pages/TasksPage";
import TrialExpiredPage from "@/pages/TrialExpiredPage";
import StoreSuspendedPage from "@/pages/StoreSuspendedPage";
import UnauthorizedPage from "@/pages/UnauthorizedPage";
import NotFound from "@/pages/not-found";
import CustomerOrdersPage from "@/pages/CustomerOrdersPage";
import OrderSettingsPage from "@/pages/OrderSettingsPage";

import SuperAdminLoginPage from "@/pages/superadmin/SuperAdminLoginPage";
import SuperAdminDashboardPage from "@/pages/superadmin/SuperAdminDashboardPage";
import SuperAdminStoresPage from "@/pages/superadmin/SuperAdminStoresPage";
import SuperAdminPlansPage from "@/pages/superadmin/SuperAdminPlansPage";
import SuperAdminAdminsPage from "@/pages/superadmin/SuperAdminAdminsPage";
import SuperAdminActivityLogsPage from "@/pages/superadmin/SuperAdminActivityLogsPage";
import SuperAdminSystemHealthPage from "@/pages/superadmin/SuperAdminSystemHealthPage";
import SuperAdminSupportPage from "@/pages/superadmin/SuperAdminSupportPage";
import SuperAdminSecurityPage from "@/pages/superadmin/SuperAdminSecurityPage";
import SupportPage from "@/pages/SupportPage";
import PublicStorePage from "@/pages/PublicStorePage";
import { SessionTimeoutGuard } from "@/components/SessionTimeoutModal";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30000,
    },
  },
});

import { canAccessRoute } from "@/config/roles";

function ProtectedRoute({ path, component: Component }: { path: string; component: React.ComponentType }) {
  const { currentUser, isLoading } = useAuth();
  const [, navigate] = useLocation();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) return null;
        if (!currentUser) {
          navigate('/login');
          return null;
        }
        const role = currentUser.roleSlug || currentUser.role;
        if (!canAccessRoute(role, path)) {
          navigate('/unauthorized');
          return null;
        }
        return (
          <ErrorBoundary>
            <Component />
          </ErrorBoundary>
        );
      }}
    </Route>
  );
}

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location]);
  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={SplashPage} />
      <Route path="/splash" component={SplashPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterStorePage} />
      <Route path="/register-store" component={RegisterStorePage} />
      <Route path="/branch-selection" component={BranchSelectionPage} />
      <Route path="/unauthorized" component={UnauthorizedPage} />
      <Route path="/trial-expired" component={TrialExpiredPage} />
      <Route path="/store-suspended" component={StoreSuspendedPage} />

      {/* Public Store — End User Order Page (no auth required) */}
      <Route path="/store/:slug" component={PublicStorePage} />

      {/* Super Admin Routes */}
      <Route path="/super-admin/login" component={SuperAdminLoginPage} />
      <Route path="/super-admin/dashboard" component={SuperAdminDashboardPage} />
      <Route path="/super-admin/stores" component={SuperAdminStoresPage} />
      <Route path="/super-admin/plans" component={SuperAdminPlansPage} />
      <Route path="/super-admin/admins" component={SuperAdminAdminsPage} />
      <Route path="/super-admin/activity-logs" component={SuperAdminActivityLogsPage} />
      <Route path="/super-admin/system-health" component={SuperAdminSystemHealthPage} />
      <Route path="/super-admin/support" component={SuperAdminSupportPage} />
      <Route path="/super-admin/security" component={SuperAdminSecurityPage} />

      {/* Store ERP Routes */}
      <ProtectedRoute path="/home" component={HomePage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/pos" component={POSPage} />
      <ProtectedRoute path="/products" component={ProductsPage} />
      <ProtectedRoute path="/products/add" component={AddProductPage} />
      <ProtectedRoute path="/categories" component={CategoriesPage} />
      <ProtectedRoute path="/inventory" component={InventoryPage} />
      <ProtectedRoute path="/stock-movements" component={StockMovementsPage} />
      <ProtectedRoute path="/purchases" component={PurchasesPage} />
      <ProtectedRoute path="/suppliers" component={SuppliersPage} />
      <ProtectedRoute path="/suppliers/:id" component={SupplierDetailPage} />
      <ProtectedRoute path="/sales" component={SalesPage} />
      <ProtectedRoute path="/returns" component={ReturnsPage} />
      <ProtectedRoute path="/customers" component={CustomersPage} />
      <ProtectedRoute path="/expenses" component={ExpensesPage} />
      <ProtectedRoute path="/accounting" component={AccountingPage} />
      <ProtectedRoute path="/reports" component={ReportsPage} />
      <ProtectedRoute path="/employees" component={EmployeesPage} />
      <ProtectedRoute path="/roles" component={RolesPage} />
      <ProtectedRoute path="/branches" component={BranchesPage} />
      <ProtectedRoute path="/tasks" component={TasksPage} />
      <ProtectedRoute path="/notifications" component={NotificationsPage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/activity-logs" component={ActivityLogsPage} />
      <ProtectedRoute path="/support" component={SupportPage} />
      <ProtectedRoute path="/customer-orders" component={CustomerOrdersPage} />
      <ProtectedRoute path="/order-settings" component={OrderSettingsPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <GlobalErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <ScrollToTop />
                <Router />
              </WouterRouter>
              <SessionTimeoutGuard />
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </GlobalErrorBoundary>
  );
}

export default App;
