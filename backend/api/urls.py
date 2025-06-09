# api/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SocioViewSet, PagoViewSet, ProductoViewSet, VentaViewSet, GastoViewSet

router = DefaultRouter()
router.register(r'socios', SocioViewSet)
router.register(r'pagos', PagoViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'ventas', VentaViewSet)
router.register(r'gastos', GastoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]