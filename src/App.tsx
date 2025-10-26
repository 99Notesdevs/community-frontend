import { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";
import Homepage from "./pages/Homepage";
import TrendingPage from "./pages/TrendingPage";
import ExplorePage from "./pages/ExplorePage";
import NotFound from "./pages/NotFound";
import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { SocketProvider } from './contexts/SocketContext';
import AuthModal from './components/UserModal';
import CommunitiesPage from './pages/CommunitiesPage';
import MessagesPage from './pages/MessagesPage';
import CommunityPage from './pages/CommunityPage';
import UserPage from './pages/UserPage';
import CommentsPage from './pages/CommentsPage';
import UserProfile from './pages/UserProfile';

const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <SocketProvider>
              <div className="min-h-screen bg-background">
                <Navbar 
                  onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  isSidebarOpen={isSidebarOpen}
                />
                <AuthModal />
                <Sidebar 
                  isOpen={isSidebarOpen} 
                  onClose={() => setIsSidebarOpen(false)}
                />
                <main className="md:ml-64 pt-16 min-h-screen">
                  <Routes>
                    <Route path="/" element={<Homepage />} />
                    <Route path="/trending" element={<TrendingPage />} />
                    <Route path="/explore" element={<ExplorePage />} />
                    <Route path="/communities" element={<CommunitiesPage />} />
                    <Route path="/r/:id" element={<CommunityPage />} />
                    <Route path="/u/:id" element={<UserPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/post/:postId" element={<CommentsPage />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </SocketProvider>
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
