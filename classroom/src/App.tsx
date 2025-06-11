import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import TitleUpdater from "@/components/TitleUpdater";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Auth Pages
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Unauthorized from "@/pages/auth/Unauthorized";

// Lazy-loaded pages
const Dashboard = lazy(() => import("@/pages/dashboard/Dashboard"));
const ClassList = lazy(() => import("@/pages/classes/ClassList"));
const ClassDetails = lazy(() => import("@/pages/classes/ClassDetails"));
const CreateClass = lazy(() => import("@/pages/classes/CreateClass"));
const AssignmentList = lazy(() => import("@/pages/assignments/AssignmentList"));
const AssignmentDetails = lazy(
  () => import("@/pages/assignments/AssignmentDetails")
);
const CreateAssignment = lazy(
  () => import("@/pages/assignments/CreateAssignment")
);
const Profile = lazy(() => import("@/pages/profile/Profile"));
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <TitleUpdater />

            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 5000,
                style: {
                  background: "#1f2937",
                  color: "#f9fafb",
                },
              }}
            />

            <Suspense
              fallback={
                <div className="flex justify-center items-center h-screen">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              }
            >
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/login" replace />} />

                {/* Auth Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />

                    {/* Classes */}
                    <Route path="/classes" element={<ClassList />} />
                    <Route path="/classes/:id" element={<ClassDetails />} />
                    <Route path="/classes/create" element={<CreateClass />} />

                    {/* Assignments */}
                    <Route path="/assignments" element={<AssignmentList />} />
                    <Route
                      path="/assignments/:id"
                      element={<AssignmentDetails />}
                    />
                    <Route
                      path="/classes/:classId/assignments/create"
                      element={<CreateAssignment />}
                    />
                  </Route>
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                  <Route element={<MainLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                  </Route>
                </Route>

                {/* Catch all */}
                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
