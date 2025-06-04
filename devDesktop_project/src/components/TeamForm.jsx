import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function TeamForm() {
  const navigate = useNavigate();
  const { teamId } = useParams();
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState({});
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(true);

  // Positions sur le terrain (x, y en pourcentage)
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

  useEffect(() => {
    fetchPlayers();
    if (teamId) {
      fetchTeam();
    } else {
      setLoading(false);
    }
  }, [teamId]);

  const fetchPlayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      toast.error('Erreur lors du chargement des joueurs');
      console.error('Erreur:', error.message);
    }
  };

  const fetchTeam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      if (data) {
        setTeamName(data.name);
        setSelectedPlayers(data.formation);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'équipe');
      console.error('Erreur:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePositionClick = (position) => {
    setSelectedPosition(position);
    setShowPlayerModal(true);
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayers(prev => ({
      ...prev,
      [selectedPosition]: player
    }));
    setShowPlayerModal(false);
  };

  const handleSaveTeam = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Vous devez être connecté pour sauvegarder une équipe');
        return;
      }

      if (!teamName.trim()) {
        toast.error('Veuillez donner un nom à l\'équipe');
        return;
      }

      if (Object.keys(selectedPlayers).length === 0) {
        toast.error('Veuillez sélectionner au moins un joueur');
        return;
      }

      if (teamId) {
        // Mise à jour de l'équipe existante
        const { error } = await supabase
          .from('teams')
          .update({
            name: teamName,
            formation: selectedPlayers
          })
          .eq('id', teamId);

        if (error) throw error;
        toast.success('Équipe mise à jour avec succès');
      } else {
        // Création d'une nouvelle équipe
        const { error } = await supabase
          .from('teams')
          .insert([
            {
              name: teamName,
              user_id: user.id,
              formation: selectedPlayers
            }
          ]);

        if (error) throw error;
        toast.success('Équipe créée avec succès');
      }

      navigate('/team');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde de l\'équipe');
      console.error('Erreur:', error.message);
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
      <div className="mb-6">
        <input
          type="text"
          placeholder="Nom de l'équipe"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="relative w-full aspect-[3/4] bg-green-600 rounded-lg overflow-hidden">
        {/* Lignes du terrain */}
        <div className="absolute inset-0 border-4 border-white opacity-50"></div>
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white opacity-50"></div>
        <div className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 border-2 border-white opacity-50 rounded-full"></div>

        {/* Positions des joueurs */}
        {Object.entries(positions).map(([position, coords]) => (
          <button
            key={position}
            onClick={() => handlePositionClick(position)}
            className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full bg-white/80 hover:bg-white transition-colors flex items-center justify-center"
            style={{
              left: `${coords.x}%`,
              top: `${coords.y}%`,
            }}
          >
            {selectedPlayers[position] ? (
              <div className="w-full h-full rounded-full overflow-hidden">
                {selectedPlayers[position].player_image_url ? (
                  <img
                    src={selectedPlayers[position].player_image_url}
                    alt={selectedPlayers[position].name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs font-bold">
                    {selectedPlayers[position].name[0]}
                  </div>
                )}
              </div>
            ) : (
              <PlusIcon className="h-6 w-6 text-gray-400" />
            )}
          </button>
        ))}
      </div>

      {/* Modal de sélection des joueurs */}
      {showPlayerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Sélectionner un joueur pour la position {selectedPosition}
            </h2>
            <div className="max-h-96 overflow-y-auto">
              {players.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handlePlayerSelect(player)}
                  className="w-full p-4 mb-2 text-left bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {player.player_image_url ? (
                      <img
                        src={player.player_image_url}
                        alt={player.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold">
                        {player.name[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{player.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{player.team} - {player.position}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowPlayerModal(false)}
              className="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end space-x-4">
        <button
          onClick={() => navigate('/team')}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          onClick={handleSaveTeam}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          {teamId ? 'Mettre à jour' : 'Créer'} l'équipe
        </button>
      </div>
    </div>
  );
}

export default TeamForm; 