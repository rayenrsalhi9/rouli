from rest_framework.routers import DefaultRouter
from vehicles.views import CategoryViewSet, VehicleViewSet

router = DefaultRouter()
router.register("vehicles", VehicleViewSet, basename="vehicle")
router.register("categories", CategoryViewSet, basename="category")

urlpatterns = router.urls
