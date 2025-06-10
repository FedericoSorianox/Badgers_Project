# api/models.py
from django.db import models

class Socio(models.Model):
    ci = models.CharField(max_length=20, primary_key=True)
    nombre = models.CharField(max_length=255)
    celular = models.CharField(max_length=50, blank=True, null=True)
    contacto_emergencia = models.CharField(max_length=255, blank=True, null=True)
    emergencia_movil = models.CharField(max_length=50, blank=True, null=True)
    fecha_nacimiento = models.DateField(blank=True, null=True)
    tipo_cuota = models.CharField(max_length=100, blank=True, null=True)
    enfermedades = models.TextField(blank=True, null=True)
    comentarios = models.TextField(blank=True, null=True)
    foto = models.ImageField(upload_to='socios_fotos/', blank=True, null=True) # Mejor que Base64
    fecha_registro = models.DateTimeField(auto_now_add=True)
    fecha_registro = models.DateField(auto_now_add=True, null=True, blank=True)
    activo = models.BooleanField(default=True) 

    def __str__(self):
        return self.nombre

class Pago(models.Model):
    id = models.CharField(max_length=255, primary_key=True) # ej: 1234567_1_2025
    socio = models.ForeignKey(Socio, on_delete=models.CASCADE, related_name='pagos', to_field='ci')
    mes = models.IntegerField()
    año = models.IntegerField()
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_pago = models.DateField()
    metodo_pago = models.CharField(max_length=50, blank=True, null=True)

    class Meta:
        unique_together = ('socio', 'mes', 'año')

class Producto(models.Model):
    nombre = models.CharField(max_length=255, unique=True)
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    precio_costo = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    stock = models.IntegerField(default=0)
    foto = models.ImageField(upload_to='productos_fotos/', blank=True, null=True)
    
    @property
    def ganancia(self):
        if self.precio_venta is not None and self.precio_costo is not None:
            return self.precio_venta - self.precio_costo

    def __str__(self):
        return self.nombre

class Venta(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.SET_NULL, null=True)
    cantidad = models.IntegerField()
    total_venta = models.DecimalField(max_digits=10, decimal_places=2)
    fecha_venta = models.DateTimeField(auto_now_add=True)

class Gasto(models.Model):
    concepto = models.CharField(max_length=255)
    monto = models.DecimalField(max_digits=10, decimal_places=2)
    fecha = models.DateField()
    categoria = models.CharField(max_length=100, blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)