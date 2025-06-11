// src/pages/PagosPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { 
    Button, TextField, Select, MenuItem, FormControl, InputLabel, Paper, 
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box,
    Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Tooltip, Container
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import RemoveIcon from '@mui/icons-material/Remove';
import InfoIcon from '@mui/icons-material/Info';
import StarIcon from '@mui/icons-material/Star';

// Lista de socios que no pagan mensualidad
const SOCIOS_SIN_PAGO = [
    'Gonzalo Fernandez',
    'Federico Soriano',
    'Mariana Peralta',
    'Guillermo Viera'
];

// Componente para el diálogo de confirmación de pago
const ConfirmPagoDialog = ({ open, onClose, onConfirm, socio, mes, año }) => {
    const [monto, setMonto] = useState(2000.0);

    const handleConfirm = () => {
        onConfirm(socio, mes, año, monto);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Confirmar Pago</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    ¿Deseas registrar el pago para {socio?.nombre} del mes {mes} de {año}?
                </Typography>
                <TextField
                    label="Monto"
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(parseFloat(e.target.value))}
                    fullWidth
                    margin="normal"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleConfirm} variant="contained" color="primary">
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// Componente para el diálogo informativo
const InfoDialog = ({ open, onClose, onConfirm, socio, mes, año, isSocioSinPago }) => {
    const [monto, setMonto] = useState(2000.0);
    const fechaRegistro = new Date(socio?.fecha_registro);
    const fechaMesActual = new Date(año, mes - 1, 2);
    const diasDiferencia = Math.floor((fechaMesActual - fechaRegistro) / (1000 * 60 * 60 * 24));

    const handleConfirm = () => {
        onConfirm(socio, mes, año, monto);
        onClose();
    };

    if (isSocioSinPago) {
        return (
            <Dialog open={open} onClose={onClose}>
                <DialogTitle>Información del Socio</DialogTitle>
                <DialogContent>
                    <Typography variant="body1" gutterBottom>
                        {socio?.nombre} es un socio sin pago mensual.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Este socio tiene acceso completo al gimnasio sin necesidad de realizar pagos mensuales.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Cerrar</Button>
                </DialogActions>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Información del Mes</DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    Este mes no aplica para {socio?.nombre} porque:
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    • Fecha de registro: {fechaRegistro.toLocaleDateString()}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    • Mes seleccionado: {mes}/{año}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    • Diferencia: {Math.abs(diasDiferencia)} días {diasDiferencia < 0 ? 'antes' : 'después'} del registro
                </Typography>
                
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                        ¿Deseas registrar un pago de todos modos?
                    </Typography>
                    <TextField
                        label="Monto"
                        type="number"
                        value={monto}
                        onChange={(e) => setMonto(parseFloat(e.target.value))}
                        fullWidth
                        margin="normal"
                        size="small"
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
                <Button 
                    onClick={handleConfirm} 
                    variant="contained" 
                    color="primary"
                >
                    Registrar Pago
                </Button>
            </DialogActions>
        </Dialog>
    );
};

const PagosPage = () => {
    const [socios, setSocios] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [newPago, setNewPago] = useState({ socio: '', mes: new Date().getMonth() + 1, año: selectedYear, monto: 2000.0 });
    const [confirmDialog, setConfirmDialog] = useState({ open: false, socio: null, mes: null });
    const [infoDialog, setInfoDialog] = useState({ open: false, socio: null, mes: null });

    const fetchSociosAndPagos = async () => {
        try {
            const [sociosRes, pagosRes] = await Promise.all([
                apiClient.get('/socios/?limit=1000'), 
                apiClient.get(`/pagos/?año=${selectedYear}&limit=10000`)
            ]);
            
            // Filtrar los socios que no pagan mensualidad
            const sociosFiltrados = (sociosRes.data.results ? sociosRes.data.results : sociosRes.data)
                .filter(socio => !SOCIOS_SIN_PAGO.includes(socio.nombre));
            
            setSocios(sociosFiltrados);
            setPagos(pagosRes.data.results ? pagosRes.data.results : pagosRes.data);

        } catch (error) {
            console.error("Error al cargar datos:", error);
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
    
    const handleRegistrarPago = async (socio, mes, año, monto) => {
        const id_pago = `${socio.ci}_${mes}_${año}`;
        const payload = {
            id: id_pago,
            socio: socio.ci,
            mes: parseInt(mes),
            año: parseInt(año),
            monto: parseFloat(monto),
            fecha_pago: new Date().toISOString().split('T')[0]
        };
        try {
            await apiClient.post('/pagos/', payload);
            fetchSociosAndPagos();
        } catch (error) {
            console.error("Error al registrar pago:", error.response?.data || error.message);
            alert("Error al registrar el pago. Es posible que ya exista un pago para ese socio en ese mes y año.");
        }
    };

    const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    const years = Array.from({length: 10}, (_, i) => new Date().getFullYear() - i);

    const getStatus = (socio, mes) => {
        // Si el socio está en la lista de socios sin pago
        if (SOCIOS_SIN_PAGO.includes(socio.nombre)) {
            return (
                <Tooltip title="Socio sin pago mensual">
                    <IconButton 
                        size="small" 
                        color="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                            setInfoDialog({
                                open: true,
                                socio: socio,
                                mes: mes,
                                isSocioSinPago: true
                            });
                        }}
                    >
                        <StarIcon />
                    </IconButton>
                </Tooltip>
            );
        }

        const pagoExistente = pagos.find(p => p.socio === socio.ci && p.mes === mes);
        
        if (pagoExistente) {
            return (
                <IconButton 
                    size="small" 
                    color="success"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('¿Deseas eliminar este pago?')) {
                            handleRegistrarPago(socio, mes, selectedYear, 0);
                        }
                    }}
                >
                    <CheckCircleIcon />
                </IconButton>
            );
        }

        if (socio.fecha_registro) {
            const fechaRegistro = new Date(socio.fecha_registro);
            const fechaMesActual = new Date(selectedYear, mes - 1, 2);

            if (fechaMesActual < fechaRegistro) {
                return (
                    <Tooltip title="Click para más información">
                        <IconButton 
                            size="small" 
                            color="disabled"
                            onClick={(e) => {
                                e.stopPropagation();
                                setInfoDialog({
                                    open: true,
                                    socio: socio,
                                    mes: mes,
                                    isSocioSinPago: false
                                });
                            }}
                        >
                            <RemoveIcon />
                        </IconButton>
                    </Tooltip>
                );
            }
        }
        
        return (
            <IconButton 
                size="small" 
                color="error"
                onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDialog({
                        open: true,
                        socio: socio,
                        mes: mes
                    });
                }}
            >
                <CancelIcon />
            </IconButton>
        );
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
                    Gestión de Pagos
                </Typography>
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6">Registrar Nuevo Pago</Typography>
                    
                    <Box component="form" onSubmit={handleRegistrarPago} sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
                        <FormControl sx={{ minWidth: 220, flex: 3 }}> 
                            <InputLabel>Socio</InputLabel>
                            <Select name="socio" value={newPago.socio} label="Socio" onChange={handleNewPagoChange}>
                                {socios && socios.map(s => <MenuItem key={s.ci} value={s.ci}>{s.nombre}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 100, flex: 1 }}>
                            <InputLabel>Mes</InputLabel>
                            <Select name="mes" value={newPago.mes} label="Mes" onChange={handleNewPagoChange}>
                                {mesesNombres.map((nombre, i) => <MenuItem key={i} value={i + 1}>{nombre}</MenuItem>)}
                            </Select>
                        </FormControl>

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
                            {socios && socios.length > 0 ? (
                                socios.map(socio => (
                                    <TableRow key={socio.ci}>
                                        <TableCell>{socio.nombre}</TableCell>
                                        {mesesNombres.map((_, i) => (
                                            <TableCell key={i} align="center">
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

                <ConfirmPagoDialog
                    open={confirmDialog.open}
                    onClose={() => setConfirmDialog({ open: false, socio: null, mes: null })}
                    onConfirm={handleRegistrarPago}
                    socio={confirmDialog.socio}
                    mes={confirmDialog.mes}
                    año={selectedYear}
                />

                <InfoDialog
                    open={infoDialog.open}
                    onClose={() => setInfoDialog({ open: false, socio: null, mes: null })}
                    onConfirm={handleRegistrarPago}
                    socio={infoDialog.socio}
                    mes={infoDialog.mes}
                    año={selectedYear}
                    isSocioSinPago={infoDialog.isSocioSinPago}
                />
            </Container>
        </Box>
    );
};

export default PagosPage;