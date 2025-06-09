// src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '../api';

const DashboardPage = () => {
  const [stats, setStats] = useState({ socios: 0, productos: 0, gastos: 0 });
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sociosRes, productosRes, gastosRes] = await Promise.all([
          apiClient.get('/socios/'),
          apiClient.get('/productos/'),
          apiClient.get('/gastos/'),
        ]);
        
        setStats({
          socios: sociosRes.data.count,
          productos: productosRes.data.count,
          gastos: gastosRes.data.results.reduce((acc, g) => acc + parseFloat(g.monto), 0),
        });

        const stock = productosRes.data.results
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
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Socios Activos</Typography>
              <Typography variant="h4">{stats.socios} 👥</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Productos en Inventario</Typography>
              <Typography variant="h4">{stats.productos} 📦</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Gastos Totales</Typography>
              <Typography variant="h4">${stats.gastos.toFixed(2)} 💸</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Typography variant="h5" gutterBottom>Stock de Productos</Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={stockData}>
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