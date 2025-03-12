import React from 'react';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';

const Header: React.FC = () => {
  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              fontWeight: 700, 
              letterSpacing: '.1rem',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            MESSAGERIE SYNAPSE OS
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 