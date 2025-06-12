// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Dialog, DialogTitle, DialogContent, List, ListItem, ListItemText, IconButton, Container, useTheme, useMediaQuery, Button } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PeopleIcon from '@mui/icons-material/People'; // Iconos para un look más profesional
import InventoryIcon from '@mui/icons-material/Inventory';
import PaymentIcon from '@mui/icons-material/Payment';
import CloseIcon from '@mui/icons-material/Close';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
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
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
            width: '100%',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            py: { xs: 3, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Container 
                maxWidth={false} 
                sx={{ 
                    px: { xs: 2, sm: 3, md: 4 },
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
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
                    Dashboard Principal
                </Typography>
                <Grid container spacing={6} mb={8} justifyContent="center" alignItems="center">
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{
                            height: '100%',
                            borderRadius: 6,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-6px)',
                                boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
                            },
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Socios Activos</Typography>
                                    <PeopleIcon sx={{ color: '#2196F3', fontSize: 40 }} />
                                </Box>
                                <Typography variant="h2" align="center" sx={{ fontWeight: 800, color: '#2196F3' }}>
                                    {stats.socios_activos}
                                </Typography>
                                <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 2 }}>
                                    (Excluyendo socios sin pago mensual)
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{
                            height: '100%',
                            borderRadius: 6,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-6px)',
                                boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
                            },
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Productos en Inventario</Typography>
                                    <InventoryIcon sx={{ color: '#4CAF50', fontSize: 40 }} />
                                </Box>
                                <Typography variant="h2" align="center" sx={{ fontWeight: 800, color: '#4CAF50' }}>
                                    {stats.productos_en_inventario}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card sx={{
                            height: '100%',
                            borderRadius: 6,
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                                transform: 'translateY(-6px)',
                                boxShadow: '0 16px 32px rgba(0,0,0,0.12)',
                            },
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
                        }}>
                            <CardContent sx={{ p: 4 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Estado de Pagos</Typography>
                                    <PaymentIcon sx={{ color: '#FF9800', fontSize: 40 }} />
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 3 }}>
                                    <Box>
                                        <Typography variant="h3" color="success.main" align="center" sx={{ fontWeight: 800 }}>
                                            {stats.pagos_mes.pagados}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" align="center">
                                            Pagados
                                        </Typography>
                                    </Box>
                                    <Box sx={{ cursor: 'pointer' }} onClick={handleOpenDialog}>
                                        <Typography variant="h3" color="warning.main" align="center" sx={{ fontWeight: 800 }}>
                                            {stats.pagos_mes.pendientes}
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" align="center">
                                            Pendientes
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Box sx={{ height: '100%' }} />
                    </Grid>
                </Grid>
                <Grid container spacing={6} justifyContent="center" alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            borderRadius: 6,
                            p: 4,
                            height: '100%',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
                        }}>
                            <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, mb: 5 }}>
                                Estado de Pagos del Mes
                            </Typography>
                            <ResponsiveContainer width="100%" height={350}>
                                <PieChart>
                                    <Pie
                                        data={pagosData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        outerRadius={120}
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
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Card sx={{
                            borderRadius: 6,
                            p: 4,
                            height: '100%',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                            boxShadow: '0 6px 24px rgba(0,0,0,0.08)',
                        }}>
                            <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, mb: 5 }}>
                                Stock de Productos
                            </Typography>
                            <ResponsiveContainer width="100%" height={350}>
                                <BarChart data={stockData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="nombre" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="stock" fill="#2196F3" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    </Grid>
                </Grid>
                <Dialog 
                    open={openDialog} 
                    onClose={handleCloseDialog}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 6,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        }
                    }}
                >
                    <DialogTitle sx={{ 
                        borderBottom: '1px solid #f0f0f0',
                        pb: 2,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            Socios Pendientes de Pago
                        </Typography>
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseDialog}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': {
                                    color: 'text.primary',
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        <List>
                            {sociosPendientes.map((socio) => (
                                <ListItem 
                                    key={socio.ci}
                                    sx={{
                                        borderBottom: '1px solid #f0f0f0',
                                        '&:last-child': {
                                            borderBottom: 'none'
                                        }
                                    }}
                                >
                                    <ListItemText 
                                        primary={
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                                {socio.nombre}
                                            </Typography>
                                        }
                                        secondary={`CI: ${socio.ci}`}
                                    />
                                    {socio.celular && (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            startIcon={<WhatsAppIcon />}
                                            onClick={() => {
                                                const message = `Hola ${socio.nombre}! Te recordamos que tienes pendiente el pago de la cuota mensual de The Badgers. Por favor, acércate al gimnasio para regularizar tu situación. ¡Gracias!`;
                                                const whatsappUrl = `https://wa.me/${socio.celular.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
                                                window.open(whatsappUrl, '_blank');
                                            }}
                                            sx={{ ml: 2 }}
                                        >
                                            Enviar Recordatorio
                                        </Button>
                                    )}
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