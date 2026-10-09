import { NotificationManager } from './components/NotificationManager';
import { Pomodoro } from './pages/Pomodoro';
import { Goals } from './pages/Goals';
import { Settings } from './pages/Settings';
import { Notes } from './pages/Notes';
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/auth';
import { useTheme } from './store/theme';
import { SakuraParticles } from './components/SakuraParticles';
import { CookieBanner } from './components/CookieBanner';
import { InstallPWA } from './components/InstallPWA';
import { CoinGift } from './components/CoinGift';
import { SearchModal } from './components/SearchModal';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Tasks } from './pages/Tasks';
import { Calendar } from './pages/Calendar';
import { Habits } from './pages/Habits';
import { Achievements } from './pages/Achievements';
import { Music } from './pages/Music';
import { Recipes } from './pages/Recipes';
import { Mascot } from './pages/Mascot';
import { Shop } from './pages/Shop';
import { Guide } from './pages/Guide';
import { Stats } from './pages/Stats';
import { CategoryDetail } from './pages/CategoryDetail';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { Cookies } from './pages/Cookies';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-pulse">🌸</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth();

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-pulse">🌸</div>
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

export default function App() {
  const fetchMe = useAuth((s) => s.fetchMe);
  const initTheme = useTheme((s) => s.initTheme);

  useEffect(() => {
    initTheme();
    fetchMe();
  }, [fetchMe, initTheme]);

  return (
    <>
      {/* 🌸 Globales (fuera de Routes) */}
      <SakuraParticles />
      <CookieBanner />
      <InstallPWA />
      <CoinGift />
      <SearchModal />    
       <NotificationManager /> 

      {/* 🗺️ Rutas */}
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookies" element={<Cookies />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/music" element={<Music />} />
          <Route path="/recipes" element={<Recipes />} />
          <Route path="/mascot" element={<Mascot />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/stats" element={<Stats />} />
                         <Route path="/pomodoro" element={<Pomodoro />} />
                     <Route path="/goals" element={<Goals />} />
                      <Route path="/notes" element={<Notes />} />
                    <Route path="/settings" element={<Settings />} />
          <Route path="/category/:slug" element={<CategoryDetail />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
