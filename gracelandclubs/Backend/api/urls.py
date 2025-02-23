from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    execute_sql_query, ClubMembersView,AnalyzeFormView, RegisterView, LoginView, AllEventsView,
    UserDetailView, EventDetailView, SearchUsersView, AddMemberView,
    EventListCreateView  # ✅ Make sure this is imported
)

urlpatterns = [
    # --- Authentication Endpoints ---
    path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    # --- User Endpoints ---
    path("user/", UserDetailView.as_view(), name="user_detail"),  # ✅ Fetch logged-in user details
    path("clubs/<slug:club_name>/members/", ClubMembersView.as_view(), name="club-members"),
    path("api/analyze-form/", AnalyzeFormView.as_view(), name="analyze-form"),

    # --- Event Endpoints ---
    path("events/", AllEventsView.as_view(), name="all-events"),  # ✅ NEW ENDPOINT FOR ALL EVENTS
    path("events/<int:event_id>/", EventDetailView.as_view(), name="event-detail"),  # ✅ Event detail endpoint
    path("clubs/<slug:club_name>/<int:year>/<int:month>/events/", EventListCreateView.as_view(), name="event-list-by-date"),  # ✅ FIXED: Added missing endpoint
    path("search-users/", SearchUsersView.as_view(), name="search-users"),
    path("clubs/<slug:club_name>/add-member/", AddMemberView.as_view(), name="add-member"),

    # --- AI & SQL Query Endpoints ---
    path("query/", execute_sql_query, name="execute_sql_query"),  # ✅ SQL query execution
]
