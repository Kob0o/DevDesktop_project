import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function Navbar() {
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier le thème système
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
      toast.success('Déconnexion réussie');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
      console.error('Erreur de déconnexion:', error.message);
    }
  };

  return (
    <nav className="bg-white dark:bg-dark-bg shadow-lg border-b border-gray-200 dark:border-football-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="flex items-center text-2xl font-extrabold text-gray-900 dark:text-white tracking-wide drop-shadow-md"
            >
              ScoutMaster
            </Link>
            <div className="ml-10 flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="text-gray-700 dark:text-gray-200 hover:text-football-green dark:hover:text-football-yellow px-3 py-2 rounded-full text-base font-semibold transition-colors"
              >
                Joueurs
              </Link>
              <Link
                to="/team"
                className="text-gray-700 dark:text-gray-200 hover:text-football-green dark:hover:text-football-yellow px-3 py-2 rounded-full text-base font-semibold transition-colors"
              >
                Équipe
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full border border-football-green text-football-green hover:bg-football-green hover:text-white transition-colors"
            >
              {darkMode ? (
                <SunIcon className="h-6 w-6" />
              ) : (
                <MoonIcon className="h-6 w-6" />
              )}
            </button>

            <button
              onClick={handleLogout}
              className="football-btn"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 