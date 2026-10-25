
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Home from "./Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AlertMessage from "./components/auth/AlertMessage";

function LoginRoute() {
  const location = useLocation();
  const registrationSuccess = Boolean(location.state?.registrationSuccess);

  return (
    <>
      {registrationSuccess && (
        <div className="mx-auto w-full max-w-[460px] px-3 pt-5 sm:px-4 sm:pt-6">
          <AlertMessage
            type="success"
            message="Your account was created successfully. Please sign in."
          />
        </div>
      )}

      <Login />
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
