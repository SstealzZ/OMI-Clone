import React, { useState, useEffect } from 'react';
import { Container, Box, CssBaseline, ThemeProvider, createTheme, Alert, Snackbar, Typography, Switch, FormControlLabel, Paper, Button, Tooltip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import BuildIcon from '@mui/icons-material/Build';
import Header from './components/Header';
import DateSlider from './components/DateSlider';
import TypeFilter from './components/TypeFilter';
import MessageList from './components/MessageList';
import DebugView from './components/DebugView';
import { api, Message, setupTestData } from './services/api';

// Création d'un thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  // États pour stocker les données
  const [dates, setDates] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // On commence avec loading=true
  const [error, setError] = useState<string | null>(null);
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [debugMode, setDebugMode] = useState<boolean>(true); // Mode débogage activé par défaut
  const [dbConfig, setDbConfig] = useState<any>(null);
  const [dbConfigOpen, setDbConfigOpen] = useState<boolean>(false);
  const [repairResult, setRepairResult] = useState<any>(null);
  const [repairOpen, setRepairOpen] = useState<boolean>(false);

  // Fonction pour initialiser les données de test
  const handleInitTestData = async () => {
    setLoading(true);
    setError(null);

    try {
      const success = await setupTestData();
      if (success) {
        // Recharger les données
        await fetchInitialData();
      } else {
        setError("Échec de l'initialisation des données de test.");
      }
    } catch (error) {
      console.error("Erreur lors de l'initialisation des données de test:", error);
      setError("Erreur lors de l'initialisation des données de test.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour recharger les données
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Charger les dates
      console.log('App - Tentative de chargement des dates...');
      const datesData = await api.getDates();
      console.log('App - Dates brutes récupérées:', JSON.stringify(datesData));
      
      if (datesData && Array.isArray(datesData)) {
        console.log('App - Les dates sont un tableau de', datesData.length, 'éléments');
        setDates(datesData);
        setApiConnected(true);
        
        // Si des dates sont disponibles, sélectionner la première par défaut
        if (datesData.length > 0) {
          console.log('App - Sélection de la première date:', datesData[0]);
          setSelectedDate(datesData[0]);
        } else {
          console.warn('App - Aucune date n\'a été récupérée');
        }
        
        // Charger les types
        console.log('App - Tentative de chargement des types...');
        const typesData = await api.getTypes();
        console.log('App - Types récupérés:', typesData);
        setTypes(typesData);
      } else {
        console.error('App - Les données des dates ne sont pas un tableau:', datesData);
        setError("Les données reçues de l'API ne sont pas au format attendu.");
      }
    } catch (error) {
      console.error('App - Erreur lors du chargement des données initiales:', error);
      setApiConnected(false);
      setError("Impossible de se connecter à l'API. Vérifiez que le serveur est en cours d'exécution sur http://localhost:8000.");
    } finally {
      setLoading(false);
    }
  };

  // Charger les dates et types au démarrage
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Charger les messages quand la date ou le type change
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedDate) {
        setMessages([]);
        return;
      }
      
      setLoading(true);
      try {
        console.log(`App - Chargement des messages pour la date ${selectedDate} et le type ${selectedType || 'tous'}...`);
        const messagesData = await api.getMessages(selectedDate, selectedType || undefined);
        console.log('App - Messages récupérés:', messagesData);
        
        if (messagesData.length === 0) {
          console.log('App - Aucun message trouvé pour cette date et ce type');
        }
        
        setMessages(messagesData);
      } catch (error) {
        console.error('App - Erreur lors du chargement des messages:', error);
        setError("Impossible de charger les messages.");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [selectedDate, selectedType]);

  // Gestionnaire pour la sélection de date
  const handleDateSelect = (date: string) => {
    console.log('Date sélectionnée:', date);
    setSelectedDate(date);
  };
  
  // Gestionnaire pour la sélection de type
  const handleTypeSelect = (type: string | null) => {
    console.log('Type sélectionné:', type);
    setSelectedType(type);
  };

  // Fermer l'alerte d'erreur
  const handleCloseError = () => {
    setError(null);
  };

  // Gestionnaire pour activer/désactiver le mode de débogage
  const handleToggleDebug = () => {
    setDebugMode(!debugMode);
  };

  // Fonction pour réessayer la connexion à l'API
  const handleRetryConnection = () => {
    setLoading(true);
    setError(null);
    
    // Recharger les données
    const fetchData = async () => {
      try {
        // Charger les dates
        const datesData = await api.getDates();
        setDates(datesData);
        setApiConnected(true);
        
        // Si des dates sont disponibles, sélectionner la première
        if (datesData.length > 0) {
          setSelectedDate(datesData[0]);
        }
        
        // Charger les types
        const typesData = await api.getTypes();
        setTypes(typesData);
      } catch (error) {
        console.error('Erreur lors de la nouvelle tentative de connexion:', error);
        setApiConnected(false);
        setError("Échec de la connexion à l'API. Vérifiez que le serveur est en cours d'exécution.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  };

  // Fonction pour récupérer la configuration de la base de données
  const handleGetDbConfig = async () => {
    try {
      const config = await api.getDbConfig();
      setDbConfig(config);
      setDbConfigOpen(true);
    } catch (error) {
      console.error("Erreur lors de la récupération de la configuration DB:", error);
      setError("Erreur lors de la récupération de la configuration de la base de données.");
    }
  };

  // Fonction pour fermer la boîte de dialogue de configuration
  const handleCloseDbConfig = () => {
    setDbConfigOpen(false);
  };

  // Fonction pour réparer les messages
  const handleRepairMessages = async () => {
    try {
      setLoading(true);
      const result = await api.repairMessages();
      setRepairResult(result);
      setRepairOpen(true);
      
      // Recharger les données pour voir les changements
      await fetchInitialData();
    } catch (error) {
      console.error("Erreur lors de la réparation des messages:", error);
      setError("Erreur lors de la réparation des messages.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour fermer la boîte de dialogue de réparation
  const handleCloseRepair = () => {
    setRepairOpen(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Container sx={{ my: 4, flexGrow: 1 }}>
          {/* Contrôle du mode de débogage et initialisation des données */}
          <Paper elevation={1} sx={{ mb: 3, p: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={<Switch checked={debugMode} onChange={handleToggleDebug} />}
                label="Mode débogage"
              />
              <Tooltip title="Afficher la configuration DB">
                <IconButton color="info" onClick={handleGetDbConfig} size="small" sx={{ ml: 1 }}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Stack direction="row" spacing={1}>
              <Tooltip title="Réparer les messages (corriger la casse des champs)">
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<BuildIcon />}
                  onClick={handleRepairMessages}
                  disabled={loading}
                >
                  Réparer Messages
                </Button>
              </Tooltip>
              <Tooltip title="Initialiser les données de test">
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<RefreshIcon />}
                  onClick={handleInitTestData}
                  disabled={loading}
                >
                  Init Données Test
                </Button>
              </Tooltip>
            </Stack>
          </Paper>
          
          {/* Message d'erreur de connexion API */}
          {!apiConnected && !loading && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={handleRetryConnection}>
                  Réessayer
                </Button>
              }
            >
              Impossible de se connecter à l'API. Vérifiez que le serveur est en cours d'exécution ou cliquez sur "Init Données Test".
            </Alert>
          )}
          
          {/* Contenu principal */}
          <DateSlider 
            dates={dates} 
            selectedDate={selectedDate} 
            onSelectDate={handleDateSelect}
            loading={loading}
          />
          
          {/* Layout en grid pour le filtre et la liste de messages */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: '250px 1fr' },
            gap: 3
          }}>
            {/* Filtre de types */}
            <Box>
              <TypeFilter 
                types={types} 
                selectedType={selectedType} 
                onSelectType={handleTypeSelect} 
              />
            </Box>
            
            {/* Liste de messages */}
            <Box>
              <MessageList 
                messages={messages} 
                loading={loading} 
                selectedDate={selectedDate} 
              />
            </Box>
          </Box>

          {/* Vue de débogage */}
          {debugMode && (
            <DebugView
              dates={dates}
              types={types}
              messages={messages}
              selectedDate={selectedDate}
              selectedType={selectedType}
              loading={loading}
            />
          )}
        </Container>
      </Box>
      
      {/* Boîte de dialogue de configuration de la base de données */}
      <Dialog open={dbConfigOpen} onClose={handleCloseDbConfig} maxWidth="md" fullWidth>
        <DialogTitle>Configuration de la base de données</DialogTitle>
        <DialogContent>
          {dbConfig ? (
            <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
              {JSON.stringify(dbConfig, null, 2)}
            </Box>
          ) : (
            <Typography>Chargement de la configuration...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDbConfig}>Fermer</Button>
        </DialogActions>
      </Dialog>
      
      {/* Boîte de dialogue pour les résultats de réparation */}
      <Dialog open={repairOpen} onClose={handleCloseRepair} maxWidth="md" fullWidth>
        <DialogTitle>Résultat de la réparation des messages</DialogTitle>
        <DialogContent>
          {repairResult ? (
            <Box>
              <Typography variant="h6" gutterBottom>
                {repairResult.message}
              </Typography>
              <Box component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', mt: 2 }}>
                {JSON.stringify(repairResult, null, 2)}
              </Box>
            </Box>
          ) : (
            <Typography>Chargement des résultats...</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRepair}>Fermer</Button>
        </DialogActions>
      </Dialog>
      
      {/* Afficher les erreurs */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
