// src/pages/SociosPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { 
    Button, TextField, Dialog, DialogActions, DialogContent, 
    DialogTitle, Card, CardContent, CardActions, Typography, 
    Grid, Avatar, Box 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const SocioForm = ({ open, onClose, onSave, socio }) => {
    const [formData, setFormData] = useState({});
    const [fotoFile, setFotoFile] = useState(null);

    useEffect(() => {
        setFormData(socio || {
            ci: '', nombre: '', celular: '', contacto_emergencia: '', emergencia_movil: '',
            fecha_nacimiento: '', tipo_cuota: 'Libre - $2000', enfermedades: '', comentarios: ''
        });
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
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{socio ? 'Editar Socio' : 'Agregar Nuevo Socio'}</DialogTitle>
            <DialogContent>
                <TextField margin="dense" name="ci" label="CI" fullWidth value={formData.ci} onChange={handleChange} disabled={!!socio} />
                <TextField margin="dense" name="nombre" label="Nombre Completo" fullWidth value={formData.nombre} onChange={handleChange} />
                <TextField margin="dense" name="celular" label="Celular" fullWidth value={formData.celular} onChange={handleChange} />
                <TextField margin="dense" name="fecha_nacimiento" label="Fecha de Nacimiento" type="date" fullWidth InputLabelProps={{ shrink: true }} value={formData.fecha_nacimiento} onChange={handleChange} />
                <TextField margin="dense" name="tipo_cuota" label="Tipo de Cuota" select SelectProps={{ native: true }} fullWidth value={formData.tipo_cuota} onChange={handleChange}>
                    <option>Libre - $2000</option>
                    <option>Solo Pesas - $800</option>
                </TextField>
                <TextField margin="dense" name="contacto_emergencia" label="Contacto de Emergencia" fullWidth value={formData.contacto_emergencia} onChange={handleChange} />
                <TextField margin="dense" name="emergencia_movil" label="Teléfono de Emergencia" fullWidth value={formData.emergencia_movil} onChange={handleChange} />
                <TextField margin="dense" name="enfermedades" label="Enfermedades/Alergias" multiline rows={2} fullWidth value={formData.enfermedades} onChange={handleChange} />
                <TextField margin="dense" name="comentarios" label="Comentarios" multiline rows={2} fullWidth value={formData.comentarios} onChange={handleChange} />
                <Button variant="contained" component="label" sx={{mt: 2}}>
                    Subir Foto
                    <input type="file" hidden onChange={handleFileChange} />
                </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained">Guardar</Button>
            </DialogActions>
        </Dialog>
    );
};

const SociosPage = () => {
    const [socios, setSocios] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [formOpen, setFormOpen] = useState(false);
    const [editingSocio, setEditingSocio] = useState(null);

    const fetchSocios = async () => {
        try {
            const response = await apiClient.get(`/socios/?search=${searchTerm}`);
            setSocios(response.data.results);
        } catch (error) {
            console.error("Error al cargar socios:", error);
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
            console.error("Error al guardar socio:", error.response.data);
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
        <div>
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
                {socios.map(socio => (
                    <Grid item xs={12} md={6} lg={4} key={socio.ci}>
                        <Card>
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
                                <Button size="small" onClick={() => { setEditingSocio(socio); setFormOpen(true); }}>Editar</Button>
                                <Button size="small" color="error" onClick={() => handleDeleteSocio(socio.ci)}>Eliminar</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <SocioForm 
                open={formOpen} 
                onClose={() => setFormOpen(false)} 
                onSave={handleSaveSocio} 
                socio={editingSocio} 
            />
        </div>
    );
};

export default SociosPage;