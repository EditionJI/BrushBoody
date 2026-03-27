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
  {
    path: "/privacy",
    name: "privacy",
    component: () => import("../pages/privacy/PrivacyView.vue"),
    meta: { hideBottomNav: true, public: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard for authentication and onboarding
router.beforeEach((to, from, next) => {
  const token = getToken();
  const isPublicRoute = to.meta.public === true;
  const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding") === "true";

  // 1. 如果没有 token 且访问的是需要认证的页面，跳转到登录页
  if (!token && !isPublicRoute) {
    next("/login");
    return;
  }

  // 2. 如果已登录且访问登录页，跳转到首页
  if (token && to.path === "/login") {
    next("/");
    return;
  }

  // 3. 如果已登录且访问首页，检查是否看过 onboarding
  if (token && to.path === "/" && !hasSeenOnboarding) {
    next("/onboarding");
    return;
  }

  // 4. 如果已看过 onboarding 且访问 onboarding 页，跳转到首页
  if (token && to.path === "/onboarding" && hasSeenOnboarding) {
    next("/");
    return;
  }

  next();
});

export default router;
