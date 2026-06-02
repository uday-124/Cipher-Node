import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import PageLoader from "./components/PageLoader";

import { Toaster, toast } from "react-hot-toast";

function App() {
  const { checkAuth, isCheckingAuth, authUser, socket } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!socket) return;

    const handleEmergency = (data) => {
      const { senderName, location } = data;
      const mapsLink = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
      
      toast.error(
        <div>
          <p className="font-bold text-lg text-red-600">EMERGENCY ALERT</p>
          <p>{senderName} needs help!</p>
          <a href={mapsLink} target="_blank" rel="noreferrer" className="text-blue-600 underline text-sm mt-1 inline-block">View Location</a>
        </div>,
        { duration: 15000, position: "top-center" }
      );
    };

    socket.on("emergency_notification", handleEmergency);
    return () => socket.off("emergency_notification", handleEmergency);
  }, [socket]);

  if (isCheckingAuth) return <PageLoader />;

  return (
    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
      {/* DECORATORS - GRID BG & GLOW  SHAPES*/}
      <div className="absolute inset-0 bg-[linear-gradient(to-right,#4f4f4f2e_1px, transparent_1px), linear-gradient(to_bottom,#4f4f4f2e_1px, transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-pink-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-cyan-500 opacity-20 blur-[100px]" />

      <Routes>
        <Route path="/" element={authUser ? <ChatPage /> : <Navigate to={"/login"} />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
      </Routes>

      <Toaster />
    </div>
  );
}
export default App;
