import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "../components/layout/Layout";
import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/Login";
import Register from "../pages/Register";

import Dashboard from "../pages/Dashboard";
import Products from "../pages/Products";
import Inventory from "../pages/Inventory";
import Scanner from "../pages/Scanner";
import Forecast from "../pages/Forecast";
import Orders from "../pages/Orders";
import Suppliers from "../pages/Suppliers";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings";
import Users from "../pages/Users";
import Distributors from "../pages/Distributors";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute roles={[ "employee","manager","admin","superadmin",]}>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/products"
          element={
            <ProtectedRoute roles={[ "employee","manager","admin","superadmin",]}>
              <Layout>
                <Products />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/inventory"
          element={
            <ProtectedRoute roles={[ "employee","manager","admin","superadmin",]}>
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/scanner"
          element={
            <ProtectedRoute roles={[ "employee","manager","admin","superadmin",]}>
              <Layout>
                <Scanner />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/forecast"
          element={
            <ProtectedRoute roles={[ "employee","manager","admin","superadmin",]}>
              <Layout>
                <Forecast />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute roles={["manager","admin","superadmin",]}>
              <Layout>
                <Orders />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/suppliers"
          element={
            <ProtectedRoute roles={["manager","admin","superadmin",]}>
              <Layout>
                <Suppliers />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/distributors"
          element={
            <ProtectedRoute roles={["manager","admin","superadmin",]}>
              <Layout>
                <Distributors />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute roles={["manager","admin","superadmin",]}>
              <Layout>
                <Reports />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute  roles={["superadmin",]}>
              <Layout>
                <Settings />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute
              roles={[
                "admin",
                "superadmin",
              ]}
            >
              <Layout>
                <Users />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;