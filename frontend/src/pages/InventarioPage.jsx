// src/pages/InventarioPage.jsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../api';
import {
    Container, Paper, Typography, Box, Tabs, Tab, TextField, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, MenuItem,
    IconButton, Avatar, Card, CardContent, Grid, Drawer, Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

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

// --- Componente para el Panel de Detalles del Producto ---
const ProductDetailPanel = ({ product, open, onClose, onEdit, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [fotoFile, setFotoFile] = useState(null);

    useEffect(() => {
        if (product) {
            setFormData(product);
        }
    }, [product]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFotoFile(e.target.files[0]);
    };

    const handleSave = async () => {
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== 'foto') data.append(key, formData[key]);
            });
            if (fotoFile) {
                data.append('foto', fotoFile);
            }

            await apiClient.patch(`/productos/${product.id}/`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            setIsEditing(false);
            onEdit(formData);
        } catch (error) {
            console.error("Error al guardar producto:", error);
            alert("Error al guardar los cambios");
        }
    };

    if (!product) return null;

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: { width: { xs: '100%', sm: 400 } }
            }}
        >
            <Box sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                        {isEditing ? 'Editar Producto' : 'Detalles del Producto'}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Foto del producto */}
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                        <Avatar 
                            src={product.foto} 
                            sx={{ width: 150, height: 150 }} 
                            variant="rounded"
                        />
                    </Box>

                    {/* Campos del formulario */}
                    <TextField
                        label="Nombre"
                        name="nombre"
                        value={formData.nombre || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        fullWidth
                    />
                    <TextField
                        label="Precio de Costo"
                        name="precio_costo"
                        type="number"
                        value={formData.precio_costo || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        fullWidth
                    />
                    <TextField
                        label="Precio de Venta"
                        name="precio_venta"
                        type="number"
                        value={formData.precio_venta || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        fullWidth
                    />
                    <TextField
                        label="Stock"
                        name="stock"
                        type="number"
                        value={formData.stock || ''}
                        onChange={handleChange}
                        disabled={!isEditing}
                        fullWidth
                    />

                    {/* Información adicional */}
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">
                            Ganancia por unidad:
                        </Typography>
                        <Typography variant="h6" color="success.main">
                            ${(formData.precio_venta - formData.precio_costo).toFixed(2)}
                        </Typography>
                    </Box>

                    {/* Botones de acción */}
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        {isEditing ? (
                            <>
                                <Button 
                                    variant="contained" 
                                    onClick={handleSave}
                                    fullWidth
                                >
                                    Guardar
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData(product);
                                    }}
                                    fullWidth
                                >
                                    Cancelar
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button 
                                    variant="contained" 
                                    onClick={() => setIsEditing(true)}
                                    fullWidth
                                >
                                    Editar
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    color="error"
                                    onClick={() => {
                                        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                                            onDelete(product.id);
                                        }
                                    }}
                                    fullWidth
                                >
                                    Eliminar
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </Drawer>
    );
};

// --- Componente para la Lista de Productos (Actualizado) ---
const ProductListComponent = ({ onProductUpdate, onEdit }) => {
    const [productos, setProductos] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
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
        try {
            await apiClient.delete(`/productos/${id}/`);
            fetchProductos();
            onProductUpdate();
            setSelectedProduct(null);
        } catch (error) {
            console.error("Error al eliminar producto:", error);
        }
    };

    return (
        <>
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
                            <TableRow 
                                key={p.id} 
                                hover 
                                onClick={() => setSelectedProduct(p)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell><Avatar src={p.foto} variant="rounded" /></TableCell>
                                <TableCell>{p.nombre}</TableCell>
                                <TableCell align="right">${parseFloat(p.precio_costo).toFixed(2)}</TableCell>
                                <TableCell align="right">${parseFloat(p.precio_venta).toFixed(2)}</TableCell>
                                <TableCell align="right">${p.ganancia?.toFixed(2) || '0.00'}</TableCell>
                                <TableCell align="right">{p.stock}</TableCell>
                                <TableCell align="center">
                                    <IconButton onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedProduct(p);
                                    }}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(p.id);
                                    }}>
                                        <DeleteIcon color="error" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <ProductDetailPanel
                product={selectedProduct}
                open={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onEdit={(updatedProduct) => {
                    fetchProductos();
                    onProductUpdate();
                }}
                onDelete={handleDelete}
            />
        </>
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

// --- Componente para el Stock Semanal ---
const StockSemanalComponent = ({ productos, ventas }) => {
    const [selectedWeek, setSelectedWeek] = useState(0); // Índice de la semana seleccionada
    
    // Función para obtener los miércoles del mes actual y el anterior
    const getWednesdays = () => {
        const wednesdays = [];
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Obtener miércoles del mes actual
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        
        // Ajustar al primer miércoles del mes
        let firstWednesday = new Date(firstDayOfMonth);
        while (firstWednesday.getDay() !== 3) { // 3 = miércoles
            firstWednesday.setDate(firstWednesday.getDate() + 1);
        }
        
        // Agregar todos los miércoles del mes
        while (firstWednesday <= lastDayOfMonth) {
            wednesdays.push(new Date(firstWednesday));
            firstWednesday.setDate(firstWednesday.getDate() + 7);
        }
        
        // Si estamos a principios de mes, agregar los miércoles del mes anterior
        if (now.getDate() < 7) {
            const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const firstDayOfPrevMonth = new Date(prevYear, prevMonth, 1);
            const lastDayOfPrevMonth = new Date(prevYear, prevMonth + 1, 0);
            
            let prevWednesday = new Date(firstDayOfPrevMonth);
            while (prevWednesday.getDay() !== 3) {
                prevWednesday.setDate(prevWednesday.getDate() + 1);
            }
            
            while (prevWednesday <= lastDayOfPrevMonth) {
                wednesdays.unshift(new Date(prevWednesday));
                prevWednesday.setDate(prevWednesday.getDate() + 7);
            }
        }
        
        return wednesdays;
    };

    const wednesdays = getWednesdays();
    
    const getWeekDates = (wednesdayDate) => {
        const startOfWeek = new Date(wednesdayDate);
        startOfWeek.setDate(wednesdayDate.getDate() - 3); // 3 días antes del miércoles
        const endOfWeek = new Date(wednesdayDate);
        endOfWeek.setDate(wednesdayDate.getDate() + 3); // 3 días después del miércoles
        return { startOfWeek, endOfWeek };
    };

    const getStockSemanal = useMemo(() => {
        if (!wednesdays[selectedWeek]) return [];
        
        const { startOfWeek, endOfWeek } = getWeekDates(wednesdays[selectedWeek]);
        
        return productos.map(producto => {
            // Filtrar ventas de la semana seleccionada para este producto
            const ventasSemana = ventas.filter(v => {
                const fechaVenta = new Date(v.fecha_venta);
                return fechaVenta >= startOfWeek && fechaVenta <= endOfWeek && v.producto === producto.id;
            });

            // Calcular total vendido en la semana
            const totalVendido = ventasSemana.reduce((acc, v) => acc + v.cantidad, 0);
            
            // Calcular promedio diario
            const promedioDiario = totalVendido / 7;

            // Determinar tendencia
            const tendencia = promedioDiario > 0 ? 'up' : 'neutral';

            return {
                ...producto,
                ventasSemana: totalVendido,
                promedioDiario,
                tendencia
            };
        });
    }, [productos, ventas, selectedWeek, wednesdays]);

    const formatDate = (date) => {
        return date.toLocaleDateString('es-ES', { 
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl>
                    <InputLabel>Semana</InputLabel>
                    <Select 
                        value={selectedWeek} 
                        label="Semana" 
                        onChange={(e) => setSelectedWeek(e.target.value)}
                    >
                        {wednesdays.map((wednesday, index) => (
                            <MenuItem key={index} value={index}>
                                Semana del {formatDate(wednesday)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <Grid container spacing={2}>
                {getStockSemanal.map(producto => (
                    <Grid item xs={12} sm={6} md={4} key={producto.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar src={producto.foto} sx={{ width: 50, height: 50, mr: 2 }} />
                                    <Typography variant="h6">{producto.nombre}</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Stock actual: {producto.stock}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Ventas esta semana: {producto.ventasSemana}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Promedio diario: {producto.promedioDiario.toFixed(1)}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                    {producto.tendencia === 'up' ? (
                                        <TrendingUpIcon color="success" />
                                    ) : producto.tendencia === 'down' ? (
                                        <TrendingDownIcon color="error" />
                                    ) : null}
                                    <Typography 
                                        variant="body2" 
                                        color={producto.tendencia === 'up' ? 'success.main' : 'error.main'}
                                        sx={{ ml: 1 }}
                                    >
                                        {producto.tendencia === 'up' ? 'Tendencia al alza' : 
                                         producto.tendencia === 'down' ? 'Tendencia a la baja' : 
                                         'Sin cambios'}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

// --- Componente Principal de la Página de Inventario ---
const InventarioPage = () => {
    const [tabValue, setTabValue] = useState(0);
    const [productos, setProductos] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [formOpen, setFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchAllData = useCallback(async () => {
        try {
            const [productosRes, ventasRes] = await Promise.all([
                apiClient.get('/productos/?limit=1000'),
                apiClient.get('/ventas/?limit=10000')
            ]);
            setProductos(productosRes.data.results || productosRes.data);
            setVentas(ventasRes.data.results || ventasRes.data);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

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
            fetchAllData();
            setFormOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error("Error al guardar producto:", error.response?.data);
        }
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
                    Gestión de Inventario y Ventas
                </Typography>
                <Paper sx={{ p: 3, width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs value={tabValue} onChange={handleTabChange}>
                            <Tab label="Stock Semanal" />
                            <Tab label="Registrar Venta" />
                            <Tab label="Lista de Productos" />
                            <Tab label="Historial de Ventas" />
                        </Tabs>
                        {tabValue === 2 && (
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenEditForm(null)} sx={{ mb: 1 }}>
                                Agregar Producto
                            </Button>
                        )}
                    </Box>

                    <TabPanel value={tabValue} index={0}>
                        <StockSemanalComponent productos={productos} ventas={ventas} />
                    </TabPanel>
                    <TabPanel value={tabValue} index={1}>
                        <VentaFormComponent productos={productos} onVentaSuccess={fetchAllData} />
                    </TabPanel>
                    <TabPanel value={tabValue} index={2}>
                        <ProductListComponent onProductUpdate={fetchAllData} onEdit={handleOpenEditForm} />
                    </TabPanel>
                    <TabPanel value={tabValue} index={3}>
                        <Typography>Historial de ventas (en desarrollo)</Typography>
                    </TabPanel>

                    <ProductForm 
                        open={formOpen} 
                        onClose={() => setFormOpen(false)} 
                        onSave={handleSave} 
                        product={editingProduct} 
                    />
                </Paper>
            </Container>
        </Box>
    );
};

// --- ¡LA LÍNEA MÁS IMPORTANTE QUE FALTABA! ---
export default InventarioPage;