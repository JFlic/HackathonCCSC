from django.urls import path
from .views import search_nutrition_plans,UserDetailView, RegisterView, LoginView, execute_sql_query, ask, get_users, get_user_nutrition, get_nutrition_data
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("ask/", ask, name="ask"),  # ✅ Ensure the trailing slash
    path("users/", get_users, name="get_users"),
    path("query/", execute_sql_query, name="execute_sql_query"),  # ✅ New SQL query API
    path("users/<int:user_id>/nutrition/", get_user_nutrition, name="get_user_nutrition"),
    path("nutrition/", get_nutrition_data, name="get_nutrition_data"),
    path("search-plans/", search_nutrition_plans, name="search_nutrition_plans"),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('user/', UserDetailView.as_view(), name="user-detail"),  # ✅ User info endpoint

]
