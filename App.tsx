import React from 'react';
import { HashRouter, Routes, Route, Outlet, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ToastProvider } from './context/ToastContext';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import Media from './pages/public/Media';
import Booking from './pages/public/Booking';
import Contact from './pages/public/Contact';
import Blog from './pages/public/Blog';
import Events from './pages/public/Events';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Inquiries from './pages/admin/Inquiries';
import CalendarManager from './pages/admin/CalendarManager';
import MediaManager from './pages/admin/MediaManager';
import CMS from './pages/admin/CMS';
import Subscribers from './pages/admin/Subscribers';
import BlogManager from './pages/admin/BlogManager';
import SocialManager from './pages/admin/SocialManager';
import Integrations from './pages/admin/Integrations';
import Settings from './pages/admin/Settings';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const PublicLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen font-sans text-stone-900">
    <Navbar />
    <main className="flex-grow">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const App: React.FC = () => {
  return (
    <ToastProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          {/* Public Routes - Root Path starts here */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="blog" element={<Blog />} />
            <Route path="media" element={<Media />} />
            <Route path="booking" element={<Booking />} />
            <Route path="contact" element={<Contact />} />
            <Route path="events" element={<Events />} />
          </Route>

          {/* Redirect /home to / */}
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="inquiries" element={<Inquiries />} />
            <Route path="calendar" element={<CalendarManager />} />
            <Route path="media" element={<MediaManager />} />
            <Route path="blog-manager" element={<BlogManager />} />
            <Route path="social" element={<SocialManager />} />
            <Route path="integrations" element={<Integrations />} />
            <Route path="settings" element={<Settings />} />
            <Route path="cms" element={<CMS />} />
            <Route path="subscribers" element={<Subscribers />} />
          </Route>

          {/* Catch-all: Redirect any unknown routes to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </ToastProvider>
  );
};

export default App;