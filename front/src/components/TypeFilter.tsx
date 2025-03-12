import React from 'react';
import { 
  Paper, 
  Typography, 
  FormControl, 
  RadioGroup, 
  FormControlLabel, 
  Radio,
  Box,
  Chip
} from '@mui/material';

interface TypeFilterProps {
  types: string[];
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
}

const TypeFilter: React.FC<TypeFilterProps> = ({ types, selectedType, onSelectType }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Filtrer par type
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        <Chip 
          label="Tous les types"
          onClick={() => onSelectType(null)}
          color={selectedType === null ? 'primary' : 'default'}
          variant={selectedType === null ? 'filled' : 'outlined'}
          sx={{ fontWeight: selectedType === null ? 'bold' : 'normal' }}
        />
        
        {types.map(type => (
          <Chip
            key={type}
            label={type}
            onClick={() => onSelectType(type)}
            color={selectedType === type ? 'primary' : 'default'}
            variant={selectedType === type ? 'filled' : 'outlined'}
            sx={{ fontWeight: selectedType === type ? 'bold' : 'normal' }}
          />
        ))}
      </Box>
    </Paper>
  );
};

export default TypeFilter; 