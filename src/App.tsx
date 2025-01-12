import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import routes from "tempo-routes";
import Login from "./components/auth/login";
import CampaignForm from "./components/campaign-form";
import Dashboard from "./components/dashboard";
import CampaignProgress from "./components/campaign-progress";
import Sidebar from "./components/sidebar";
import ProtectedRoute from "./components/auth/protected-route";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-background">
                <Sidebar />
                <main className="lg:pl-72">
                  <Routes>
                    <Route path="/" element={<CampaignForm />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/progress" element={<CampaignProgress />} />
                  </Routes>
                  {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
                </main>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
