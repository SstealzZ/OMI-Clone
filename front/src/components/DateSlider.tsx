import React, { useEffect, useState, useRef } from 'react';
import { Box, Chip, Typography, Paper, CircularProgress, IconButton, Divider, Popover } from '@mui/material';
import { format, parse, isValid, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';

interface DateSliderProps {
  dates: string[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  loading?: boolean;
}

const DateSlider: React.FC<DateSliderProps> = ({ 
  dates, 
  selectedDate, 
  onSelectDate,
  loading = false 
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [parsedDates, setParsedDates] = useState<Date[]>([]);
  const [visibleDates, setVisibleDates] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const MAX_VISIBLE_DATES = 7;
  const calendarIconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    console.log("DateSlider - Dates reçues:", dates);
    console.log("DateSlider - Date sélectionnée:", selectedDate);

    // Convertir toutes les dates en objets Date
    const validDates = dates
      .map(date => ({
        original: date,
        parsed: tryParseDate(date)
      }))
      .filter(d => d.parsed !== null)
      .map(d => d.parsed as Date);

    setParsedDates(validDates);

    // Choisir les dates à afficher dans le slider
    let datesToShow: string[];
    if (dates.length <= MAX_VISIBLE_DATES) {
      datesToShow = dates;
    } else {
      // Prendre les dates les plus récentes
      datesToShow = dates.slice(0, MAX_VISIBLE_DATES);
    }
    
    setVisibleDates(datesToShow);
  }, [dates, selectedDate]);

  // Fonction pour essayer de parser une date avec différents formats
  const tryParseDate = (dateStr: string) => {
    console.log(`Tentative de parsing de la date: "${dateStr}"`);
    
    // Cas spécifique: si la date est "null", "undefined" ou vide
    if (!dateStr) {
      console.log("La date est null, undefined ou vide");
      return null;
    }
    
    // Formats possibles (du plus probable au moins probable)
    const formats = ['yyyy-MM-dd', 'dd/MM/yyyy', 'MM/dd/yyyy', 'dd-MM-yyyy', 'yyyyMMdd'];
    
    for (const formatStr of formats) {
      try {
        const parsedDate = parse(dateStr, formatStr, new Date());
        if (isValid(parsedDate)) {
          console.log(`Date parsée avec succès en utilisant le format ${formatStr}: ${parsedDate}`);
          return parsedDate;
        }
      } catch (error) {
        console.log(`Échec du parsing avec le format ${formatStr}`);
      }
    }
    
    // Si c'est une chaîne de type timestamp
    if (!isNaN(Date.parse(dateStr))) {
      const date = new Date(dateStr);
      console.log(`Date parsée comme timestamp: ${date}`);
      return date;
    }
    
    // Si aucun format ne fonctionne, retourner null
    console.warn(`Impossible de parser la date: ${dateStr}`);
    return null;
  };

  // Trier les dates par ordre chronologique inverse (du plus récent au plus ancien)
  const sortedDates = React.useMemo(() => {
    console.log("Tri des dates...");
    
    if (!visibleDates || visibleDates.length === 0) {
      console.log("Aucune date à trier");
      return [];
    }
    
    try {
      return [...visibleDates].sort((a, b) => {
        // Essayer de parser les dates
        const dateA = tryParseDate(a);
        const dateB = tryParseDate(b);
        
        // Gérer les cas où les dates ne peuvent pas être parsées
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        // Ordre inverse pour avoir les plus récentes d'abord
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error("Erreur lors du tri des dates:", error);
      return [...visibleDates]; // Retourner les dates non triées en cas d'erreur
    }
  }, [visibleDates]);

  const formatDate = (dateStr: string) => {
    // Pour le débogage, afficher la date brute
    console.log(`Formatage de la date: "${dateStr}"`);
    
    try {
      const parsedDate = tryParseDate(dateStr);
      if (parsedDate && isValid(parsedDate)) {
        try {
          const formattedDate = format(parsedDate, 'd MMM yyyy', { locale: fr });
          console.log(`Date formatée: "${formattedDate}"`);
          return formattedDate;
        } catch (formatError) {
          console.error(`Erreur de formatage pour la date ${dateStr}:`, formatError);
          // Fallback: format simple
          return parsedDate.toLocaleDateString('fr-FR');
        }
      }
    } catch (error) {
      console.error(`Erreur lors du formatage de la date: ${dateStr}`, error);
    }
    
    // Dernier recours : afficher la date brute
    console.warn(`Utilisation de la date brute: "${dateStr}"`);
    return dateStr;
  };

  // Ouvrir le calendrier
  const handleOpenCalendar = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setCalendarOpen(true);
  };

  // Fermer le calendrier
  const handleCloseCalendar = () => {
    setAnchorEl(null);
    setCalendarOpen(false);
  };

  // Gérer la sélection de date depuis le calendrier
  const handleCalendarDateChange = (date: Date | null) => {
    if (!date) return;
    
    // Chercher si la date sélectionnée correspond à une date disponible
    const matchingDate = dates.find(dateStr => {
      const parsedDate = tryParseDate(dateStr);
      return parsedDate && isSameDay(parsedDate, date);
    });

    if (matchingDate) {
      onSelectDate(matchingDate);
      handleCloseCalendar();
    } else {
      console.log("Aucune donnée disponible pour cette date");
      // Optionnel: afficher un message à l'utilisateur
    }
  };

  // Composant personnalisé pour les jours du calendrier
  const ServerDay = (props: PickersDayProps<Date>) => {
    const { day, outsideCurrentMonth, ...other } = props;
    
    // Vérifier si ce jour a des données
    const hasData = !outsideCurrentMonth && parsedDates.some(date => isSameDay(date, day));
    
    return (
      <PickersDay 
        {...other} 
        day={day} 
        outsideCurrentMonth={outsideCurrentMonth}
        sx={{
          ...(hasData && {
            backgroundColor: 'primary.light',
            borderRadius: '50%',
            fontWeight: 'bold',
          })
        }}
      />
    );
  };

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <Paper elevation={3} sx={{ py: 2, px: 1, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={20} sx={{ mr: 1 }} />
          <Typography variant="h6">
            Chargement des dates...
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Afficher un message si aucune date n'est disponible
  if (dates.length === 0) {
    return (
      <Paper elevation={3} sx={{ py: 2, px: 1, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Aucune date disponible
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center">
            La base de données est vide. Utilisez le bouton "Init Données Test" en haut de la page pour ajouter des données.
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ py: 2, px: 1, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, px: 1 }}>
        <Typography variant="h6">
          Sélectionnez une date ({dates.length} disponibles)
        </Typography>
        <IconButton 
          onClick={handleOpenCalendar} 
          color="primary" 
          aria-label="calendrier"
          ref={calendarIconRef}
        >
          <CalendarMonthIcon />
        </IconButton>
      </Box>

      {/* Calendrier dans un Popover */}
      <Popover
        open={calendarOpen}
        anchorEl={anchorEl}
        onClose={handleCloseCalendar}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ p: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DateCalendar 
              onChange={handleCalendarDateChange}
              value={selectedDate ? tryParseDate(selectedDate) : null}
              disableFuture
              slots={{
                day: ServerDay
              }}
              onYearChange={(newYear) => console.log("Année sélectionnée :", newYear)}
              onMonthChange={(newMonth) => console.log("Mois sélectionné :", newMonth)}
            />
          </LocalizationProvider>
        </Box>
      </Popover>

      <Box>
        {dates.length > MAX_VISIBLE_DATES && (
          <Typography variant="caption" sx={{ display: 'block', mb: 1, px: 1 }}>
            Affichage des {MAX_VISIBLE_DATES} dates les plus récentes. Utilisez le calendrier pour accéder aux dates antérieures.
          </Typography>
        )}
        <Divider sx={{ mb: 1 }} />
        <Box
          sx={{
            display: 'flex',
            overflowX: 'auto',
            py: 1,
            px: 1,
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f1f1',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#888',
              borderRadius: '10px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              backgroundColor: '#555',
            },
          }}
        >
          {sortedDates.length > 0 ? (
            sortedDates.map((date, index) => (
              <Chip
                key={`${date}-${index}`}
                label={formatDate(date)}
                onClick={() => onSelectDate(date)}
                color={selectedDate === date ? 'primary' : 'default'}
                variant={selectedDate === date ? 'filled' : 'outlined'}
                sx={{ 
                  mx: 0.5, 
                  my: 0.5,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            ))
          ) : (
            <Typography variant="body1" sx={{ p: 1 }}>
              Aucune date disponible
            </Typography>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default DateSlider; 