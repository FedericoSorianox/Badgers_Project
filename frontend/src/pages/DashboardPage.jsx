// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, IconButton, Container } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PeopleIcon from '@mui/icons-material/People'; // Iconos para un look más profesional
import InventoryIcon from '@mui/icons-material/Inventory';
import PaymentIcon from '@mui/icons-material/Payment';
import CloseIcon from '@mui/icons-material/Close';
import apiClient from '../api';

// Lista de socios que no pagan mensualidad
const SOCIOS_SIN_PAGO = [
    'Gonzalo Fernandez',
    'Federico Soriano',
    'Mariana Peralta',
    'Guillermo Viera',
    'Andrea Lostorto'
];

const COLORS = ['#4CAF50', '#FFC107'];

const DashboardPage = () => {
    const [stats, setStats] = useState({ 
        socios_activos: 0, 
        productos_en_inventario: 0,
        pagos_mes: { pagados: 0, pendientes: 0 }
    });
    const [stockData, setStockData] = useState([]);
    const [pagosData, setPagosData] = useState([]);
    const [sociosPendientes, setSociosPendientes] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, productosRes, sociosRes, pagosRes] = await Promise.all([
                    apiClient.get('/dashboard-stats/'),
                    apiClient.get('/productos/'),
                    apiClient.get('/socios/?limit=1000'),
                    apiClient.get('/pagos/?limit=10000')
                ]);
                
                // Filtrar socios activos (excluyendo socios sin pago)
                const todosLosSocios = sociosRes.data.results ? sociosRes.data.results : sociosRes.data;
                console.log('Total de socios:', todosLosSocios.length);
                
                const sociosActivos = todosLosSocios.filter(socio => !SOCIOS_SIN_PAGO.includes(socio.nombre));
                console.log('Socios activos (sin socios sin pago):', sociosActivos.length);
                console.log('Socios sin pago:', SOCIOS_SIN_PAGO);

                // Obtener el mes y año actual
                const now = new Date();
                const mesActual = now.getMonth() + 1;
                const añoActual = now.getFullYear();

                // Filtrar pagos del mes actual
                const pagos = pagosRes.data.results ? pagosRes.data.results : pagosRes.data;
                const pagosMesActual = pagos.filter(p => 
                    p.mes === mesActual && p.año === añoActual
                );
                console.log('Pagos del mes actual:', pagosMesActual.length);

                // Calcular estadísticas de pagos
                const sociosPagados = pagosMesActual.map(p => p.socio);
                console.log('Socios que han pagado:', sociosPagados.length);

                // Filtrar socios pendientes (excluyendo socios sin pago)
                const sociosPendientesList = sociosActivos.filter(s => !sociosPagados.includes(s.ci));
                setSociosPendientes(sociosPendientesList);

                // Actualizar estadísticas
                setStats({
                    ...statsRes.data,
                    socios_activos: sociosActivos.length,
                    pagos_mes: {
                        pagados: sociosPagados.length,
                        pendientes: sociosPendientesList.length
                    }
                });

                // Datos para el gráfico de pagos
                setPagosData([
                    { name: 'Pagados', value: sociosPagados.length },
                    { name: 'Pendientes', value: sociosPendientesList.length }
                ]);

                // Procesar datos para el gráfico de stock
                const productos = productosRes.data.results ? productosRes.data.results : productosRes.data;
                const stock = productos
                    .filter(p => p.stock > 0)
                    .map(p => ({ nombre: p.nombre, stock: p.stock }));
                setStockData(stock);

            } catch (error) {
                console.error("Error al cargar el dashboard:", error);
            }
        };
        fetchData();
    }, []);

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            py: { xs: 2, md: 4 },
        }}>
            <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 4, lg: 8 } }}>
                <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, mb: 4 }}>
                    Dashboard Principal
                </Typography>
                <Grid container spacing={3} mb={4}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                            <CardContent sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6">Socios Activos</Typography>
                                    <PeopleIcon color="primary" />
                                </Box>
                                <Typography variant="h4" align="center">{stats.socios_activos}</Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    (Excluyendo socios sin pago mensual)
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                            <CardContent sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6">Productos en Inventario</Typography>
                                    <InventoryIcon color="primary" />
                                </Box>
                                <Typography variant="h4" align="center">{stats.productos_en_inventario}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 2 }}>
                            <CardContent sx={{ width: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6">Estado de Pagos del Mes</Typography>
                                    <PaymentIcon color="primary" />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Box>
                                        <Typography variant="h6" color="success.main" align="center">
                                            {stats.pagos_mes.pagados}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" align="center">
                                            Pagados
                                        </Typography>
                                    </Box>
                                    <Box sx={{ cursor: 'pointer' }} onClick={handleOpenDialog}>
                                        <Typography variant="h6" color="warning.main" align="center">
                                            {stats.pagos_mes.pendientes}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" align="center">
                                            Pendientes (click para ver)
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: { xs: 2, md: 3 }, boxShadow: 2 }}>
                            <Typography variant="h5" gutterBottom align="center">Estado de Pagos del Mes</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={pagosData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {pagosData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, p: { xs: 2, md: 3 }, boxShadow: 2 }}>
                            <Typography variant="h5" gutterBottom align="center">Stock de Productos</Typography>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stockData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="nombre" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="stock" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Grid>
                </Grid>
                <Dialog 
                    open={openDialog} 
                    onClose={handleCloseDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>
                        Socios Pendientes de Pago
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseDialog}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <List>
                            {sociosPendientes.map((socio) => (
                                <ListItem key={socio.ci}>
                                    <ListItemText 
                                        primary={socio.nombre}
                                        secondary={`CI: ${socio.ci}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    </DialogContent>
                </Dialog>
            </Container>
        </Box>
    );
};

export default DashboardPage;