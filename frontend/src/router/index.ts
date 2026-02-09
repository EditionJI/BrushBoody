import { createRouter, createWebHistory } from "vue-router";
import { useAppStore } from "../stores/app";
import { getToken } from "@/utils/storage";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("../pages/auth/LoginView.vue"),
    meta: { hideBottomNav: true, public: true },
  },
  {
    path: "/onboarding",
    name: "onboarding",
    component: () => import("../pages/onboarding/OnboardingView.vue"),
    meta: { hideBottomNav: true, public: true },
  },
  {
    path: "/",
    name: "home",
    component: () => import("../pages/home/HomeView.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/create",
    name: "create",
    component: () => import("../pages/create/CreateView.vue"),
    meta: { hideBottomNav: true, requiresAuth: true, title: "Create" },
  },
  {
    path: "/stories",
    name: "stories",
    component: () => import("../pages/stories/StoriesView.vue"),
    meta: { requiresAuth: true, title: "Stories" },
  },
  {
    path: "/parents",
    name: "parents",
    component: () => import("../pages/parents/ParentsView.vue"),
    meta: { requiresAuth: true, title: "Parents" },
  },
  {
    path: "/brushing",
    name: "brushing",
    component: () => import("../pages/brushing/BrushingView.vue"),
    meta: { hideBottomNav: true, requiresAuth: true, title: "Brushing" },
  },
  {
    path: "/payment",
    name: "payment",
    component: () => import("../pages/payment/PaymentView.vue"),
    meta: { hideBottomNav: true, requiresAuth: true, title: "Payment" },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard for authentication and onboarding
router.beforeEach((to, from, next) => {
  const token = getToken();

  // Check if route requires authentication
  const requiresAuth = to.meta.requiresAuth !== false && to.meta.public !== true;

  // If route requires auth and no token, redirect to login
  if (requiresAuth && !token) {
    next("/login");
    return;
  }

  // If logged in and trying to access login page, redirect to home
  if (to.path === "/login" && token) {
    next("/");
    return;
  }

  // Onboarding check
  const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding") === "true";

  // If trying to access home and hasn't seen onboarding, redirect to onboarding
  if (to.path === "/" && !hasSeenOnboarding) {
    next("/onboarding");
    return;
  }

  // If onboarding is done and trying to access onboarding page, redirect to home
  if (to.path === "/onboarding" && hasSeenOnboarding) {
    next("/");
    return;
  }

  next();
});

export default router;
