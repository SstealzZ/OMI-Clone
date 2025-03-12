import React from 'react';
import { Box, Paper, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Message } from '../services/api';

interface DebugViewProps {
  dates: string[];
  types: string[];
  messages: Message[];
  selectedDate: string | null;
  selectedType: string | null;
  loading: boolean;
}

const DebugView: React.FC<DebugViewProps> = ({
  dates,
  types,
  messages,
  selectedDate,
  selectedType,
  loading
}) => {
  return (
    <Paper elevation={3} sx={{ mt: 2, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Données de débogage
      </Typography>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">État de l'application</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="pre" sx={{ overflow: 'auto', fontSize: '0.8rem' }}>
            {JSON.stringify(
              {
                loading,
                selectedDate,
                selectedType,
                dateCount: dates.length,
                typeCount: types.length,
                messageCount: messages.length
              },
              null,
              2
            )}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Dates ({dates.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="pre" sx={{ overflow: 'auto', fontSize: '0.8rem' }}>
            {JSON.stringify(dates, null, 2)}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Types ({types.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="pre" sx={{ overflow: 'auto', fontSize: '0.8rem' }}>
            {JSON.stringify(types, null, 2)}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Messages ({messages.length})</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box component="pre" sx={{ overflow: 'auto', fontSize: '0.8rem' }}>
            {JSON.stringify(messages, null, 2)}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default DebugView; 