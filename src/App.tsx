import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import PropertyDetails from "./pages/PropertyDetails";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import BuyerDashboard from "./pages/dashboard/BuyerDashboard";
import SellerDashboard from "./pages/dashboard/SellerDashboard";
import PostProperty from "./pages/dashboard/PostProperty";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AboutUs from "./pages/AboutUs";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "search", element: <Search /> },
      { path: "property/:id", element: <PropertyDetails /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      { path: "about", element: <AboutUs /> },
      { path: "privacy-policy", element: <PrivacyPolicy /> },

      // Protected Routes
      {
        element: <ProtectedRoute allowedRoles={["buyer", "seller", "admin"]} />,
        children: [
          { path: "dashboard", element: <BuyerDashboard /> },
          {
            path: "settings",
            element: (
              <div className="p-10 text-center text-muted-foreground">
                Settings page coming soon.
              </div>
            ),
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["seller", "admin"]} />,
        children: [
          { path: "seller/dashboard", element: <SellerDashboard /> },
          { path: "post-property", element: <PostProperty /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["admin"]} />,
        children: [{ path: "admin", element: <AdminDashboard /> }],
      },

      {
        path: "*",
        element: (
          <div className="flex items-center justify-center min-h-[60vh] text-xl text-muted-foreground">
            404 — Page Not Found
          </div>
        ),
      },
    ],
  },
]);

const App = () => {
  return (
    <HelmetProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
