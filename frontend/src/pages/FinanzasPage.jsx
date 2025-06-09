// src/pages/FinanzasPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api';
import { 
    Grid, Card, CardContent, Typography, TextField, Select, MenuItem, 
    FormControl, InputLabel, Paper, Button, Box 
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FinanzasPage = () => {
    const [pagos, setPagos] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [gastos, setGastos] = useState([]);
    
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1); // 1-12

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const [pagosRes, ventasRes, gastosRes] = await Promise.all([
                    apiClient.get('/pagos/?limit=10000'),
                    apiClient.get('/ventas/?limit=10000'),
                    apiClient.get('/gastos/?limit=10000'),
                ]);
                setPagos(pagosRes.data.results);
                setVentas(ventasRes.data.results);
                setGastos(gastosRes.data.results);
            } catch (error) {
                console.error("Error fetching financial data:", error);
            }
        };
        fetchAllData();
    }, []);

    const filteredData = useMemo(() => {
        const filterByDate = (items, dateField) => items.filter(item => {
            const itemDate = new Date(item[dateField]);
            const sameYear = itemDate.getFullYear() === year;
            const sameMonth = month === 0 || itemDate.getMonth() + 1 === month;
            return sameYear && sameMonth;
        });

        const pagosFiltrados = filterByDate(pagos, 'fecha_pago');
        const ventasFiltradas = filterByDate(ventas, 'fecha_venta');
        const gastosFiltrados = filterByDate(gastos, 'fecha');
        
        const ingresosCuotas = pagosFiltrados.reduce((acc, p) => acc + parseFloat(p.monto), 0);
        const ingresosVentas = ventasFiltradas.reduce((acc, v) => acc + parseFloat(v.total_venta), 0);
        const totalGastos = gastosFiltrados.reduce((acc, g) => acc + parseFloat(g.monto), 0);
        
        return {
            ingresosCuotas,
            ingresosVentas,
            totalIngresos: ingresosCuotas + ingresosVentas,
            totalGastos,
            gananciaNeta: (ingresosCuotas + ingresosVentas) - totalGastos
        };
    }, [pagos, ventas, gastos, year, month]);

    const handleAddGasto = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newGasto = {
            concepto: formData.get('concepto'),
            monto: parseFloat(formData.get('monto')),
            fecha: formData.get('fecha'),
            categoria: formData.get('categoria'),
        };
        try {
            const res = await apiClient.post('/gastos/', newGasto);
            setGastos(prev => [...prev, res.data]);
            e.target.reset();
        } catch (error) {
            console.error("Error adding gasto:", error);
        }
    };
    
    const years = Array.from({length: 10}, (_, i) => today.getFullYear() - i);
    const months = ["Todos", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    return (
        <div>
            <Typography variant="h4" gutterBottom>Gestión de Finanzas</Typography>
            <Paper sx={{ p: 2, mb: 3, display: 'flex', gap: 2 }}>
                <FormControl>
                    <InputLabel>Año</InputLabel>
                    <Select value={year} label="Año" onChange={e => setYear(e.target.value)}>
                        {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl>
                    <InputLabel>Mes</InputLabel>
                    <Select value={month} label="Mes" onChange={e => setMonth(e.target.value)}>
                        {months.map((m, i) => <MenuItem key={m} value={i}>{m}</MenuItem>)}
                    </Select>
                </FormControl>
            </Paper>

            <Grid container spacing={2} mb={4}>
                <Grid item xs={6} md={3}><Card><CardContent><Typography>Ingresos por Cuotas</Typography><Typography variant="h5">${filteredData.ingresosCuotas.toFixed(2)}</Typography></CardContent></Card></Grid>
                <Grid item xs={6} md={3}><Card><CardContent><Typography>Ingresos por Ventas</Typography><Typography variant="h5">${filteredData.ingresosVentas.toFixed(2)}</Typography></CardContent></Card></Grid>
                <Grid item xs={6} md={3}><Card><CardContent><Typography>Gastos Totales</Typography><Typography variant="h5" color="error">${filteredData.totalGastos.toFixed(2)}</Typography></CardContent></Card></Grid>
                <Grid item xs={6} md={3}><Card><CardContent><Typography>Ganancia Neta</Typography><Typography variant="h5" color={filteredData.gananciaNeta >= 0 ? 'success.main' : 'error'}>${filteredData.gananciaNeta.toFixed(2)}</Typography></CardContent></Card></Grid>
            </Grid>
            
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Resumen Gráfico</Typography>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={[{ name: 'Resumen', Ingresos: filteredData.totalIngresos, Gastos: filteredData.totalGastos }]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            <Legend />
                            <Bar dataKey="Ingresos" fill="green" />
                            <Bar dataKey="Gastos" fill="red" />
                        </BarChart>
                    </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h6">Registrar Nuevo Gasto</Typography>
                    <Paper component="form" onSubmit={handleAddGasto} sx={{p: 2}}>
                        <TextField name="concepto" label="Concepto" fullWidth required margin="normal" />
                        <TextField name="monto" label="Monto" type="number" inputProps={{step: "0.01"}} fullWidth required margin="normal" />
                        <TextField name="fecha" type="date" fullWidth required margin="normal" defaultValue={today.toISOString().split('T')[0]}/>
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Categoría</InputLabel>
                            <Select name="categoria" label="Categoría" defaultValue="Otros">
                                <MenuItem value="Alquiler">Alquiler</MenuItem>
                                <MenuItem value="Servicios">Servicios</MenuItem>
                                <MenuItem value="Sueldos">Sueldos</MenuItem>
                                <MenuItem value="Equipamiento">Equipamiento</MenuItem>
                                <MenuItem value="Marketing">Marketing</MenuItem>
                                <MenuItem value="Otros">Otros</MenuItem>
                            </Select>
                        </FormControl>
                        <Button type="submit" variant="contained" sx={{mt: 2}}>Registrar Gasto</Button>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default FinanzasPage;