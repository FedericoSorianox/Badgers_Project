// src/pages/InventarioPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import {
    Container, Paper, Typography, Box, Tabs, Tab, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem,
    IconButton, Avatar
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// --- Componente de Panel para cada Tab (sin cambios) ---
function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

// --- Componente de Formulario para Productos (con fotos y modo vista) ---
const ProductForm = ({ open, onClose, onSave, product, isViewOnly = false }) => {
    const [formData, setFormData] = useState({ nombre: '', precio_costo: '', precio_venta: '', stock: '' });
    const [fotoFile, setFotoFile] = useState(null);

    useEffect(() => {
        setFormData(product || { nombre: '', precio_costo: '0', precio_venta: '0', stock: '0' });
        setFotoFile(null);
    }, [product]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleFileChange = (e) => setFotoFile(e.target.files[0]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, fotoFile, product?.id);
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{isViewOnly ? 'Detalles del Producto' : (product ? 'Editar Producto' : 'Agregar Producto')}</DialogTitle>
            <DialogContent>
                {product && product.foto && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <Avatar src={product.foto} sx={{ width: 100, height: 100 }} variant="rounded" alt={formData.nombre} />
                    </Box>
                )}
                <TextField autoFocus margin="dense" name="nombre" label="Nombre" fullWidth value={formData.nombre} onChange={handleChange} disabled={isViewOnly} />
                <TextField margin="dense" name="precio_costo" label="Precio de Costo" type="number" fullWidth value={formData.precio_costo} onChange={handleChange} disabled={isViewOnly} />
                <TextField margin="dense" name="precio_venta" label="Precio de Venta" type="number" fullWidth value={formData.precio_venta} onChange={handleChange} disabled={isViewOnly} />
                <TextField margin="dense" name="stock" label="Stock" type="number" fullWidth value={formData.stock} onChange={handleChange} disabled={isViewOnly} />
                {!isViewOnly && (
                    <Button variant="contained" component="label" sx={{ mt: 2 }}>
                        Subir Foto
                        <input type="file" hidden onChange={handleFileChange} />
                    </Button>
                )}
                {fotoFile && <Typography variant="body2" sx={{mt:1}}>{fotoFile.name}</Typography>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{isViewOnly ? 'Cerrar' : 'Cancelar'}</Button>
                {!isViewOnly && <Button onClick={handleSubmit} variant="contained">Guardar</Button>}
            </DialogActions>
        </Dialog>
    );
};

// --- Componente para la Lista de Productos (Mejorado con todas las acciones) ---
const ProductListComponent = ({ onProductUpdate, onEdit }) => {
    const [productos, setProductos] = useState([]);
    
    const fetchProductos = useCallback(async () => {
        try {
            const response = await apiClient.get('/productos/');
            setProductos(response.data.results ? response.data.results : response.data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    }, []);

    useEffect(() => {
        fetchProductos();
    }, [fetchProductos]);

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            try {
                await apiClient.delete(`/productos/${id}/`);
                fetchProductos();
                onProductUpdate();
            } catch (error) {
                console.error("Error al eliminar producto:", error);
            }
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Foto</TableCell>
                        <TableCell>Nombre</TableCell>
                        <TableCell align="right">Precio de Costo</TableCell>
                        <TableCell align="right">Precio de Venta</TableCell>
                        <TableCell align="right">Ganancia</TableCell>
                        <TableCell align="right">Stock</TableCell>
                        <TableCell align="center">Acciones</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {productos.map((p) => (
                        <TableRow key={p.id} hover >
                            <TableCell><Avatar src={p.foto} variant="rounded" /></TableCell>
                            <TableCell>{p.nombre}</TableCell>
                            <TableCell align="right">${parseFloat(p.precio_costo).toFixed(2)}</TableCell>
                            <TableCell align="right">${parseFloat(p.precio_venta).toFixed(2)}</TableCell>
                            <TableCell align="right">${p.ganancia?.toFixed(2) || '0.00'}</TableCell>
                            <TableCell align="right">{p.stock}</TableCell>
                            <TableCell align="center">
                                <IconButton onClick={() => onEdit(p)}><EditIcon /></IconButton>
                                <IconButton onClick={() => handleDelete(p.id)}><DeleteIcon color="error" /></IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

// --- Componente para Registrar Venta ---
const VentaFormComponent = ({ productos, onVentaSuccess }) => {
    const [venta, setVenta] = useState({ producto: '', cantidad: 1 });

    const handleChange = (e) => setVenta({ ...venta, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!venta.producto || venta.cantidad <= 0) {
            alert("Por favor, selecciona un producto y una cantidad válida.");
            return;
        }
        try {
            await apiClient.post('/ventas/', {
                producto: venta.producto,
                cantidad: parseInt(venta.cantidad)
            });
            alert('¡Venta registrada con éxito!');
            onVentaSuccess(); // Llama a la función para actualizar el stock
            setVenta({ producto: '', cantidad: 1 });
        } catch (error) {
            console.error("Error al registrar venta:", error.response?.data);
            alert(`Error: ${JSON.stringify(error.response.data)}`);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <FormControl fullWidth>
                <InputLabel>Producto</InputLabel>
                <Select name="producto" value={venta.producto} label="Producto" onChange={handleChange}>
                    {productos.map(p => <MenuItem key={p.id} value={p.id} disabled={p.stock <= 0}>{p.nombre} (Stock: {p.stock})</MenuItem>)}
                </Select>
            </FormControl>
            <TextField name="cantidad" label="Cantidad" type="number" InputProps={{ inputProps: { min: 1 } }} value={venta.cantidad} onChange={handleChange} sx={{width: 150}}/>
            <Button type="submit" variant="contained">Vender</Button>
        </Box>
    );
};


// --- Componente Principal de la Página de Inventario ---
const InventarioPage = () => {
    const [tabValue, setTabValue] = useState(1);
    const [productos, setProductos] = useState([]);
    const [formOpen, setFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchAllProducts = useCallback(async () => {
        try {
            const response = await apiClient.get('/productos/?limit=1000');
            setProductos(response.data.results ? response.data.results : response.data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    }, []);

    useEffect(() => {
        fetchAllProducts();
    }, [fetchAllProducts]);

    const handleTabChange = (event, newValue) => setTabValue(newValue);

    const handleOpenEditForm = (product) => {
        setEditingProduct(product);
        setFormOpen(true);
    };

    const handleSave = async (data, file, id) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => formData.append(key, data[key]));
        if (file) {
            formData.append('foto', file);
        }

        try {
            if (id) {
                await apiClient.patch(`/productos/${id}/`, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            } else {
                await apiClient.post('/productos/', formData, { headers: { 'Content-Type': 'multipart/form-data' }});
            }
            fetchAllProducts();
            setFormOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error("Error al guardar producto:", error.response?.data);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3, width: '100%' }}>
                <Typography variant="h4" gutterBottom>
                    Gestión de Inventario y Ventas
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange}>
                        <Tab label="Registrar Venta" />
                        <Tab label="Lista de Productos" />
                        <Tab label="Historial de Ventas" />
                    </Tabs>
                    {tabValue === 1 && (
                         <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenEditForm(null)} sx={{ mb: 1 }}>
                            Agregar Producto
                        </Button>
                    )}
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <VentaFormComponent productos={productos} onVentaSuccess={fetchAllProducts} />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                    <ProductListComponent onProductUpdate={fetchAllProducts} onEdit={handleOpenEditForm} />
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                    <Typography>Historial de ventas (próximamente)...</Typography>
                </TabPanel>

            </Paper>
            <ProductForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} product={editingProduct} />
        </Container>
    );
};

// --- ¡LA LÍNEA MÁS IMPORTANTE QUE FALTABA! ---
export default InventarioPage;