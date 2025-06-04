import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { ArrowLeftIcon, StarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { showNotification, copyToClipboard, showContextMenu } from '../services/systemService';
import { exportPlayerToPDF } from '../services/pdfService';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function PlayerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    fetchPlayerDetails();
  }, [id]);

  const handleContextMenu = (e) => {
    e.preventDefault();
    if (player) {
      showContextMenu(id, player.name);
    }
  };

  const fetchPlayerDetails = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('players')
        .select('*, player_notes(*)')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setPlayer(data);
    } catch (error) {
      toast.error('Erreur lors du chargement des détails du joueur');
      console.error('Erreur:', error.message);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      const { error } = await supabase
        .from('player_notes')
        .insert([
          {
            player_id: id,
            content: newNote,
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;

      toast.success('Note ajoutée avec succès');
      setNewNote('');
      fetchPlayerDetails();
      
      // Notification système
      showNotification(
        'Nouvelle note ajoutée',
        `Une nouvelle note a été ajoutée pour ${player.name}`
      );
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de la note');
      console.error('Erreur:', error.message);
    }
  };

  const toggleFavorite = async () => {
    try {
      const { error } = await supabase
        .from('players')
        .update({ is_favorite: !player.is_favorite })
        .eq('id', id);

      if (error) throw error;
      fetchPlayerDetails();
      
      // Notification système
      showNotification(
        'Favori mis à jour',
        `${player.name} a été ${player.is_favorite ? 'retiré des' : 'ajouté aux'} favoris`
      );
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du favori');
      console.error('Erreur:', error.message);
    }
  };

  const handleExportPDF = async () => {
    try {
      const success = await exportPlayerToPDF(player, null, player.player_notes);
      if (success) {
        toast.success('Fiche exportée avec succès');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'export de la fiche');
      console.error('Erreur:', error.message);
    }
  };

  const handleCopyProfile = async () => {
    const profileText = `${player.name} - ${player.team}\nPosition: ${player.position}\n\nStatistiques:\nMatches: ${player.matches}\nButs: ${player.goals}\nPasses décisives: ${player.assists}`;
    const success = await copyToClipboard(profileText);
    if (success) {
      toast.success('Profil copié dans le presse-papier');
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
    <div className="container mx-auto px-4 py-8" onContextMenu={handleContextMenu}>
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Retour
        </button>
        <div className="flex space-x-4">
          <button
            onClick={handleCopyProfile}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
          >
            Copier le profil
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Exporter en PDF
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-6">
            {player.player_image_url ? (
              <img
                src={player.player_image_url}
                alt={player.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-primary-500 shadow-lg"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-4xl font-bold border-4 border-gray-300">
                <span>{player.name[0]}</span>
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                {player.name}
                {player.team_image_url && (
                  <img
                    src={player.team_image_url}
                    alt={player.team}
                    className="w-10 h-10 rounded-full object-cover border border-gray-300 shadow"
                  />
                )}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mt-2 font-medium">{player.team}</p>
              <p className="text-gray-500 dark:text-gray-500 mt-1">{player.position}</p>
            </div>
          </div>
          <button
            onClick={toggleFavorite}
            className="text-yellow-400 hover:text-yellow-500 self-start md:self-auto"
          >
            {player.is_favorite ? (
              <StarIconSolid className="h-8 w-8" />
            ) : (
              <StarIcon className="h-8 w-8" />
            )}
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Notes personnelles
        </h2>
        <form onSubmit={handleAddNote} className="mb-6">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Ajouter une note..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            rows="3"
          />
          <button
            type="submit"
            className="mt-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Ajouter une note
          </button>
        </form>

        <div className="space-y-4">
          {player.player_notes?.map((note) => (
            <div
              key={note.id}
              className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg"
            >
              <p className="text-gray-900 dark:text-white">{note.content}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {new Date(note.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PlayerDetail; 