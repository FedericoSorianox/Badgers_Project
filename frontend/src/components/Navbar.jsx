import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Container } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import InventoryIcon from '@mui/icons-material/Inventory';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import badgersLogo from '../assets/badgers-logo.png';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/socios', label: 'Socios', icon: <PeopleIcon /> },
    { path: '/pagos', label: 'Pagos', icon: <PaymentIcon /> },
    { path: '/inventario', label: 'Inventario', icon: <InventoryIcon /> },
    { path: '/finanzas', label: 'Finanzas', icon: <AccountBalanceIcon /> },
    { path: '/admin', label: 'Admin', icon: <AdminPanelSettingsIcon /> },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{ 
      backgroundColor: 'background.paper',
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              mr: 4,
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <img 
              src={badgersLogo} 
              alt="Badgers Logo" 
              style={{ height: '40px', marginRight: '12px', borderRadius: '50%', background: '#fff' }} 
            />
            Badgers Admin
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            flexGrow: 1
          }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={RouterLink}
                to={item.path}
                startIcon={item.icon}
                sx={{
                  color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                  backgroundColor: location.pathname === item.path ? 'action.selected' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 