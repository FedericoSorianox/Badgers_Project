# api/serializers.py
from rest_framework import serializers
from .models import Socio, Pago, Producto, Venta, Gasto


class SocioSerializer(serializers.ModelSerializer):
    # --- CAMBIO CLAVE AQUÍ ---
    # 1. Definimos el campo 'fecha_registro' explícitamente.
    # 2. Usamos DateTimeField que es más flexible para manejar el objeto que viene de la base de datos.
    # 3. Con `format="%Y-%m-%d"`, le decimos que lo represente como un string de solo fecha (AAAA-MM-DD).
    # 4. Con `read_only=True`, confirmamos que este campo no se puede escribir a través de la API.
    fecha_registro = serializers.DateField(format="%Y-%m-%d", read_only=True)

    class Meta:
        model = Socio
        # La lista de campos se mantiene igual, incluyendo 'fecha_registro'
        fields = [
            'ci', 'nombre', 'celular', 'foto', 'fecha_nacimiento', 
            'tipo_cuota', 'contacto_emergencia', 'emergencia_movil', 
            'enfermedades', 'comentarios', 'fecha_registro'
        ]
        # Solo 'fecha_registro' es read_only
        read_only_fields = ['fecha_registro']

class PagoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pago
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    # --- CAMBIO 1: Usamos un SerializerMethodField para un cálculo explícito ---
    ganancia = serializers.SerializerMethodField()

    class Meta:
        model = Producto
        # Asegúrate de que 'foto' esté aquí si lo añades al modelo en el siguiente paso
        fields = ['id', 'nombre', 'precio_costo', 'precio_venta', 'stock', 'ganancia', 'foto']
    
    # --- CAMBIO 2: Añadimos la función que calcula el valor para 'ganancia' ---
    def get_ganancia(self, obj):
        # obj es la instancia del producto
        if obj.precio_venta is not None and obj.precio_costo is not None:
            return obj.precio_venta - obj.precio_costo
        return 0

class VentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Venta
        fields = '__all__'

class GastoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Gasto
        fields = '__all__'
        
class Meta:
        model = Producto
        fields = ['id', 'nombre', 'precio_costo', 'precio_venta', 'stock', 'ganancia'] # <-- Añade 'ganancia'        