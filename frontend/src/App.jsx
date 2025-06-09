// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, CssBaseline, Box, Toolbar, AppBar, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InventoryIcon from '@mui/icons-material/Inventory';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

// Importa las páginas que vamos a crear
import DashboardPage from './pages/DashboardPage';
import SociosPage from './pages/SociosPage';
import PagosPage from './pages/PagosPage';
import FinanzasPage from './pages/FinanzasPage';
import InventarioPage from './pages/InventarioPage';
import AdminPage from './pages/AdminPage';


const drawerWidth = 240;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Socios', icon: <PeopleIcon />, path: '/socios' },
  { text: 'Pagos', icon: <PaymentIcon />, path: '/pagos' },
  { text: 'Finanzas', icon: <AccountBalanceIcon />, path: '/finanzas' },
  { text: 'Inventario', icon: <InventoryIcon />, path: '/inventario' },
  { text: 'Administración', icon: <AdminPanelSettingsIcon />, path: '/admin' },
];

function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <Typography variant="h6" noWrap component="div">
              🥋 The Badgers
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: 'auto' }}>
            <List>
              {navItems.map((item) => (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton component={RouterLink} to={item.path}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Toolbar />
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/socios" element={<SociosPage />} />
            <Route path="/pagos" element={<PagosPage />} />
            <Route path="/finanzas" element={<FinanzasPage />} />
            <Route path="/inventario" element={<InventarioPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;