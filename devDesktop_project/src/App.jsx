import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import OAuthHandler from './components/OAuthHandler';

// Composants
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import PlayerDetail from './components/PlayerDetail';
import Navbar from './components/Navbar';
import TeamPage from './components/TeamPage';
import TeamForm from './components/TeamForm';

// Configuration Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <OAuthHandler />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Toaster position="top-right" />
        {session && <Navbar />}
        <Routes>
          <Route
            path="/"
            element={session ? <Navigate to="/dashboard" /> : <Login />}
          />
          <Route
            path="/dashboard"
            element={session ? <Dashboard /> : <Navigate to="/" />}
          />
          <Route
            path="/player/:id"
            element={session ? <PlayerDetail /> : <Navigate to="/" />}
          />
          <Route
            path="/team"
            element={session ? <TeamPage /> : <Navigate to="/" />}
          />
          <Route
            path="/team/create"
            element={session ? <TeamForm /> : <Navigate to="/" />}
          />
          <Route
            path="/team/edit/:teamId"
            element={session ? <TeamForm /> : <Navigate to="/" />}
          />
          <Route
            path="/auth/callback"
            element={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500">zgeg</div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
