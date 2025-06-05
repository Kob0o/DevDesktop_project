import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const [autoLaunch, setAutoLaunch] = useState(false);
  const [autoLaunchLoading, setAutoLaunchLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    if (window.electron && window.electron.getAutoLaunchEnabled) {
      window.electron.getAutoLaunchEnabled().then((enabled) => {
        if (mounted) {
          setAutoLaunch(!!enabled);
          setAutoLaunchLoading(false);
        }
      });
    } else {
      setAutoLaunchLoading(false);
    }
    return () => { mounted = false; };
  }, []);

  const handleToggleAutoLaunch = async () => {
    setAutoLaunchLoading(true);
    try {
      if (window.electron && window.electron.setAutoLaunchEnabled) {
        const newState = await window.electron.setAutoLaunchEnabled(!autoLaunch);
        setAutoLaunch(!!newState);
      }
    } catch (e) {
      toast.error("Erreur lors du changement d'auto launch");
    } finally {
      setAutoLaunchLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (isSignUp) {
        // Inscription
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin
          }
        });

        if (error) throw error;
        
        if (data?.user?.identities?.length === 0) {
          toast.error('Cet email est déjà utilisé');
          return;
        }

        toast.success('Inscription réussie ! Vérifiez votre email pour confirmer votre compte.');
      } else {
        // Connexion
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message === 'Invalid login credentials') {
            toast.error('Email ou mot de passe incorrect');
          } else if (error.message.includes('Email not confirmed')) {
            toast.error('Veuillez confirmer votre email avant de vous connecter');
          } else {
            toast.error(error.message);
          }
          return;
        }

        if (data?.user) {
          toast.success('Connexion réussie !');
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error(error.message || `Erreur lors de l'${isSignUp ? 'inscription' : 'authentification'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            ScoutMaster
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isSignUp ? 'Créez votre compte' : 'Connectez-vous à votre compte'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                isSignUp ? 'S\'inscrire' : 'Se connecter'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              {isSignUp ? 'Déjà un compte ? Connectez-vous' : 'Pas de compte ? Inscrivez-vous'}
            </button>
          </div>
        </form>
        <div className="mt-6 flex items-center justify-center">
          <button
            type="button"
            onClick={handleToggleAutoLaunch}
            disabled={autoLaunchLoading}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border ${autoLaunch ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-green-700 dark:bg-gray-700 dark:text-white`}
          >
            {autoLaunchLoading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-600"></span>
            ) : (
              <>
                {autoLaunch ? 'Désactiver le lancement automatique' : 'Activer le lancement automatique'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login; 