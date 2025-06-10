// src/pages/SociosPage.jsx

import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { 
    Button, TextField, Dialog, DialogActions, DialogContent, 
    DialogTitle, Card, CardContent, CardActions, Typography, 
    Grid, Avatar, Box, Select, MenuItem, InputLabel, FormControl, Container
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';


// Componente de Formulario para Crear, Editar y Ver Socios
const SocioForm = ({ open, onClose, onSave, socio, isViewOnly = false }) => {
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
                <TextField margin="dense" name="ci" label="CI" fullWidth value={formData.ci || ''} disabled />
                <TextField margin="dense" name="nombre" label="Nombre Completo" fullWidth value={formData.nombre || ''} disabled={isViewOnly} />
                <TextField margin="dense" name="celular" label="Celular" fullWidth value={formData.celular || ''} disabled={isViewOnly} />
                <TextField margin="dense" name="fecha_nacimiento" label="Fecha de Nacimiento" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.fecha_nacimiento || ''} disabled={isViewOnly} />
                <FormControl fullWidth margin="dense">
                    <InputLabel>Tipo de Cuota</InputLabel>
                    <Select name="tipo_cuota" label="Tipo de Cuota" value={formData.tipo_cuota || 'Libre - $2000'} onChange={handleChange} disabled={isViewOnly}>
                        <MenuItem value="Libre - $2000">Libre - $2000</MenuItem>
                        <MenuItem value="Solo Pesas - $800">Solo Pesas - $800</MenuItem>
                    </Select>
                </FormControl>
                <TextField margin="dense" name="contacto_emergencia" label="Contacto de Emergencia" fullWidth value={formData.contacto_emergencia || ''} disabled={isViewOnly} />
                <TextField margin="dense" name="emergencia_movil" label="Teléfono de Emergencia" fullWidth value={formData.emergencia_movil || ''} disabled={isViewOnly} />
                <TextField margin="dense" name="enfermedades" label="Enfermedades/Alergias" multiline rows={2} fullWidth value={formData.enfermedades || ''} disabled={isViewOnly} />
                <TextField margin="dense" name="comentarios" label="Comentarios" multiline rows={2} fullWidth value={formData.comentarios || ''} disabled={isViewOnly} />
                
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
        if (window.confirm('¿Estás seguro de que quieres eliminar a este socio?')) {
            try {
                await apiClient.delete(`/socios/${ci}/`);
                fetchSocios();
            } catch (error) {
                console.error("Error al eliminar socio:", error);
            }
        }
    };

    return (
        <Box sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            py: { xs: 2, md: 4 },
        }}>
            <Container maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 4, lg: 8 } }}>
                <Typography variant="h4" gutterBottom>Gestión de Socios</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <TextField 
                        label="Buscar por nombre o CI..." 
                        variant="outlined" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: '40%' }}
                    />
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingSocio(null); setFormOpen(true); }}>
                        Agregar Socio
                    </Button>
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
                />

                {/* Formulario para VER en modo solo lectura */}
                {viewingSocio && (
                    <SocioForm 
                        open={!!viewingSocio}
                        onClose={() => setViewingSocio(null)}
                        socio={viewingSocio}
                        isViewOnly={true}
                    />
                )}
            </Container>
        </Box>
    );
};

export default SociosPage;