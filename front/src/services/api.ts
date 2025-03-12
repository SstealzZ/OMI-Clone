import axios from 'axios';

// Déterminer l'URL de l'API en fonction de l'environnement
const getApiUrl = () => {
  // Options d'URL possibles
  const possibleUrls = [
    'http://localhost:8000',     // URL de développement standard
    'http://127.0.0.1:8000',     // Autre URL locale possible
    window.location.origin       // Même origine que le front (pour le déploiement)
  ];
  
  // Utiliser l'URL spécifiée dans les variables d'environnement si disponible
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Par défaut, utiliser localhost:8000
  return possibleUrls[0];
};

const API_URL = getApiUrl();
console.log('URL de l\'API utilisée:', API_URL);

// Configuration du client axios avec timeout et gestion des erreurs
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-type': 'application/json',
  }
});

// Intercepteur pour les requêtes
apiClient.interceptors.request.use(
  config => {
    console.log(`Requête API en cours: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('Erreur lors de la requête API:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
apiClient.interceptors.response.use(
  response => {
    console.log(`Réponse API reçue: ${response.status} pour ${response.config.url}`);
    return response;
  },
  error => {
    console.error('Erreur de réponse API:', error);
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'état hors de la plage 2xx
      console.error('Données de la réponse d\'erreur:', error.response.data);
      console.error('Statut de l\'erreur:', error.response.status);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Aucune réponse reçue de l\'API. Vérifiez que le serveur est en cours d\'exécution.');
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration de la requête:', error.message);
    }
    return Promise.reject(error);
  }
);

export interface Message {
  _id?: string;
  date: string;
  message: string;
  type: string;
}

// Fonction pour initialiser les données de test via l'API
export const setupTestData = async (): Promise<boolean> => {
  try {
    console.log('Tentative d\'initialisation des données de test...');
    const response = await apiClient.get('/setup-test-data');
    console.log('Réponse de l\'initialisation des données de test:', response.data);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des données de test:', error);
    return false;
  }
};

// Fonction pour récupérer les informations de configuration de la base de données
export const getDbConfig = async (): Promise<any> => {
  try {
    console.log('Tentative de récupération de la configuration de la base de données...');
    const response = await apiClient.get('/db-config');
    console.log('Configuration de la base de données:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration de la base de données:', error);
    throw error;
  }
};

// Fonction pour réparer les messages
export const repairMessages = async (): Promise<any> => {
  try {
    console.log('Tentative de réparation des messages...');
    const response = await apiClient.get('/repair-messages');
    console.log('Réponse de la réparation des messages:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la réparation des messages:', error);
    throw error;
  }
};

export const api = {
  // Réparer les messages
  repairMessages,
  
  // Récupérer la configuration de la base de données
  getDbConfig,
  
  // Initialiser des données de test
  setupTestData,
  
  // Récupérer toutes les dates uniques
  getDates: async (): Promise<string[]> => {
    try {
      console.log('API - Début de la requête pour récupérer les dates');
      const response = await apiClient.get('/messages/dates');
      console.log('API - Réponse brute des dates:', response);
      console.log('API - Données brutes des dates:', response.data);
      
      // Vérifier que la réponse est un tableau
      if (Array.isArray(response.data)) {
        console.log('API - Les dates sont un tableau de', response.data.length, 'éléments');
        return response.data;
      } else {
        console.error('API - Les dates ne sont pas un tableau:', response.data);
        // Si les données ne sont pas un tableau, essayer d'initialiser les données de test
        await setupTestData();
        // Renvoyer un tableau vide et laisser l'application réessayer
        return [];
      }
    } catch (error) {
      console.error('API - Erreur lors de la récupération des dates:', error);
      // En cas d'erreur, essayer d'initialiser les données de test
      await setupTestData();
      throw error;
    }
  },
  
  // Récupérer tous les types de messages uniques
  getTypes: async (): Promise<string[]> => {
    try {
      console.log('API - Début de la requête pour récupérer les types');
      const response = await apiClient.get('/messages/types');
      console.log('API - Données brutes des types:', response.data);
      
      // Vérifier que la réponse est un tableau
      if (Array.isArray(response.data)) {
        console.log('API - Les types sont un tableau de', response.data.length, 'éléments');
        return response.data;
      } else {
        console.error('API - Les types ne sont pas un tableau:', response.data);
        // Retourner un tableau vide si les données ne sont pas au bon format
        return [];
      }
    } catch (error) {
      console.error('API - Erreur lors de la récupération des types:', error);
      throw error;
    }
  },
  
  // Récupérer les messages avec filtrage optionnel par date et/ou type
  getMessages: async (date?: string, type?: string): Promise<Message[]> => {
    try {
      let url = `/messages?limit=100`;
      if (date) url += `&date=${date}`;
      if (type) url += `&type=${type}`;
      
      const response = await apiClient.get(url);
      console.log(`Messages récupérés pour date=${date}, type=${type || 'tous'}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération des messages (date=${date}, type=${type || 'tous'}):`, error);
      throw error;
    }
  }
}; 