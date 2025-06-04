import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { PlusIcon, StarIcon, TrashIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function Dashboard() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    team: '',
    position: '',
    notes: '',
    nationality: '',
    dateOfBirth: '',
    firstName: '',
    lastName: '',
    shirtNumber: '',
    teamCrest: ''
  });
  const [playerImage, setPlayerImage] = useState(null);
  const [teamImage, setTeamImage] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          navigate('/');
          setLoading(false);
          return;
        }
        await fetchPlayers();
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', error);
        toast.error('Erreur lors de la vérification de l\'authentification');
        navigate('/');
        setLoading(false);
      }
    };

    checkUser();
  }, [navigate]);

  const fetchPlayers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Utilisateur non authentifié");
        return;
      }

      // Upload des images si présentes
      let playerImageUrl = '';
      let teamImageUrl = '';

      if (playerImage) {
        const { data, error } = await supabase.storage
          .from('scoutmaster')
          .upload(`player_images/${playerImage.name}`, playerImage);
        if (error) throw error;
        playerImageUrl = `https://srgvbgsjcgbcvcllbnvg.supabase.co/storage/v1/object/public/scoutmaster/${data.path}`;
      }

      if (teamImage) {
        const { data, error } = await supabase.storage
          .from('scoutmaster')
          .upload(`team_images/${teamImage.name}`, teamImage);
        if (error) throw error;
        teamImageUrl = `https://srgvbgsjcgbcvcllbnvg.supabase.co/storage/v1/object/public/scoutmaster/${data.path}`;
      }

      // Vérifier si le joueur existe déjà (par nom et équipe)
      const { data: existingPlayers, error: checkError } = await supabase
        .from('players')
        .select('*')
        .eq('user_id', user.id);

      if (checkError) throw checkError;

      const existingPlayer = existingPlayers?.find(
        player => player.name === newPlayer.name && player.team === newPlayer.team
      );

      if (existingPlayer) {
        toast.error('Ce joueur est déjà dans votre liste');
        return;
      }

      const { error } = await supabase
        .from('players')
        .insert([
          {
            name: newPlayer.name,
            team: newPlayer.team,
            position: newPlayer.position,
            notes: newPlayer.notes,
            user_id: user.id,
            is_favorite: false,
            player_image_url: playerImageUrl,
            team_image_url: teamImageUrl
          }
        ]);
      if (error) throw error;

      toast.success('Joueur ajouté avec succès');
      setShowAddModal(false);
      setNewPlayer({ name: '', team: '', position: '', notes: '', nationality: '', dateOfBirth: '', firstName: '', lastName: '', shirtNumber: '', teamCrest: '' });
      setPlayerImage(null);
      setTeamImage(null);
      fetchPlayers();
    } catch (error) {
      toast.error("Erreur lors de l'ajout du joueur");
      console.error('Erreur:', error.message);
    }
  };

  const toggleFavorite = async (playerId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('players')
        .update({ is_favorite: !currentStatus })
        .eq('id', playerId);

      if (error) throw error;
      fetchPlayers();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du favori');
      console.error('Erreur:', error.message);
    }
  };

  const handlePlayerSelection = (playerId) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const handleDeletePlayers = async () => {
    console.log('handleDeletePlayers appelé');
    console.log('Joueurs sélectionnés:', selectedPlayers);

    if (!selectedPlayers.length) {
      console.log('Aucun joueur sélectionné');
      return;
    }

    try {
      // Vérifier l'authentification
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      console.log('Utilisateur actuel:', user);
      
      if (authError || !user) {
        console.error('Erreur d\'authentification:', authError);
        toast.error('Vous devez être connecté pour supprimer des joueurs');
        return;
      }

      // Supprimer les joueurs un par un
      for (const playerId of selectedPlayers) {
        console.log('Tentative de suppression du joueur:', playerId);
        
        // D'abord supprimer les notes associées
        const { error: notesError } = await supabase
          .from('player_notes')
          .delete()
          .filter('player_id', 'eq', playerId);

        if (notesError) {
          console.error(`Erreur lors de la suppression des notes du joueur ${playerId}:`, notesError);
          throw notesError;
        }

        console.log('Notes supprimées avec succès pour le joueur:', playerId);
        
        // Ensuite supprimer le joueur
        const { data, error } = await supabase
          .from('players')
          .delete()
          .filter('id', 'eq', playerId)
          .filter('user_id', 'eq', user.id);

        if (error) {
          console.error(`Erreur lors de la suppression du joueur ${playerId}:`, error);
          throw error;
        }

        console.log('Joueur supprimé avec succès:', data);

        // Supprimer les images associées
        const player = players.find(p => p.id === playerId);
        if (player?.player_image_url) {
          try {
            const imagePath = player.player_image_url.split('/').pop();
            console.log('Suppression de l\'image du joueur:', imagePath);
            const { error: imageError } = await supabase.storage
              .from('scoutmaster')
              .remove([`player_images/${imagePath}`]);
            
            if (imageError) {
              console.error('Erreur lors de la suppression de l\'image du joueur:', imageError);
              // Ne pas arrêter le processus si la suppression de l'image échoue
            } else {
              console.log('Image du joueur supprimée avec succès');
            }
          } catch (imageError) {
            console.error('Erreur lors de la suppression de l\'image du joueur:', imageError);
          }
        }

        if (player?.team_image_url) {
          try {
            const imagePath = player.team_image_url.split('/').pop();
            console.log('Suppression de l\'image de l\'équipe:', imagePath);
            const { error: imageError } = await supabase.storage
              .from('scoutmaster')
              .remove([`team_images/${imagePath}`]);
            
            if (imageError) {
              console.error('Erreur lors de la suppression de l\'image de l\'équipe:', imageError);
              // Ne pas arrêter le processus si la suppression de l'image échoue
            } else {
              console.log('Image de l\'équipe supprimée avec succès');
            }
          } catch (imageError) {
            console.error('Erreur lors de la suppression de l\'image de l\'équipe:', imageError);
          }
        }
      }

      toast.success('Joueurs supprimés avec succès');
      setSelectedPlayers([]);
      await fetchPlayers();
    } catch (error) {
      console.error('Erreur complète lors de la suppression:', error);
      toast.error('Erreur lors de la suppression des joueurs');
    }
  };

  const filteredPlayers = players.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.team.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          Mes Joueurs
        </h1>
        <div className="flex gap-4">
          {selectedPlayers.length > 0 && (
            <button
              onClick={() => {
                console.log('Bouton de suppression cliqué');
                handleDeletePlayers();
              }}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Supprimer ({selectedPlayers.length})
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Ajouter un joueur
          </button>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Rechercher un joueur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlayers.map((player) => (
          <div
            key={player.id}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 flex flex-col hover:shadow-2xl transition-shadow duration-300 relative"
          >
            <div className="absolute top-4 right-4">
              <input
                type="checkbox"
                checked={selectedPlayers.includes(player.id)}
                onChange={() => handlePlayerSelection(player.id)}
                className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                {player.player_image_url ? (
                  <img
                    src={player.player_image_url}
                    alt={player.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-primary-500 shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-bold border-2 border-gray-300">
                    <span>{player.name[0]}</span>
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    {player.name}
                    {player.team_image_url && (
                      <img
                        src={player.team_image_url}
                        alt={player.team}
                        className="w-8 h-8 rounded-full object-cover border border-gray-300 ml-2 shadow"
                      />
                    )}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 font-medium">{player.team}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{player.position}</p>
                </div>
              </div>
              <button
                onClick={() => toggleFavorite(player.id, player.is_favorite)}
                className="text-yellow-400 hover:text-yellow-500"
              >
                {player.is_favorite ? (
                  <StarIconSolid className="h-6 w-6" />
                ) : (
                  <StarIcon className="h-6 w-6" />
                )}
              </button>
            </div>
            <p className="mt-2 text-gray-600 dark:text-gray-400 italic min-h-[40px]">{player.notes}</p>
            <Link
              to={`/player/${player.id}`}
              className="mt-4 inline-block text-primary-600 hover:text-primary-700 dark:text-primary-400 font-semibold transition-colors"
            >
              Voir le profil complet →
            </Link>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Ajouter un joueur
            </h2>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom</label>
                <input
                  type="text"
                  value={newPlayer.name}
                  onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Équipe</label>
                <input
                  type="text"
                  value={newPlayer.team}
                  onChange={e => setNewPlayer({ ...newPlayer, team: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
                <input
                  type="text"
                  value={newPlayer.position}
                  onChange={e => setNewPlayer({ ...newPlayer, position: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nationalité</label>
                <input
                  type="text"
                  value={newPlayer.nationality}
                  onChange={e => setNewPlayer({ ...newPlayer, nationality: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date de naissance</label>
                <input
                  type="date"
                  value={newPlayer.dateOfBirth}
                  onChange={e => setNewPlayer({ ...newPlayer, dateOfBirth: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</label>
                <input
                  type="text"
                  value={newPlayer.firstName}
                  onChange={e => setNewPlayer({ ...newPlayer, firstName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom de famille</label>
                <input
                  type="text"
                  value={newPlayer.lastName}
                  onChange={e => setNewPlayer({ ...newPlayer, lastName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Numéro de maillot</label>
                <input
                  type="text"
                  value={newPlayer.shirtNumber}
                  onChange={e => setNewPlayer({ ...newPlayer, shirtNumber: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Crest de l'équipe (URL)</label>
                <input
                  type="text"
                  value={newPlayer.teamCrest}
                  onChange={e => setNewPlayer({ ...newPlayer, teamCrest: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                <textarea
                  value={newPlayer.notes}
                  onChange={e => setNewPlayer({ ...newPlayer, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photo du joueur</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setPlayerImage(e.target.files[0])}
                  className="mt-1 block w-full text-gray-700 dark:text-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Logo de l'équipe</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setTeamImage(e.target.files[0])}
                  className="mt-1 block w-full text-gray-700 dark:text-gray-300"
                />
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewPlayer({
                      name: '',
                      team: '',
                      position: '',
                      notes: '',
                      nationality: '',
                      dateOfBirth: '',
                      firstName: '',
                      lastName: '',
                      shirtNumber: '',
                      teamCrest: ''
                    });
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard; 