// src/pages/AdminPage.jsx
import React, { useState } from 'react';
import apiClient from '../api';
import { Button, Box, Typography, Paper, Grid, Alert, Container, CircularProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// Componente reutilizable para la importación
const CsvImporter = ({ title, endpoint }) => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
        setError('');
    };

    const handleImport = async () => {
        if (!file) {
            setError("Por favor, selecciona un archivo CSV primero.");
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        setLoading(true);
        try {
            const response = await apiClient.post(`/${endpoint}/import_csv/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setMessage(response.data.message);
            setError('');
            if (response.data.errors && response.data.errors.length > 0) {
                console.error("Errores de importación:", response.data.errors);
                setError(`Se encontraron errores. Revisa la consola del navegador (F12) para más detalles.`);
            }
        } catch (err) {
            setError(err.response?.data?.error || "Ocurrió un error durante la importación.");
            setMessage('');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6">{title}</Typography>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />} disabled={loading}>
                    Seleccionar CSV
                    <input type="file" accept=".csv" hidden onChange={handleFileChange} />
                </Button>
                {file && <Typography variant="body2">{file.name}</Typography>}
                <Button variant="contained" onClick={handleImport} disabled={!file || loading}>
                    Importar
                </Button>
                {loading && <CircularProgress size={28} sx={{ ml: 2 }} />}
            </Box>
            {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </Paper>
    );
};


const AdminPage = () => {
    const downloadCSV = (data, filename) => {
        if (!data || data.length === 0) {
            alert("No hay datos para exportar.");
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => 
                    JSON.stringify(row[header], (key, value) => value === null ? '' : value)
                ).join(',')
            )
        ];
        
        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', filename);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleExport = async (endpoint, filename) => {
        try {
            const response = await apiClient.get(`/${endpoint}/?limit=10000`);
            // Maneja tanto respuestas paginadas como no paginadas
            const data = response.data.results || response.data;
            if (!data || data.length === 0) {
                alert("No hay datos para exportar.");
                return;
            }
            downloadCSV(data, filename);
        } catch (error) {
            console.error(`Error al exportar ${filename}:`, error);
            alert(`Error al exportar ${filename}. Por favor, intenta nuevamente.`);
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            width: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            py: { xs: 3, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Container maxWidth={false} sx={{
                px: { xs: 2, sm: 3, md: 4 },
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Typography
                    variant="h2"
                    gutterBottom
                    align="center"
                    sx={{
                        fontWeight: 900,
                        mb: 8,
                        background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                        backgroundClip: 'text',
                        textFillColor: 'transparent',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontSize: { xs: '2.5rem', md: '3.5rem' },
                    }}
                >
                    Administración del Sistema
                </Typography>
                
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom>⬆️ Importar Datos</Typography>
                        <CsvImporter title="Importar Socios" endpoint="socios" />
                        <CsvImporter title="Importar Pagos" endpoint="pagos" />
                        <CsvImporter title="Importar Inventario" endpoint="productos" />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" gutterBottom>⬇️ Exportar Datos</Typography>
                        <Paper sx={{p: 2}}>
                            <Typography variant="h6" gutterBottom>Exportar a CSV</Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Button variant="outlined" onClick={() => handleExport('socios', 'socios.csv')}>Exportar Socios</Button>
                                <Button variant="outlined" onClick={() => handleExport('pagos', 'pagos.csv')}>Exportar Pagos</Button>
                                <Button variant="outlined" onClick={() => handleExport('productos', 'inventario.csv')}>Exportar Inventario</Button>
                                <Button variant="outlined" onClick={() => handleExport('ventas', 'ventas.csv')}>Exportar Ventas</Button>
                                <Button variant="outlined" onClick={() => handleExport('gastos', 'gastos.csv')}>Exportar Gastos</Button>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default AdminPage;