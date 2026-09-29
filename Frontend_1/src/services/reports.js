import { getDashboardStats } from "./dashboardService";
import { getProducts } from "./productService";
import { getInventory } from "./inventory";
import { getOrders } from "./orders";
import api from "./api";

export async function getReportData() {
  const [dashboard, products, inventory, orders] = await Promise.all([
    getDashboardStats(),
    getProducts({ limit: 100 }),
    getInventory(),
    getOrders(),
  ]);

  return {
    dashboard,
    products: products.results || products, // handle list or paginated object
    inventory,
    orders,
  };
}

export async function getAnalyticsSummary() {
  const response = await api.get("/analytics/summary");
  return response.data;
}

export async function getAIInsights() {
  const response = await api.get("/insights/");
  return response.data;
}

export async function getLiveAlerts() {
  const response = await api.get("/alerts/");
  return response.data;
}
