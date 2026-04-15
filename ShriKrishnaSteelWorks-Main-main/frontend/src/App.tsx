// src/App.tsx
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ChatBot from "./components/ChatBot";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import About from "./pages/About";
import Products from "./pages/Products";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import Auth from "./pages/Auth";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Analytics from "./pages/Analytics";
import AiMl from "./pages/AiMl";
import { useEffect } from "react";

// Scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

const Cart = () => (
  <div style={{ paddingTop: "6rem", color: "white", textAlign: "center", minHeight: "60vh" }}>
    Cart — Coming Soon
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Public routes */}
          <Route path="/"         element={<Home />} />
          <Route path="/home"     element={<Home />} />
          <Route path="/about"    element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact"  element={<Contact />} />
          <Route path="/cart"     element={<Cart />} />
          <Route path="/login"    element={<Auth />} />
          <Route path="/signup"   element={<Auth />} />

          {/* Authenticated user routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />

          {/* Admin-only routes */}
          <Route path="/projects" element={
            <ProtectedRoute requireAdmin>
              <Projects />
            </ProtectedRoute>
          } />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute requireAdmin>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute requireAdmin>
              <Analytics />
            </ProtectedRoute>
          } />
          <Route path="/admin/ai-ml" element={
            <ProtectedRoute requireAdmin>
              <AiMl />
            </ProtectedRoute>
          } />
        </Routes>
        <Footer />
        <ChatBot />
      </AuthProvider>
    </Router>
  );
}

export default App;