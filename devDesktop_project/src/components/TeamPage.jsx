import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PlusIcon, PencilIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { exportTeamToPDF } from '../services/pdfService';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function TeamPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
    fetchPlayers();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des équipes');
      console.error('Erreur:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des joueurs');
      console.error('Erreur:', error.message);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) return;

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      toast.success('Équipe supprimée avec succès');
      fetchTeams();
    } catch (error) {
      toast.error('Erreur lors de la suppression de l\'équipe');
      console.error('Erreur:', error.message);
    }
  };

  const handleExportPDF = async (team) => {
    try {
      const teamPlayers = players.filter(p => p.team === team.name);
      await exportTeamToPDF(team, teamPlayers);
      toast.success('PDF exporté avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'export PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Mes Équipes
        </h1>
        <button
          onClick={() => navigate('/team/create')}
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Créer une équipe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {team.name}
              </h2>
              <div className="flex space-x-2">
                <Link
                  to={`/team/edit/${team.id}`}
                  className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                >
                  <PencilIcon className="h-5 w-5" />
                </Link>
                <button
                  onClick={() => handleDeleteTeam(team.id)}
                  className="p-2 text-red-600 hover:text-red-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="relative w-full aspect-[3/4] bg-green-600 rounded-lg overflow-hidden mb-4">
              {/* Lignes du terrain */}
              <div className="absolute inset-0 border-4 border-white opacity-50"></div>
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white opacity-50"></div>
              <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 border-2 border-white opacity-50 rounded-full"></div>

              {/* Aperçu des joueurs */}
              {Object.entries(team.formation).map(([position, player]) => (
                <div
                  key={position}
                  className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full bg-white/80 flex items-center justify-center"
                  style={{
                    left: `${getPositionCoordinates(position).x}%`,
                    top: `${getPositionCoordinates(position).y}%`,
                  }}
                >
                  {player.player_image_url ? (
                    <img
                      src={player.player_image_url}
                      alt={player.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                      {player.name[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400">
              {Object.keys(team.formation).length} joueurs
            </div>

            <div className="mt-4 flex justify-between items-center">
              <button
                onClick={() => handleExportPDF(team)}
                className="text-blue-500 hover:text-blue-600 transition-colors"
                title="Exporter en PDF"
              >
                <DocumentArrowDownIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => handleDeleteTeam(team.id)}
                className="text-red-500 hover:text-red-600 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Fonction utilitaire pour obtenir les coordonnées des positions
function getPositionCoordinates(position) {
  const positions = {
    GK: { x: 50, y: 90 },
    LB: { x: 20, y: 70 },
    CB1: { x: 40, y: 70 },
    CB2: { x: 60, y: 70 },
    RB: { x: 80, y: 70 },
    LM: { x: 20, y: 50 },
    CM1: { x: 40, y: 50 },
    CM2: { x: 60, y: 50 },
    RM: { x: 80, y: 50 },
    ST1: { x: 40, y: 30 },
    ST2: { x: 60, y: 30 },
  };
  return positions[position] || { x: 50, y: 50 };
}

export default TeamPage; 