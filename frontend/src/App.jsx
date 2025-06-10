// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Container, Box } from '@mui/material';
import theme from './theme';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import SociosPage from './pages/SociosPage';
import PagosPage from './pages/PagosPage';
import InventarioPage from './pages/InventarioPage';
import FinanzasPage from './pages/FinanzasPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ 
          minHeight: '100vh',
          backgroundColor: 'background.default',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Navbar />
          <Container 
            maxWidth="xl" 
            sx={{ 
              py: 4,
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/socios" element={<SociosPage />} />
              <Route path="/pagos" element={<PagosPage />} />
              <Route path="/inventario" element={<InventarioPage />} />
              <Route path="/finanzas" element={<FinanzasPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;