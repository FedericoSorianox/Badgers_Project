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
                apiClient.get('/socios/?limit=1000'), 
                apiClient.get(`/pagos/?año=${selectedYear}&limit=10000`)
            ]);
            
            // --- CAMBIO 1: Lógica de carga de datos más robusta ---
            // Comprobamos si la respuesta es paginada (tiene .results) o es un array directo.
            // Esto hace que el código funcione sin importar la configuración de paginación del backend.
            setSocios(sociosRes.data.results ? sociosRes.data.results : sociosRes.data);
            setPagos(pagosRes.data.results ? pagosRes.data.results : pagosRes.data);

        } catch (error) {
            console.error("Error al cargar datos:", error);
            // Limpiamos los estados en caso de error para evitar mostrar datos viejos.
            setSocios([]);
            setPagos([]);
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

    // En src/pages/PagosPage.jsx

const getStatus = (socio, mes) => {
    // --- LÓGICA MEJORADA CON PRIORIDAD DE PAGO ---

    // 1. Primero, buscamos si existe un pago. Esta es la máxima prioridad.
    const pagoExistente = pagos.find(p => p.socio === socio.ci && p.mes === mes);
    
    // Si encontramos un pago, siempre mostramos el ticket verde y terminamos.
    if (pagoExistente) {
        return '✅';
    }

    // 2. Si NO hay pago, ahora comprobamos la fecha de registro para decidir qué mostrar.
    if (socio.fecha_registro) {
        const fechaRegistro = new Date(socio.fecha_registro);
        // Usamos el día 2 del mes para evitar problemas de zona horaria.
        const fechaMesActual = new Date(selectedYear, mes - 1, 2); 

        // Si el mes es anterior a la fecha de registro (y ya sabemos que no hay pago), 
        // entonces en este caso "No Aplica".
        if (fechaMesActual < fechaRegistro) {
            return '-';
        }
    }
    
    // 3. Si el mes es igual o posterior al registro y no encontramos pago, 
    // entonces significa que falta pagar.
    return '❌';
};
    return (
        <div>
            <Typography variant="h4" gutterBottom>Gestión de Pagos</Typography>
            <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6">Registrar Nuevo Pago</Typography>
                
<Box component="form" onSubmit={handleRegistrarPago} sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
    
    {/* 1. Quitamos 'fullWidth' y le damos un tamaño proporcional y un ancho mínimo */}
    <FormControl sx={{ minWidth: 220, flex: 3 }}> 
        <InputLabel>Socio</InputLabel>
        <Select name="socio" value={newPago.socio} label="Socio" onChange={handleNewPagoChange}>
            {socios && socios.map(s => <MenuItem key={s.ci} value={s.ci}>{s.nombre}</MenuItem>)}
        </Select>
    </FormControl>

    {/* 2. Hacemos lo mismo para el mes */}
    <FormControl sx={{ minWidth: 100, flex: 1 }}>
        <InputLabel>Mes</InputLabel>
        <Select name="mes" value={newPago.mes} label="Mes" onChange={handleNewPagoChange}>
            {mesesNombres.map((nombre, i) => <MenuItem key={i} value={i + 1}>{nombre}</MenuItem>)}
        </Select>
    </FormControl>

    {/* 3. Ajustamos también los campos de texto para que sean proporcionales */}
    <TextField 
        name="año" 
        label="Año" 
        type="number" 
        value={newPago.año} 
        onChange={handleNewPagoChange} 
        sx={{ minWidth: 80, flex: 1 }}
    />

    <TextField 
        name="monto" 
        label="Monto" 
        type="number" 
        value={newPago.monto} 
        onChange={handleNewPagoChange}
        sx={{ minWidth: 100, flex: 1 }} 
    />

    <Button type="submit" variant="contained">Guardar</Button>
</Box>
            </Paper>

            <Typography variant="h5" gutterBottom>Estado de Pagos Anual</Typography>
            <FormControl sx={{ minWidth: 140, mb: 2 }}>
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
                        {/* --- CAMBIO 3: Renderizado seguro para la Tabla de Pagos --- */}
                        {socios && socios.length > 0 ? (
                            socios.map(socio => (
                                <TableRow key={socio.ci}>
                                <TableCell>{socio.nombre}</TableCell>
                                {mesesNombres.map((_, i) => (
                                <TableCell key={i} align="center">
                                 {/* --- CAMBIO AQUÍ: Pasamos el 'socio' completo --- */}
                    {getStatus(socio, i + 1)}
                </TableCell>
            ))}
        </TableRow>
    ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={13} align="center">
                                    Cargando socios...
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default PagosPage;