// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PeopleIcon from '@mui/icons-material/People'; // Iconos para un look más profesional
import InventoryIcon from '@mui/icons-material/Inventory';
import PaymentIcon from '@mui/icons-material/Payment';
import apiClient from '../api';

// Lista de socios que no pagan mensualidad
const SOCIOS_SIN_PAGO = [
    'Gonzalo Fernandez',
    'Federico Soriano',
    'Mariana Peralta',
    'Guillermo Viera'
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
                const sociosActivos = (sociosRes.data.results ? sociosRes.data.results : sociosRes.data)
                    .filter(socio => !SOCIOS_SIN_PAGO.includes(socio.nombre));

                // Obtener el mes y año actual
                const now = new Date();
                const mesActual = now.getMonth() + 1;
                const añoActual = now.getFullYear();

                // Filtrar pagos del mes actual
                const pagos = pagosRes.data.results ? pagosRes.data.results : pagosRes.data;
                const pagosMesActual = pagos.filter(p => 
                    p.mes === mesActual && p.año === añoActual
                );

                // Calcular estadísticas de pagos
                const sociosPagados = pagosMesActual.map(p => p.socio);
                const sociosPendientes = sociosActivos.filter(s => !sociosPagados.includes(s.ci));

                // Actualizar estadísticas
                setStats({
                    ...statsRes.data,
                    socios_activos: sociosActivos.length,
                    pagos_mes: {
                        pagados: sociosPagados.length,
                        pendientes: sociosPendientes.length
                    }
                });

                // Datos para el gráfico de pagos
                setPagosData([
                    { name: 'Pagados', value: sociosPagados.length },
                    { name: 'Pendientes', value: sociosPendientes.length }
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

    return (
        <div>
            <Typography variant="h4" gutterBottom>Dashboard Principal</Typography>
            <Grid container spacing={3} mb={4}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">Socios Activos</Typography>
                                <PeopleIcon color="primary" />
                            </Box>
                            <Typography variant="h4">{stats.socios_activos}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                (Excluyendo socios sin pago mensual)
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">Productos en Inventario</Typography>
                                <InventoryIcon color="primary" />
                            </Box>
                            <Typography variant="h4">{stats.productos_en_inventario}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">Estado de Pagos del Mes</Typography>
                                <PaymentIcon color="primary" />
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                <Box>
                                    <Typography variant="h6" color="success.main">
                                        {stats.pagos_mes.pagados}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pagados
                                    </Typography>
                                </Box>
                                <Box>
                                    <Typography variant="h6" color="warning.main">
                                        {stats.pagos_mes.pendientes}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Pendientes
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>Estado de Pagos del Mes</Typography>
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
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>Stock de Productos</Typography>
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
                </Grid>
            </Grid>
        </div>
    );
};

export default DashboardPage;