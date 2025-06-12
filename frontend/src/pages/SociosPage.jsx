// src/pages/SociosPage.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { 
    Button, TextField, Dialog, DialogActions, DialogContent, 
    DialogTitle, Card, CardContent, CardActions, Typography, 
    Grid, Avatar, Box, Select, MenuItem, InputLabel, FormControl, Container,
    Alert, Snackbar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import GroupAddIcon from '@mui/icons-material/GroupAdd';


// Componente de Formulario para Crear, Editar y Ver Socios
const SocioForm = ({ open, onClose, onSave, socio, isViewOnly = false, sociosList = [] }) => {
    const [formData, setFormData] = useState({});
    const [fotoFile, setFotoFile] = useState(null);

    useEffect(() => {
        setFormData(socio || {
            ci: '', nombre: '', celular: '', contacto_emergencia: '', emergencia_movil: '',
            fecha_nacimiento: '', tipo_cuota: 'Libre - $2000', enfermedades: '', comentarios: ''
        });
        // Reseteamos el archivo de foto cada vez que el socio cambia
        setFotoFile(null);
    }, [socio]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFotoFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validación manual de CI
        if (!formData.ci || formData.ci.trim() === '') {
            alert('El campo CI es obligatorio.');
            return;
        }

        // Validar unicidad de CI usando la prop sociosList
        if (Array.isArray(sociosList)) {
            const ciExiste = sociosList.some(s => s.ci === formData.ci && (!socio || s.ci !== socio.ci));
            if (ciExiste) {
                alert('El CI ingresado ya existe. Debe ser único.');
                return;
            }
        }
        
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key !== 'foto') data.append(key, formData[key] || '');
        });

        if (fotoFile) {
            data.append('foto', fotoFile);
        }

        onSave(data, socio?.ci);
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{isViewOnly ? 'Detalles del Socio' : (socio ? 'Editar Socio' : 'Agregar Nuevo Socio')}</DialogTitle>
            <DialogContent>
                {/* --- Muestra la foto del socio si existe --- */}
                {socio && socio.foto && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <Avatar 
                            src={socio.foto} 
                            sx={{ width: 100, height: 100, border: '2px solid #ddd' }} 
                            alt={formData.nombre}
                        />
                    </Box>
                )}
                
                {/* Campos del formulario (deshabilitados en modo 'solo lectura') */}
                <TextField margin="dense" name="ci" label="CI" fullWidth value={formData.ci || ''} onChange={handleChange} disabled={isViewOnly} required />
                <TextField margin="dense" name="nombre" label="Nombre Completo" fullWidth value={formData.nombre || ''} onChange={handleChange} disabled={isViewOnly} />
                <TextField margin="dense" name="celular" label="Celular" fullWidth value={formData.celular || ''} onChange={handleChange} disabled={isViewOnly} />
                <TextField margin="dense" name="fecha_nacimiento" label="Fecha de Nacimiento" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.fecha_nacimiento || ''} onChange={handleChange} disabled={isViewOnly} />
                <FormControl fullWidth margin="dense">
                    <InputLabel>Tipo de Cuota</InputLabel>
                    <Select name="tipo_cuota" label="Tipo de Cuota" value={formData.tipo_cuota || 'Libre - $2000'} onChange={handleChange} disabled={isViewOnly}>
                        <MenuItem value="Libre - $2000">Libre - $2000</MenuItem>
                        <MenuItem value="Solo Pesas - $800">Solo Pesas - $800</MenuItem>
                    </Select>
                </FormControl>
                <TextField margin="dense" name="contacto_emergencia" label="Contacto de Emergencia" fullWidth value={formData.contacto_emergencia || ''} onChange={handleChange} disabled={isViewOnly} />
                <TextField margin="dense" name="emergencia_movil" label="Teléfono de Emergencia" fullWidth value={formData.emergencia_movil || ''} onChange={handleChange} disabled={isViewOnly} />
                <TextField margin="dense" name="enfermedades" label="Enfermedades/Alergias" multiline rows={2} fullWidth value={formData.enfermedades || ''} onChange={handleChange} disabled={isViewOnly} />
                <TextField margin="dense" name="comentarios" label="Comentarios" multiline rows={2} fullWidth value={formData.comentarios || ''} onChange={handleChange} disabled={isViewOnly} />
                
                {!isViewOnly && (
                    <Box sx={{mt: 2}}>
                        <Typography variant="body2">
                            {fotoFile ? `Archivo seleccionado: ${fotoFile.name}` : 'Sube una nueva foto (opcional):'}
                        </Typography>
                        <Button variant="contained" component="label" >
                            Seleccionar Foto
                            <input type="file" hidden onChange={handleFileChange} />
                        </Button>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{isViewOnly ? 'Cerrar' : 'Cancelar'}</Button>
                {!isViewOnly && (
                    <Button onClick={handleSubmit} variant="contained">Guardar</Button>
                )}
            </DialogActions>
        </Dialog>
    );
};


// Componente Principal de la Página de Socios
const SociosPage = () => {
    const [socios, setSocios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingSocio, setEditingSocio] = useState(null);
    const [viewingSocio, setViewingSocio] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    const fetchSocios = async () => {
        try {
            const response = await apiClient.get(`socios/?search=${searchTerm}`);
            setSocios(response.data.results ? response.data.results : response.data);
        } catch (error) {
            console.error("Error al cargar socios:", error);
            setSocios([]); 
        }
    };

    useEffect(() => {
        fetchSocios();
    }, [searchTerm]);

    const handleSaveSocio = async (formData, ci) => {
        try {
            if (ci) {
                await apiClient.put(`/socios/${ci}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            } else {
                await apiClient.post('/socios/', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            }
            fetchSocios();
            setFormOpen(false);
            setEditingSocio(null);
        } catch (error) {
            console.error("Error al guardar socio:", error.response?.data || error.message);
        }
    };
    
    const handleDeleteSocio = async (ci) => {
        if (!ci) {
            alert("No se puede eliminar un socio sin CI. Por favor, edita el socio y asigna un CI válido o elimínalo manualmente desde la base de datos.");
            return;
        }
        if (window.confirm('¿Estás seguro de que quieres eliminar a este socio?')) {
            try {
                await apiClient.delete(`/socios/${ci}/`);
                fetchSocios();
            } catch (error) {
                console.error("Error al eliminar socio:", error);
            }
        }
    };

    const handleAddToWhatsAppGroup = () => {
        // Filtrar socios que tienen número de celular
        const sociosConCelular = socios.filter(socio => socio.celular);
        
        if (sociosConCelular.length === 0) {
            setSnackbar({
                open: true,
                message: 'No hay socios con número de celular registrado',
                severity: 'warning'
            });
            return;
        }

        // Crear el enlace de invitación al grupo
        // Nota: Este enlace debe ser reemplazado con el enlace real del grupo de WhatsApp
        const grupoLink = 'https://chat.whatsapp.com/Lhd6sWZwVjlFPKt1fkHJY9';
        
        // Abrir WhatsApp Web con el enlace del grupo
        window.open(grupoLink, '_blank');

        setSnackbar({
            open: true,
            message: `Se abrirá WhatsApp para agregar a ${sociosConCelular.length} socios al grupo`,
            severity: 'info'
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
                    Gestión de Socios
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, width: '100%' }}>
                    <TextField 
                        label="Buscar por nombre o CI..." 
                        variant="outlined" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: '40%' }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button 
                            variant="contained" 
                            color="success"
                            startIcon={<GroupAddIcon />}
                            onClick={handleAddToWhatsAppGroup}
                        >
                            Agregar al Grupo de WhatsApp
                        </Button>
                        <Button 
                            variant="contained" 
                            startIcon={<AddIcon />} 
                            onClick={() => { setEditingSocio(null); setFormOpen(true); }}
                        >
                            Agregar Socio
                        </Button>
                    </Box>
                </Box>

                <Grid container spacing={2}>
                    {socios && socios.length > 0 ? (
                        socios.map(socio => (
                            <Grid item xs={12} md={6} lg={4} key={socio.ci}>
                                <Card onClick={() => setViewingSocio(socio)} sx={{ cursor: 'pointer', height: '100%' }}>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Avatar src={socio.foto} sx={{ width: 60, height: 60, mr: 2 }} />
                                            <Box>
                                                <Typography variant="h6">{socio.nombre}</Typography>
                                                <Typography variant="body2" color="textSecondary">CI: {socio.ci}</Typography>
                                            </Box>
                                        </Box>
                                        <Typography variant="body1">Celular: {socio.celular || 'N/A'}</Typography>
                                        <Typography variant="body1">Cuota: {socio.tipo_cuota || 'N/A'}</Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" onClick={(e) => { e.stopPropagation(); setEditingSocio(socio); setFormOpen(true); }}>Editar</Button>
                                        <Button size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteSocio(socio.ci); }}>Eliminar</Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography sx={{ textAlign: 'center', mt: 4 }}>
                                Cargando socios o no se encontraron resultados...
                            </Typography>
                        </Grid>
                    )}
                </Grid>

                {/* Formulario para EDITAR/CREAR */}
                <SocioForm 
                    open={formOpen} 
                    onClose={() => setFormOpen(false)} 
                    onSave={handleSaveSocio} 
                    socio={editingSocio} 
                    sociosList={socios}
                />

                {/* Formulario para VER en modo solo lectura */}
                {viewingSocio && (
                    <SocioForm 
                        open={!!viewingSocio}
                        onClose={() => setViewingSocio(null)}
                        socio={viewingSocio}
                        isViewOnly={true}
                        sociosList={socios}
                    />
                )}

                <Snackbar 
                    open={snackbar.open} 
                    autoHideDuration={6000} 
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                >
                    <Alert 
                        onClose={() => setSnackbar({ ...snackbar, open: false })} 
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Container>
        </Box>
    );
};

export default SociosPage;