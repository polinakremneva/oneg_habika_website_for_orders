import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";
import { LoginPage } from "./pages/LoginPage";
import { OrdersPage } from "./pages/OrdersPage";
import { authService } from "./services/auth.service";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" />;
  }

  return children;
}

function AuthRoute({ children }: { children: JSX.Element }) {
  const isAuthenticated = authService.isAuthenticated();

  if (isAuthenticated) {
    return <Navigate to="/orders" />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/orders" replace />} />

      <Route path="/" element={<MainLayout />}>
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="/auth" element={<AuthLayout />}>
        <Route
          path="login"
          element={
            <AuthRoute>
              <LoginPage />
            </AuthRoute>
          }
        />
      </Route>

      <Route path="*" element={<h1>404 - Page Not Found</h1>} />
    </Routes>
  );
}

export default App;
