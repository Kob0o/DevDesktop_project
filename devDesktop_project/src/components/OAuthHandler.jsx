import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function OAuthHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.electron && window.electron.onOAuthCallback) {
      window.electron.onOAuthCallback(async (url) => {
        console.log('OAuth callback reçu dans renderer:', url);
        const params = url.split('?')[1] || '';
        const searchParams = new URLSearchParams(params);
        const code = searchParams.get('code');
        console.log('Code extrait du callback:', code);
        if (code) {
          try {
            const { data, error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) throw error;
            if (window.toast) window.toast.success('Connexion réussie !');
            navigate('/dashboard', { replace: true });
          } catch (err) {
            console.error('Erreur lors de exchangeCodeForSession:', err);
            if (window.toast) window.toast.error('Erreur lors de la connexion');
          }
        } else {
          console.error('Aucun code trouvé dans le callback OAuth');
        }
      });
    }
  }, [navigate]);

  return null;
} 