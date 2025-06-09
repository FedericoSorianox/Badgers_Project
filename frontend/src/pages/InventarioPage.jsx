// src/pages/InventarioPage.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../api';
import { 
    Tabs, Tab, Box, Typography, Paper, Table, TableBody, TableCell, 
    TableContainer, TableHead, TableRow, Button, TextField, Select, 
    MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions 
} from '@mui/material';

// Formulario reutilizable para productos
const ProductoForm = ({ open, onClose, onSave, producto }) => {
    const [formData, setFormData] = useState({});
    const [fotoFile, setFotoFile] = useState(null);

    useEffect(() => {
        setFormData(producto || { nombre: '', precio_costo: 0, precio_venta: 0, stock: 0 });
    }, [producto]);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleFileChange = (e) => setFotoFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key] || ''));
        if (fotoFile) data.append('foto', fotoFile);

        try {
            if (producto) {
                await apiClient.put(`/productos/${producto.id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await apiClient.post('/productos/', data, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            onSave();
        } catch (error) {
            console.error("Error guardando producto", error.response?.data);
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{producto ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
            <DialogContent>
                <TextField name="nombre" label="Nombre" fullWidth margin="normal" value={formData.nombre || ''} onChange={handleChange} />
                <TextField name="precio_costo" label="Precio Costo" type="number" fullWidth margin="normal" value={formData.precio_costo || ''} onChange={handleChange} />
                <TextField name="precio_venta" label="Precio Venta" type="number" fullWidth margin="normal" value={formData.precio_venta || ''} onChange={handleChange} />
                <TextField name="stock" label="Stock Inicial" type="number" fullWidth margin="normal" value={formData.stock || ''} onChange={handleChange} />
                <Button variant="contained" component="label" sx={{mt: 2}}> Subir Foto <input type="file" hidden onChange={handleFileChange} /> </Button>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit}>Guardar</Button>
            </DialogActions>
        </Dialog>
    );
};


const InventarioPage = () => {
    const [tabIndex, setTabIndex] = useState(0);
    const [productos, setProductos] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [formOpen, setFormOpen] = useState(false);
    const [editingProducto, setEditingProducto] = useState(null);
    
    const fetchAllData = async () => {
        try {
            const [prodRes, ventRes] = await Promise.all([apiClient.get('/productos/'), apiClient.get('/ventas/')]);
            setProductos(prodRes.data.results);
            setVentas(ventRes.data.results);
        } catch (error) {
            console.error("Error al cargar datos de inventario", error);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const handleTabChange = (event, newValue) => setTabIndex(newValue);

    const handleSaveProducto = () => {
        setFormOpen(false);
        setEditingProducto(null);
        fetchAllData();
    };

    const handleDeleteProducto = async (id) => {
        if (window.confirm('¿Seguro que quieres eliminar este producto?')) {
            await apiClient.delete(`/productos/${id}/`);
            fetchAllData();
        }
    };
    
    const handleVentaSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const productoId = formData.get('producto');
        const cantidad = parseInt(formData.get('cantidad'));
        const producto = productos.find(p => p.id === parseInt(productoId));
        
        if (producto.stock < cantidad) {
            alert('Stock insuficiente');
            return;
        }

        const payload = {
            producto: producto.id,
            cantidad: cantidad,
            total_venta: producto.precio_venta * cantidad
        };

        try {
            await apiClient.post('/ventas/', payload);
            // El backend debería manejar la actualización del stock, así que solo recargamos
            fetchAllData();
            alert('Venta registrada!');
            e.target.reset();
        } catch (error) {
            console.error("Error al registrar venta", error.response?.data);
        }
    };

    return (
        <div>
            <Typography variant="h4" gutterBottom>Gestión de Inventario y Ventas</Typography>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabIndex} onChange={handleTabChange}>
                    <Tab label="Registrar Venta" />
                    <Tab label="Lista de Productos" />
                    <Tab label="Historial de Ventas" />
                </Tabs>
            </Box>

            {/* Panel 0: Registrar Venta */}
            <Box hidden={tabIndex !== 0} p={3}>
                <Typography variant="h6">Nueva Venta</Typography>
                 <Paper component="form" onSubmit={handleVentaSubmit} sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                    <FormControl fullWidth>
                        <InputLabel>Producto</InputLabel>
                        <Select name="producto" label="Producto" required>
                            {productos.map(p => <MenuItem key={p.id} value={p.id}>{p.nombre} (Stock: {p.stock})</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField name="cantidad" label="Cantidad" type="number" required defaultValue={1} />
                    <Button type="submit" variant="contained">Vender</Button>
                 </Paper>
            </Box>

            {/* Panel 1: Lista de Productos */}
            <Box hidden={tabIndex !== 1} p={3}>
                <Button variant="contained" onClick={() => { setEditingProducto(null); setFormOpen(true); }} sx={{mb: 2}}>Agregar Producto</Button>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead><TableRow><TableCell>Nombre</TableCell><TableCell>Precio Venta</TableCell><TableCell>Stock</TableCell><TableCell>Acciones</TableCell></TableRow></TableHead>
                        <TableBody>
                            {productos.map(p => (
                                <TableRow key={p.id}>
                                    <TableCell>{p.nombre}</TableCell>
                                    <TableCell>${p.precio_venta}</TableCell>
                                    <TableCell>{p.stock}</TableCell>
                                    <TableCell>
                                        <Button size="small" onClick={() => {setEditingProducto(p); setFormOpen(true); }}>Editar</Button>
                                        <Button size="small" color="error" onClick={() => handleDeleteProducto(p.id)}>Eliminar</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {/* Panel 2: Historial de Ventas */}
            <Box hidden={tabIndex !== 2} p={3}>
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead><TableRow><TableCell>Fecha</TableCell><TableCell>Producto</TableCell><TableCell>Cantidad</TableCell><TableCell>Total</TableCell></TableRow></TableHead>
                        <TableBody>
                            {ventas.map(v => {
                                const producto = productos.find(p => p.id === v.producto);
                                return (
                                    <TableRow key={v.id}>
                                        <TableCell>{new Date(v.fecha_venta).toLocaleString()}</TableCell>
                                        <TableCell>{producto ? producto.nombre : 'Producto Eliminado'}</TableCell>
                                        <TableCell>{v.cantidad}</TableCell>
                                        <TableCell>${v.total_venta}</TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <ProductoForm open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSaveProducto} producto={editingProducto} />
        </div>
    );
};

export default InventarioPage;