import axios from "axios";
import { execSync } from "child_process";
import path from "path";

const BASE_URL = "http://127.0.0.1:8000";

async function runTests() {
  console.log("=============================================================");
  console.log("       SELFSTACK FRONTEND_1 SERVICES INTEGRATION TEST        ");
  console.log("=============================================================");

  const testEmail = `service_test_${Date.now()}@selfstack.com`;
  let token = "";
  let productId = null;
  let supplierId = null;
  let distributorId = null;
  let orderId = null;
  let headers = {};

  try {
    // 1. Health checks
    console.log("\n[TEST 1] Querying health endpoints...");
    const health = await axios.get(`${BASE_URL}/health`);
    console.log(` -> Health check: ${health.data.status} (Code: ${health.status})`);

    // 2. Authentication Flow
    console.log("\n[TEST 2] Verifying authentication endpoints...");
    const register = await axios.post(`${BASE_URL}/auth/register`, {
      full_name: "Service Tester User",
      email: testEmail,
      password: "test_password_123",
      phone: "1234567890",
    });
    console.log(` -> Register user: Success (Email: ${register.data.email})`);

    // Escalate user to superadmin
    try {
      console.log(" -> Attempting DB role escalation to superadmin...");
      const workspaceRoot = path.resolve(process.cwd(), "..");
      const pythonPath = path.resolve(workspaceRoot, "backend", "venv", "bin", "python");
      const pythonCmd = `"${pythonPath}" -c "import sys; sys.path.insert(0, '${workspaceRoot}'); from backend.database.session import SessionLocal; from backend.models.user import User; db = SessionLocal(); user = db.query(User).filter(User.email == '${testEmail}').first(); user.role = 'superadmin'; db.commit(); db.close()"`;
      execSync(pythonCmd);
      console.log(" -> Role escalation: Success (User is now superadmin)");
    } catch (pe) {
      console.error(" -> Role escalation: FAILED", pe.message);
    }

    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: "test_password_123",
    });
    token = login.data.access_token;
    headers = { Authorization: `Bearer ${token}` };
    console.log(` -> Login user: Success (JWT token acquired)`);

    const profile = await axios.get(`${BASE_URL}/auth/me`, { headers });
    console.log(` -> Profile fetch (/auth/me): Success (Role: ${profile.data.role})`);

    // 3. Products CRUD
    console.log("\n[TEST 3] Verifying Products API...");
    // Create Product
    const newProd = await axios.post(
      `${BASE_URL}/products/`,
      {
        barcode: `TESTBAR_${Date.now()}`,
        name: "Test Integration Soda",
        brand: "Antigravity",
        category: "Beverages",
        description: "Integration testing product",
        unit: "pcs",
        cost_price: 15.0,
        selling_price: 25.0,
      },
      { headers }
    );
    productId = newProd.data.id;
    console.log(` -> Create product: Success (ID: ${productId})`);

    // List Products
    const prodList = await axios.get(`${BASE_URL}/products/?limit=10`, { headers });
    const count = prodList.data.length !== undefined ? prodList.data.length : prodList.data.results?.length;
    console.log(` -> List products: Success (Found ${count} products)`);

    // Get Single Product
    const singleProd = await axios.get(`${BASE_URL}/products/${productId}`, { headers });
    console.log(` -> Fetch single product: Success (${singleProd.data.name})`);

    // Get product by barcode
    const barcodeProd = await axios.get(`${BASE_URL}/products/barcode/${newProd.data.barcode}`, { headers });
    console.log(` -> Fetch product by barcode: Success (${barcodeProd.data.name})`);

    // 4. Inventory APIs
    console.log("\n[TEST 4] Verifying Inventory API...");
    // Get ledger
    const inventory = await axios.get(`${BASE_URL}/inventory/`, { headers });
    console.log(` -> Fetch stock ledger: Success (Found ${inventory.data.length} records)`);

    // Stock In
    const stockIn = await axios.post(
      `${BASE_URL}/inventory/add`,
      {
        product_id: productId,
        quantity: 50,
        remarks: "Stock receipt test",
      },
      { headers }
    );
    console.log(` -> Stock In adjustment: Success (New Quantity: ${stockIn.data.quantity})`);

    // Stock Out
    const stockOut = await axios.post(
      `${BASE_URL}/inventory/remove`,
      {
        product_id: productId,
        quantity: 10,
        remarks: "Stock issue test",
      },
      { headers }
    );
    console.log(` -> Stock Out adjustment: Success (New Quantity: ${stockOut.data.quantity})`);

    // Low Stock Warnings
    const lowStock = await axios.get(`${BASE_URL}/inventory/low-stock`, { headers });
    console.log(` -> Fetch low stock items: Success (Found ${lowStock.data.length} low stock warnings)`);

    // Inventory Logs
    const invLogs = await axios.get(`${BASE_URL}/inventory/logs`, { headers });
    console.log(` -> Fetch global audit logs: Success (Found ${invLogs.data.length} audit entries)`);

    // Inventory logs for specific product
    const prodLogs = await axios.get(`${BASE_URL}/inventory/${productId}/logs`, { headers });
    console.log(` -> Fetch product audit logs: Success (Found ${prodLogs.data.length} logs for ID: ${productId})`);

    // 5. Suppliers and Distributors
    console.log("\n[TEST 5] Verifying Suppliers and Distributors API...");
    // Create Supplier
    const newSupp = await axios.post(
      `${BASE_URL}/suppliers/`,
      {
        company_name: `Test Vendor Ltd ${Date.now()}`,
        contact_name: "Vendor Officer",
        email: "vendor@test.com",
        phone: "5555555555",
        address: "Industrial Complex A",
      },
      { headers }
    );
    supplierId = newSupp.data.id;
    console.log(` -> Create supplier: Success (ID: ${supplierId})`);

    // Get suppliers
    const suppList = await axios.get(`${BASE_URL}/suppliers/`, { headers });
    console.log(` -> List suppliers: Success (Found ${suppList.data.length} suppliers)`);

    // Create Distributor
    const newDist = await axios.post(
      `${BASE_URL}/distributors/`,
      {
        company_name: `Test Logistics Ltd ${Date.now()}`,
        contact_name: "Delivery Manager",
        email: "dist@test.com",
        phone: "4444444444",
        address: "Logistics Hub B",
        region: "South",
      },
      { headers }
    );
    distributorId = newDist.data.id;
    console.log(` -> Create distributor: Success (ID: ${distributorId})`);

    // Get distributors
    const distList = await axios.get(`${BASE_URL}/distributors/`, { headers });
    console.log(` -> List distributors: Success (Found ${distList.data.length} distributors)`);

    // 6. Procurement & Reordering
    console.log("\n[TEST 6] Verifying Procurement proposals...");
    const suggestions = await axios.get(`${BASE_URL}/procurement/suggestions?limit=5`, { headers });
    console.log(` -> Fetch restock suggestions: Success (Found ${suggestions.data.length} AI proposals)`);

    // Create restock order
    if (distributorId) {
      const order = await axios.post(
        `${BASE_URL}/procurement/create-order`,
        {
          distributor_id: distributorId,
          limit: 5,
        },
        { headers }
      );
      orderId = order.data.id;
      console.log(` -> Restock Order creation: Success (Order ID: ${orderId}, Status: ${order.data.status})`);
      
      // Update order status
      const updateOrder = await axios.put(
        `${BASE_URL}/orders/${orderId}/status`,
        { status: "DELIVERED" },
        { headers }
      );
      console.log(` -> Complete order: Success (Updated Status: ${updateOrder.data.status})`);
    }

    // 7. Intelligence & Analytics Endpoints
    console.log("\n[TEST 7] Verifying Live Dashboards & Analytical Services...");
    // Dashboard Stats
    const dbStats = await axios.get(`${BASE_URL}/dashboard/stats`, { headers });
    console.log(` -> Dashboard stats: Success (Revenue Today: ₹${dbStats.data.todays_revenue})`);

    // Analytics summary
    const summary = await axios.get(`${BASE_URL}/analytics/summary`, { headers });
    console.log(` -> Analytics Summary: Success (Sales Trend items: ${summary.data.sales_trend_30d?.length || 0})`);

    // Supplier intelligence rankings
    const supplierIntel = await axios.get(`${BASE_URL}/supplier-intelligence/?limit=5`, { headers });
    console.log(` -> Supplier Performance Rankings: Success (Found ${supplierIntel.data.length} vendors reviewed)`);

    // Inventory health dashboard
    const inventoryIntel = await axios.get(`${BASE_URL}/inventory-intelligence/`, { headers });
    console.log(` -> Inventory Health analysis: Success (Ratio: ${inventoryIntel.data.healthy_stock_percentage}%)`);

    // Smart Reorder recommendations
    const smartReorder = await axios.get(`${BASE_URL}/reorder/`, { headers });
    console.log(` -> Smart reorder list: Success (Found ${smartReorder.data.length} recommendations)`);

    // Live Alerts
    const alerts = await axios.get(`${BASE_URL}/alerts/`, { headers });
    console.log(` -> Live Alerts: Success (Found ${alerts.data.length} alerts)`);

    // Live AI Insights
    const insights = await axios.get(`${BASE_URL}/insights/`, { headers });
    console.log(` -> Live AI Insights: Success (Ticker: ${insights.data.summary})`);

    // AI recommendation list
    const recommendations = await axios.get(`${BASE_URL}/recommendations/`, { headers });
    console.log(` -> AI Recommendations list: Success (Found ${recommendations.data.length} products)`);

    // 8. Forecasting & Machine Learning Vision
    console.log("\n[TEST 8] Verifying AI Forecasting engine...");
    try {
      const forecast = await axios.get(`${BASE_URL}/forecast/${productId}?days=7`, { headers });
      console.log(` -> Run XGBoost demand forecast for product ${productId}: Success (Confidence: ${forecast.data.forecast_confidence})`);
    } catch (err) {
      console.log(` -> RUN XGBoost forecast: SKIPPED / FAILED (${err.response?.data?.detail || err.message})`);
    }

  } catch (err) {
    console.error("\n*** SERVICE TEST FATAL ERROR ***");
    if (err.response) {
      console.error(`Status: ${err.response.status}`);
      console.error(`Body: ${JSON.stringify(err.response.data)}`);
    } else {
      console.error(err.message);
    }
  } finally {
    // Cleanup created data
    console.log("\n[CLEANUP] Cleaning up integration testing data...");
    if (productId || supplierId || distributorId || orderId) {
      const cleanupHeaders = { Authorization: `Bearer ${token}` };
      
      try {
        if (orderId) {
          // Delete order from DB manually or leave it
        }
        if (productId) {
          await axios.delete(`${BASE_URL}/products/${productId}`, { headers: cleanupHeaders });
          console.log(` -> Purged test product ID: ${productId}`);
        }
        if (supplierId) {
          await axios.delete(`${BASE_URL}/suppliers/${supplierId}`, { headers: cleanupHeaders });
          console.log(` -> Purged test supplier ID: ${supplierId}`);
        }
        if (distributorId) {
          await axios.delete(`${BASE_URL}/distributors/${distributorId}`, { headers: cleanupHeaders });
          console.log(` -> Purged test distributor ID: ${distributorId}`);
        }
      } catch (cleanupErr) {
        console.error(" -> Cleanup failed:", cleanupErr.message);
      }
    }
    console.log("=============================================================");
    console.log("                    SERVICE TEST RUN COMPLETE                ");
    console.log("=============================================================");
  }
}

runTests();
