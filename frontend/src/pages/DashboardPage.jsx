// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PeopleIcon from '@mui/icons-material/People'; // Iconos para un look más profesional
import InventoryIcon from '@mui/icons-material/Inventory';
import apiClient from '../api';

const DashboardPage = () => {
    // --- CAMBIO 1: Actualizamos el estado para que coincida con la nueva API ---
    const [stats, setStats] = useState({ socios_activos: 0, productos_en_inventario: 0 });
    const [stockData, setStockData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // --- CAMBIO 2: Hacemos llamadas más eficientes ---
                // Una llamada para las estadísticas y otra para los datos del gráfico.
                const [statsRes, productosRes] = await Promise.all([
                    apiClient.get('/dashboard-stats/'),
                    apiClient.get('/productos/') 
                ]);
                
                // Guardamos las estadísticas desde el nuevo endpoint. Ahora 'socios_activos' es correcto.
                setStats(statsRes.data);

                // Procesamos los datos para el gráfico de stock (esto se mantiene, pero más seguro)
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

    // --- CAMBIO 3: La tarjeta de "Gastos Totales" ha sido eliminada ---
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
                            {/* Mostramos la estadística correcta */}
                            <Typography variant="h4">{stats.socios_activos}</Typography>
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
                            {/* Mostramos la estadística correcta */}
                            <Typography variant="h4">{stats.productos_en_inventario}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                {/* La tarjeta de Gastos Totales ya no está aquí */}
            </Grid>
            
            <Typography variant="h5" gutterBottom>Stock de Productos</Typography>
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={stockData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nombre" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="stock" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DashboardPage;