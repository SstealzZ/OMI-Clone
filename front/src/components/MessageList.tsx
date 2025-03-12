import React from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  Box,
  Chip,
  CircularProgress
} from '@mui/material';
import { Message } from '../services/api';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  selectedDate: string | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, loading, selectedDate }) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedDate) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Veuillez sélectionner une date pour afficher les messages
        </Typography>
      </Paper>
    );
  }

  if (messages.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Aucun message trouvé pour cette date et ce type
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          Utilisez le bouton "Init Données Test" en haut de la page pour ajouter des données de test, ou ajoutez manuellement des messages via l'API.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 0, overflow: 'hidden' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6">
          Messages ({messages.length})
        </Typography>
      </Box>
      
      <List sx={{ width: '100%', bgcolor: 'background.paper', maxHeight: '60vh', overflow: 'auto' }}>
        {messages.map((message, index) => (
          <React.Fragment key={message._id || index}>
            <ListItem alignItems="flex-start" sx={{ py: 2 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip 
                      label={message.type} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="subtitle1" component="span">
                      {message.date}
                    </Typography>
                  </Box>
                }
                secondary={
                  <Typography
                    component="span"
                    variant="body1"
                    color="text.primary"
                    sx={{ display: 'inline', whiteSpace: 'pre-wrap' }}
                  >
                    {message.message}
                  </Typography>
                }
              />
            </ListItem>
            {index < messages.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default MessageList; 