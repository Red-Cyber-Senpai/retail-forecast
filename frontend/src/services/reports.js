import { getDashboardStats } from "./dashboardService";
import { getProducts } from "./productService";
import { getInventory } from "./inventory";
import { getOrders } from "./orders";

export async function getReportData() {
  const [dashboard, products, inventory, orders] = await Promise.all([
    getDashboardStats(),
    getProducts(),
    getInventory(),
    getOrders(),
  ]);

  return {
    dashboard,
    products,
    inventory,
    orders,
  };
}