# backend/api/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SocioViewSet, PagoViewSet, ProductoViewSet, VentaViewSet, GastoViewSet, eliminar_socios_sin_ci
from .views import DashboardStatsView

# --- PASO 1: Creamos el router pero SIN registrar 'socios' ---
# El router seguirá manejando automáticamente Pagos, Productos, etc.
router = DefaultRouter()
router.register(r'pagos', PagoViewSet, basename='pago')
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'ventas', VentaViewSet, basename='venta')
router.register(r'gastos', GastoViewSet, basename='gasto')

# --- PASO 2: Definimos las URLs para 'Socio' a mano ---
# Esto nos da control total sobre la estructura de la URL.
# Mapeamos los métodos (GET, POST) a las acciones de la vista.
socio_list = SocioViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
socio_detail = SocioViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})
# También registramos la acción personalizada 'import_csv'
socio_import_csv = SocioViewSet.as_view({
    'post': 'import_csv'
})

# --- PASO 3: Construimos la lista final de urlpatterns ---
urlpatterns = [
    # Incluimos las URLs que el router generó para Pagos, Productos, etc.
    path('', include(router.urls)),

    # Agregamos nuestras URLs de Socios personalizadas
    path('socios/', socio_list, name='socio-list'),
     # La URL para la acción de importar
    path('socios/import_csv/', socio_import_csv, name='socio-import-csv'),
    path('socios/limpiar_sin_ci/', eliminar_socios_sin_ci, name='eliminar-socios-sin-ci'),
    path('socios/<str:ci>/', socio_detail, name='socio-detail'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]