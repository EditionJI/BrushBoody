import { createRouter, createWebHistory } from "vue-router";
import { useAppStore } from "../stores/app";

const routes = [
  {
    path: "/onboarding",
    name: "onboarding",
    component: () => import("../pages/onboarding/OnboardingView.vue"),
    meta: { hideBottomNav: true },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../pages/auth/LoginView.vue"),
    meta: { hideBottomNav: true, public: true },
  },
  {
    path: "/",
    name: "home",
    component: () => import("../pages/home/HomeView.vue"),
  },
  {
    path: "/create",
    name: "create",
    component: () => import("../pages/create/CreateView.vue"),
    meta: { hideBottomNav: true },
  },
  {
    path: "/stories",
    name: "stories",
    component: () => import("../pages/stories/StoriesView.vue"),
  },
  {
    path: "/parents",
    name: "parents",
    component: () => import("../pages/parents/ParentsView.vue"),
  },
  {
    path: "/brushing",
    name: "brushing",
    component: () => import("../pages/brushing/BrushingView.vue"),
    meta: { hideBottomNav: true },
  },
  {
    path: "/payment",
    name: "payment",
    component: () => import("../pages/payment/PaymentView.vue"),
    meta: { hideBottomNav: true },
  },
  {
    path: "/change-password",
    name: "change-password",
    component: () => import("../pages/auth/ChangePasswordView.vue"),
    meta: { hideBottomNav: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Check if user is authenticated
function isAuthenticated(): boolean {
  const authTokens = localStorage.getItem("auth_tokens");
  if (!authTokens) return false;

  try {
    const tokens = JSON.parse(authTokens);
    // Check if access token is still valid (not expired)
    // Simple check: if exists, we can try to use it
    return !!tokens.accessToken;
  } catch {
    return false;
  }
}

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  return next(); // TODO: Implement authentication
  const isPublicRoute = to.meta.public === true;

  // Allow public routes without authentication
  if (isPublicRoute) {
    next();
    return;
  }

  // Check if user is authenticated
  if (isAuthenticated()) {
    // If trying to access login page while authenticated, redirect to home
    if (to.path === "/login") {
      next("/");
      return;
    }
    next();
    return;
  }

  // User is not authenticated

  // Check onboarding status
  const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding") === "true";

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    // If trying to access home and hasn't seen onboarding, redirect to onboarding first
    if (to.path === "/" && !hasSeenOnboarding) {
      next("/onboarding");
      return;
    }

    // For all other protected routes, redirect to login
    if (to.path !== "/onboarding") {
      next("/login");
      return;
    }
  }

  next();
});

export default router;
