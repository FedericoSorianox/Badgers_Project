# api/views.py
import csv
import io
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser
from rest_framework import viewsets, status, filters 
from rest_framework.views import APIView
from .models import Socio, Pago, Producto, Venta, Gasto
from .serializers import SocioSerializer, PagoSerializer, ProductoSerializer, VentaSerializer, GastoSerializer

# Función de ayuda para procesar fechas de forma robusta
def parse_date_from_csv(date_str):
    from datetime import datetime
    if not date_str:
        return None
    for fmt in ('%Y-%m-%d', '%d/%m/%Y', '%d-%m-%Y'):
        try:
            return datetime.strptime(date_str.strip(), fmt).date()
        except (ValueError, TypeError):
            continue
    return None


class SocioViewSet(viewsets.ModelViewSet):
    queryset = Socio.objects.all().order_by('nombre')
    serializer_class = SocioSerializer
    pagination_class = None  # <--- Agrega esta línea para desactivar la paginación
    
     # --- ¡AÑADE ESTA LÍNEA! ---
    # Le dice a Django REST Framework que use el campo 'ci' en la URL 
    # en lugar del 'id' por defecto.
    lookup_field = 'ci' 
    filter_backends = [filters.SearchFilter]
    search_fields = ['nombre', 'ci'] # Campos en los que buscará

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser])
    def import_csv(self, request, *args, **kwargs):
        csv_file = request.FILES.get('file')
        if not csv_file:
            return Response({"error": "No se proporcionó ningún archivo"}, status=status.HTTP_400_BAD_REQUEST)

        decoded_file = csv_file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)

        success_count = 0
        error_count = 0
        errors = []

        for row in reader:
            try:
                Socio.objects.update_or_create(
                    ci=row['ci'],
                    defaults={
                        'nombre': row.get('nombre', ''),
                        'celular': row.get('celular'),
                        'contacto_emergencia': row.get('contacto_emergencia'),
                        'emergencia_movil': row.get('emergencia_movil'),
                        'fecha_nacimiento': parse_date_from_csv(row.get('fecha_nacimiento')),
                        'tipo_cuota': row.get('tipo_cuota'),
                        'enfermedades': row.get('enfermedades'),
                        'comentarios': row.get('comentarios'),
                        # El campo foto no se importa desde CSV
                    }
                )
                success_count += 1
            except Exception as e:
                error_count += 1
                errors.append(f"Fila con CI {row.get('ci', 'N/A')}: {str(e)}")

        return Response({
            "message": f"Importación completada. {success_count} socios importados/actualizados, {error_count} errores.",
            "errors": errors
        }, status=status.HTTP_200_OK)


class PagoViewSet(viewsets.ModelViewSet):
    queryset = Pago.objects.all().order_by('-fecha_pago')
    serializer_class = PagoSerializer
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser])
    def import_csv(self, request, *args, **kwargs):
        csv_file = request.FILES.get('file')
        if not csv_file:
            return Response({"error": "No se proporcionó ningún archivo"}, status=status.HTTP_400_BAD_REQUEST)

        decoded_file = csv_file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        success_count = 0
        error_count = 0
        errors = []

        for row in reader:
            try:
                # El ID se genera a partir de los datos
                pago_id = f"{row['ci']}_{row['mes']}_{row['año']}"
                Pago.objects.update_or_create(
                    id=pago_id,
                    defaults={
                        'socio_id': row['ci'],
                        'mes': int(row['mes']),
                        'año': int(row['año']),
                        'monto': float(row['monto']),
                        'fecha_pago': parse_date_from_csv(row.get('fecha_pago')),
                        'metodo_pago': row.get('metodo_pago'),
                    }
                )
                success_count += 1
            except Exception as e:
                error_count += 1
                errors.append(f"Fila con ID {pago_id}: {str(e)}")

        return Response({
            "message": f"Importación completada. {success_count} pagos importados/actualizados, {error_count} errores.",
            "errors": errors
        }, status=status.HTTP_200_OK)


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all().order_by('nombre')
    serializer_class = ProductoSerializer
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser])
    def import_csv(self, request, *args, **kwargs):
        csv_file = request.FILES.get('file')
        if not csv_file:
            return Response({"error": "No se proporcionó ningún archivo"}, status=status.HTTP_400_BAD_REQUEST)

        decoded_file = csv_file.read().decode('utf-8')
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        success_count = 0
        error_count = 0
        errors = []

        for row in reader:
            try:
                Producto.objects.update_or_create(
                    nombre=row['nombre'],
                    defaults={
                        'precio_venta': float(row.get('precio_venta', 0)),
                        'precio_costo': float(row.get('precio_costo', 0)),
                        'stock': int(row.get('stock', 0)),
                    }
                )
                success_count += 1
            except Exception as e:
                error_count += 1
                errors.append(f"Fila con Producto {row.get('nombre', 'N/A')}: {str(e)}")

        return Response({
            "message": f"Importación completada. {success_count} productos importados/actualizados, {error_count} errores.",
            "errors": errors
        }, status=status.HTTP_200_OK)


class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.all().order_by('-fecha_venta')
    serializer_class = VentaSerializer

class GastoViewSet(viewsets.ModelViewSet):
    queryset = Gasto.objects.all().order_by('-fecha')
    serializer_class = GastoSerializer
    
class DashboardStatsView(APIView):
    def get(self, request, *args, **kwargs):
        active_socios_count = Socio.objects.filter(activo=True).count()
        products_in_inventory_count = Producto.objects.count()

        stats = {
            'socios_activos': active_socios_count,
            'productos_en_inventario': products_in_inventory_count,
        }
        return Response(stats)    