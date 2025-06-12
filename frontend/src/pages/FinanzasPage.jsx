// src/pages/FinanzasPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../api';
import { 
    Grid, Card, CardContent, Typography, TextField, Select, MenuItem, 
    FormControl, InputLabel, Paper, Button, Box, Container,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const FinanzasPage = () => {
    const [pagos, setPagos] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [gastos, setGastos] = useState([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [filterType, setFilterType] = useState('todos');
    const [gananciaBruta, setGananciaBruta] = useState('');
    const [resultados, setResultados] = useState(null);
    
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
                setPagos(pagosRes.data.results || pagosRes.data);
                setVentas(ventasRes.data.results || ventasRes.data);
                setGastos(gastosRes.data.results || gastosRes.data);
            } catch (error) {
                console.error("Error fetching financial data:", error);
                setPagos([]);
                setVentas([]);
                setGastos([]);
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

    const handleDeleteRecord = async (type, id) => {
        try {
            await apiClient.delete(`/${type}/${id}/`);
            if (type === 'pagos') {
                setPagos(prev => prev.filter(p => p.id !== id));
            } else if (type === 'ventas') {
                setVentas(prev => prev.filter(v => v.id !== id));
            } else if (type === 'gastos') {
                setGastos(prev => prev.filter(g => g.id !== id));
            }
            setDeleteDialogOpen(false);
            setSelectedRecord(null);
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
        }
    };

    const openDeleteDialog = (record, type) => {
        setSelectedRecord({ ...record, type });
        setDeleteDialogOpen(true);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getFilteredRecords = () => {
        const allRecords = [...pagos, ...ventas, ...gastos];
        if (filterType === 'todos') return allRecords;
        
        return allRecords.filter(record => {
            if (filterType === 'pagos') return 'fecha_pago' in record;
            if (filterType === 'ventas') return 'fecha_venta' in record;
            if (filterType === 'gastos') return 'fecha' in record;
            return true;
        });
    };

    const calcularReparto = () => {
        const ganancia = parseFloat(gananciaBruta);
        if (isNaN(ganancia) || ganancia < 0) {
            alert('Por favor, ingrese un valor válido para la ganancia bruta.');
            return;
        }

        // Parámetros configurables
        const PORCENTAJE_PARA_SALARIOS = 0.60;
        const semanas_por_mes = 4;
        const horas_socio_1 = 10;  // Fede
        const horas_socio_2 = 4;   // Guille
        const horas_socio_3 = 2;   // Gonza
        const numero_de_socios = 3;

        // 1. Calcular pool de salarios
        const pool_de_salarios = ganancia * PORCENTAJE_PARA_SALARIOS;

        // 2. Calcular total de horas
        const total_horas_mensuales = (horas_socio_1 + horas_socio_2 + horas_socio_3) * semanas_por_mes;

        let valor_hora_variable = 0;
        let salario_socio_1 = 0, salario_socio_2 = 0, salario_socio_3 = 0;

        if (total_horas_mensuales > 0) {
            // 3. Calcular valor hora variable
            valor_hora_variable = pool_de_salarios / total_horas_mensuales;

            // 4. Calcular salarios
            salario_socio_1 = (horas_socio_1 * semanas_por_mes) * valor_hora_variable;
            salario_socio_2 = (horas_socio_2 * semanas_por_mes) * valor_hora_variable;
            salario_socio_3 = (horas_socio_3 * semanas_por_mes) * valor_hora_variable;
        }

        // 5. Calcular ganancia remanente
        const ganancia_remanente = ganancia - pool_de_salarios;
        const ganancia_por_inversion = ganancia_remanente / numero_de_socios;

        // 6. Calcular totales finales
        const total_socio_1 = salario_socio_1 + ganancia_por_inversion;
        const total_socio_2 = salario_socio_2 + ganancia_por_inversion;
        const total_socio_3 = salario_socio_3 + ganancia_por_inversion;

        setResultados({
            pool_de_salarios,
            valor_hora_variable,
            ganancia_remanente,
            ganancia_por_inversion,
            total_socio_1,
            total_socio_2,
            total_socio_3
        });
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
                    Gestión de Finanzas
                </Typography>
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

                {/* New Financial History Section */}
                <Box sx={{ mt: 4, width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h5">
                            Historial Financiero
                        </Typography>
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Filtrar por tipo</InputLabel>
                            <Select
                                value={filterType}
                                label="Filtrar por tipo"
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <MenuItem value="todos">Todos los registros</MenuItem>
                                <MenuItem value="pagos">Pagos</MenuItem>
                                <MenuItem value="ventas">Ventas</MenuItem>
                                <MenuItem value="gastos">Gastos</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Fecha</TableCell>
                                    <TableCell>Tipo</TableCell>
                                    <TableCell>Concepto</TableCell>
                                    <TableCell>Monto</TableCell>
                                    <TableCell>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {getFilteredRecords()
                                    .sort((a, b) => new Date(b.fecha_pago || b.fecha_venta || b.fecha) - new Date(a.fecha_pago || a.fecha_venta || a.fecha))
                                    .map((record) => {
                                        const isPago = 'fecha_pago' in record;
                                        const isVenta = 'fecha_venta' in record;
                                        const type = isPago ? 'pagos' : isVenta ? 'ventas' : 'gastos';
                                        const date = isPago ? record.fecha_pago : isVenta ? record.fecha_venta : record.fecha;
                                        const monto = isPago ? record.monto : isVenta ? record.total_venta : record.monto;
                                        const concepto = isPago ? 'Pago de Cuota' : isVenta ? 'Venta' : record.concepto;

                                        return (
                                            <TableRow key={`${type}-${record.id}`}>
                                                <TableCell>{formatDate(date)}</TableCell>
                                                <TableCell>{type.charAt(0).toUpperCase() + type.slice(1)}</TableCell>
                                                <TableCell>{concepto}</TableCell>
                                                <TableCell>${parseFloat(monto).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <IconButton 
                                                        onClick={() => openDeleteDialog(record, type)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>

                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={deleteDialogOpen}
                    onClose={() => setDeleteDialogOpen(false)}
                >
                    <DialogTitle>Confirmar Eliminación</DialogTitle>
                    <DialogContent>
                        ¿Está seguro que desea eliminar este registro?
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
                        <Button 
                            onClick={() => selectedRecord && handleDeleteRecord(selectedRecord.type, selectedRecord.id)}
                            color="error"
                            variant="contained"
                        >
                            Eliminar
                        </Button>
                    </DialogActions>
                </Dialog>

                <Paper sx={{ p: 3, width: '100%', mt: 4 }}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="h5" gutterBottom>
                            Calculadora de Reparto para The Badgers
                        </Typography>
                        
                        <Box sx={{ mb: 4 }}>
                            <TextField
                                label="Ganancia Bruta Mensual"
                                type="number"
                                value={gananciaBruta}
                                onChange={(e) => setGananciaBruta(e.target.value)}
                                fullWidth
                                sx={{ mb: 2 }}
                                InputProps={{
                                    startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                }}
                            />
                            <Button 
                                variant="contained" 
                                onClick={calcularReparto}
                                fullWidth
                            >
                                Calcular Reparto
                            </Button>
                        </Box>

                        {resultados && (
                            <Box>
                                <Card sx={{ mb: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>
                                            Desglose del Cálculo
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Pool destinado a salarios (60%): ${resultados.pool_de_salarios.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Valor por hora de clase: ${resultados.valor_hora_variable.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Ganancia remanente: ${resultados.ganancia_remanente.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Ganancia por inversión: ${resultados.ganancia_por_inversion.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </Typography>
                                    </CardContent>
                                </Card>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Fede (10hs/sem)
                                                </Typography>
                                                <Typography variant="h4" color="primary">
                                                    ${resultados.total_socio_1.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Guille (4hs/sem)
                                                </Typography>
                                                <Typography variant="h4" color="primary">
                                                    ${resultados.total_socio_2.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Card>
                                            <CardContent>
                                                <Typography variant="h6" gutterBottom>
                                                    Gonza (2hs/sem)
                                                </Typography>
                                                <Typography variant="h4" color="primary">
                                                    ${resultados.total_socio_3.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default FinanzasPage;