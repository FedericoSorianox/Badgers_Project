// src/pages/PagosPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { 
    Button, TextField, Select, MenuItem, FormControl, InputLabel, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box 
} from '@mui/material';

const PagosPage = () => {
    const [socios, setSocios] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [newPago, setNewPago] = useState({ socio: '', mes: new Date().getMonth() + 1, año: selectedYear, monto: 2000.0 });

    const fetchSociosAndPagos = async () => {
        try {
            const [sociosRes, pagosRes] = await Promise.all([
                apiClient.get('/socios/?limit=1000'), // Asumimos que no hay más de 1000 socios
                apiClient.get(`/pagos/?año=${selectedYear}&limit=10000`) // y 10000 pagos
            ]);
            setSocios(sociosRes.data.results);
            setPagos(pagosRes.data.results);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    };
    
    useEffect(() => {
        fetchSociosAndPagos();
    }, [selectedYear]);

    const handleNewPagoChange = (e) => {
        const { name, value } = e.target;
        setNewPago(prev => ({...prev, [name]: value}));
    };
    
    const handleRegistrarPago = async (e) => {
        e.preventDefault();
        const id_pago = `${newPago.socio}_${newPago.mes}_${newPago.año}`;
        const payload = {
            id: id_pago,
            socio: newPago.socio,
            mes: parseInt(newPago.mes),
            año: parseInt(newPago.año),
            monto: parseFloat(newPago.monto),
            fecha_pago: new Date().toISOString().split('T')[0]
        };
        try {
            await apiClient.post('/pagos/', payload);
            fetchSociosAndPagos(); // Recargar datos
        } catch (error) {
            console.error("Error al registrar pago:", error.response?.data || error.message);
            alert("Error al registrar el pago. Es posible que ya exista un pago para ese socio en ese mes y año.");
        }
    };

    const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - i);

    const getStatus = (socioCi, mes) => {
        const pago = pagos.find(p => p.socio === socioCi && p.mes === mes);
        return pago ? '✅' : '❌';
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>Gestión de Pagos</Typography>
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6">Registrar Nuevo Pago</Typography>
                <Box component="form" onSubmit={handleRegistrarPago} sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel>Socio</InputLabel>
                        <Select name="socio" value={newPago.socio} label="Socio" onChange={handleNewPagoChange}>
                            {socios.map(s => <MenuItem key={s.ci} value={s.ci}>{s.nombre}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <FormControl fullWidth>
                        <InputLabel>Mes</InputLabel>
                        <Select name="mes" value={newPago.mes} label="Mes" onChange={handleNewPagoChange}>
                            {mesesNombres.map((nombre, i) => <MenuItem key={i} value={i + 1}>{nombre}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField name="año" label="Año" type="number" value={newPago.año} onChange={handleNewPagoChange} />
                    <TextField name="monto" label="Monto" type="number" value={newPago.monto} onChange={handleNewPagoChange} />
                    <Button type="submit" variant="contained">Guardar</Button>
                </Box>
            </Paper>

            <Typography variant="h5" gutterBottom>Estado de Pagos Anual</Typography>
            <FormControl sx={{ minWidth: 120, mb: 2 }}>
                <InputLabel>Año</InputLabel>
                <Select value={selectedYear} label="Año" onChange={(e) => setSelectedYear(e.target.value)}>
                    {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </Select>
            </FormControl>

            <TableContainer component={Paper}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell>Socio</TableCell>
                            {mesesNombres.map(mes => <TableCell key={mes} align="center">{mes}</TableCell>)}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {socios.map(socio => (
                            <TableRow key={socio.ci}>
                                <TableCell>{socio.nombre}</TableCell>
                                {mesesNombres.map((_, i) => (
                                    <TableCell key={i} align="center">{getStatus(socio.ci, i + 1)}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default PagosPage;