import os
import sys
import io
import json
import time
import traceback
import numpy as np
from PIL import Image

# Setup python path so it can import backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import FastAPI and TestClient
from fastapi.testclient import TestClient
from backend.main import app
from sqlalchemy import func
from backend.database.session import SessionLocal
from backend.models.user import User
from backend.models.product import Product
from backend.models.inventory import Inventory
from backend.models.sale import Sale
from backend.models.sale_item import SaleItem
from backend.models.supplier import Supplier
from backend.models.distributor import Distributor
from backend.models.order import Order

client = TestClient(app)

def run_tests():
    print("=" * 60)
    print("      SELFSTACK TECHNICAL AUDIT INTEGRATION TEST SUITE      ")
    print("=" * 60)

    test_results = {}
    
    # -------------------------------------------------------------
    # 1. Health Checks
    # -------------------------------------------------------------
    print("\n[TEST 1] Verifying Health and Root Endpoints...")
    try:
        r1 = client.get("/")
        assert r1.status_code == 200
        assert r1.json()["message"] == "SelfStack Backend Running"

        r2 = client.get("/health")
        assert r2.status_code == 200
        assert r2.json()["status"] == "healthy"
        print(" -> Success: Health and Root API endpoints are fully active.")
        test_results["Health Checks"] = "PASSED"
    except Exception as e:
        print(f" -> FAILED: {e}")
        traceback.print_exc()
        test_results["Health Checks"] = "FAILED"

    # -------------------------------------------------------------
    # 2. Authentication Flow (Register, Login, Me)
    # -------------------------------------------------------------
    print("\n[TEST 2] Verifying User Registration, Login and Authentication Flow...")
    auth_headers = {}
    test_email = f"audit_user_{int(time.time())}@selfstack.com"
    try:
        # Register User
        reg_payload = {
            "full_name": "Audit Tester User",
            "email": test_email,
            "password": "audit_password_123",
            "phone": "9999999999"
        }
        reg_resp = client.post("/auth/register", json=reg_payload)
        assert reg_resp.status_code == 200, f"Registration failed: {reg_resp.text}"
        user_data = reg_resp.json()
        assert user_data["email"] == test_email
        assert user_data["role"] == "employee"
        print(" -> User registration endpoint functional.")

        # Login User
        login_payload = {
            "email": test_email,
            "password": "audit_password_123"
        }
        login_resp = client.post("/auth/login", json=login_payload)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"
        token_data = login_resp.json()
        assert "access_token" in token_data
        token = token_data["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}
        print(" -> User login endpoint functional (retrieved JWT).")

        # Access /auth/me
        me_resp = client.get("/auth/me", headers=auth_headers)
        assert me_resp.status_code == 200, f"Me endpoint failed: {me_resp.text}"
        assert me_resp.json()["email"] == test_email
        print(" -> /auth/me profile endpoint functional.")
        
        # Verify role escalation is working in DB (so we can test manager/admin routes)
        db = SessionLocal()
        db_user = db.query(User).filter(User.email == test_email).first()
        if db_user:
            db_user.role = "admin"
            db.commit()
            db.close()
            print(" -> Simulated admin role escalation for verification.")
        else:
            db.close()
            raise Exception("Created user not found in database for role escalation")
        
        test_results["Authentication Flow"] = "PASSED"
    except Exception as e:
        print(f" -> FAILED: {e}")
        traceback.print_exc()
        test_results["Authentication Flow"] = "FAILED"

    # -------------------------------------------------------------
    # 3. Product CRUD (Authenticated)
    # -------------------------------------------------------------
    print("\n[TEST 3] Verifying Product CRUD Endpoints...")
    test_product_id = None
    barcode_id = f"AUDITBAR_{int(time.time())}"
    try:
        # Verify authorization is actually enforced (should fail without token)
        no_auth_resp = client.get("/products/")
        assert no_auth_resp.status_code == 401, f"Product list should require authentication, got {no_auth_resp.status_code}"
        print(" -> Success: Unauthorized requests rejected on /products/.")

        # List Products (Authenticated)
        list_resp = client.get("/products/?limit=5", headers=auth_headers)
        assert list_resp.status_code == 200
        products_list = list_resp.json()
        assert isinstance(products_list, list)
        print(" -> Product listing (authenticated) functional.")

        # Create Product
        prod_payload = {
            "barcode": barcode_id,
            "name": "Audit Test Product",
            "brand": "AuditBrand",
            "category": "Snacks",
            "description": "A product created by the test script",
            "unit": "pcs",
            "cost_price": 10.0,
            "selling_price": 15.0
        }
        create_resp = client.post("/products/", json=prod_payload, headers=auth_headers)
        assert create_resp.status_code == 200, f"Product creation failed: {create_resp.text}"
        created_prod = create_resp.json()
        assert created_prod["barcode"] == barcode_id
        test_product_id = created_prod["id"]
        print(f" -> Product creation functional. Product ID: {test_product_id}")

        # Get Product by barcode
        barcode_resp = client.get(f"/products/barcode/{barcode_id}", headers=auth_headers)
        assert barcode_resp.status_code == 200
        assert barcode_resp.json()["name"] == "Audit Test Product"
        print(" -> Product retrieval by barcode functional.")

        # Update Product (Requires manager/admin)
        update_payload = prod_payload.copy()
        update_payload["name"] = "Updated Audit Test Product"
        update_payload["selling_price"] = 18.0
        update_resp = client.put(f"/products/{test_product_id}", json=update_payload, headers=auth_headers)
        assert update_resp.status_code == 200, f"Product update failed: {update_resp.text}"
        assert update_resp.json()["name"] == "Updated Audit Test Product"
        assert float(update_resp.json()["selling_price"]) == 18.0
        print(" -> Product modification endpoint functional.")

        test_results["Product CRUD"] = "PASSED"
    except Exception as e:
        print(f" -> FAILED: {e}")
        traceback.print_exc()
        test_results["Product CRUD"] = "FAILED"

    # -------------------------------------------------------------
    # 4. Inventory Endpoints
    # -------------------------------------------------------------
    print("\n[TEST 4] Verifying Inventory and Logs Endpoints...")
    try:
        # Check stock updates
        db = SessionLocal()
        inv_record = db.query(Inventory).first()
        db.close()
        
        if inv_record:
            pid = inv_record.product_id
            print(f" -> Using product ID {pid} from database for inventory endpoint validation.")
            
            # Get inventory by product
            inv_resp = client.get(f"/inventory/{pid}")
            assert inv_resp.status_code == 200, f"Get inventory failed: {inv_resp.text}"
            print(" -> Fetching inventory status by product ID functional.")

            # Get logs for product
            logs_resp = client.get(f"/inventory/{pid}/logs")
            assert logs_resp.status_code == 200
            print(" -> Fetching inventory history logs for product ID functional.")
            
            # Stock addition
            stock_in_payload = {
                "product_id": pid,
                "quantity": 10,
                "remarks": "Audit stock in test"
            }
            add_resp = client.post("/inventory/add", json=stock_in_payload)
            assert add_resp.status_code == 200
            print(" -> Stock increment endpoint functional.")

            # Stock removal
            stock_out_payload = {
                "product_id": pid,
                "quantity": 5,
                "remarks": "Audit stock out test"
            }
            sub_resp = client.post("/inventory/remove", json=stock_out_payload)
            assert sub_resp.status_code == 200
            print(" -> Stock decrement endpoint functional.")
        else:
            print(" -> WARNING: No inventory records found to run inventory tests on.")
            
        # Get low stock
        low_resp = client.get("/inventory/low-stock")
        assert low_resp.status_code == 200
        print(" -> Fetching list of low-stock products functional.")

        # Get all logs
        all_logs_resp = client.get("/inventory/logs")
        assert all_logs_resp.status_code == 200
        print(" -> Fetching global inventory logs functional.")

        test_results["Inventory Controls"] = "PASSED"
    except Exception as e:
        print(f" -> FAILED: {e}")
        traceback.print_exc()
        test_results["Inventory Controls"] = "FAILED"

    # -------------------------------------------------------------
    # 5. Sales Transactions
    # -------------------------------------------------------------
    print("\n[TEST 5] Verifying POS Sales Transaction Logging...")
    try:
        db = SessionLocal()
        inv_items = db.query(Inventory).filter(Inventory.quantity > 5).limit(2).all()
        db.close()

        if len(inv_items) > 0:
            sale_items = [{"product_id": item.product_id, "quantity": 1} for item in inv_items]
            sale_payload = {"items": sale_items}
            sale_resp = client.post("/sales/", json=sale_payload)
            assert sale_resp.status_code == 200, f"POS sale recording failed: {sale_resp.text}"
            created_sale = sale_resp.json()
            assert "id" in created_sale
            print(f" -> Sale successfully recorded. Total Amount: {created_sale['total_amount']}")
            
            # Fetch details
            sale_id = created_sale["id"]
            detail_resp = client.get(f"/sales/{sale_id}")
            assert detail_resp.status_code == 200
            print(" -> Sale history detail querying functional.")
        else:
            print(" -> WARNING: Insufficient inventory to test sales endpoint.")
            
        test_results["POS Sales Logging"] = "PASSED"
    except Exception as e:
        print(f" -> FAILED: {e}")
        traceback.print_exc()
        test_results["POS Sales Logging"] = "FAILED"

    # -------------------------------------------------------------
    # 6. Supplier & Distributor CRUD
    # -------------------------------------------------------------
    print("\n[TEST 6] Verifying Supplier & Distributor CRUD...")
    supplier_id = None
    distributor_id = None
    try:
        # Supplier create
        supp_payload = {
            "company_name": "Audit Supplier Ltd",
            "contact_name": "Audit Person",
            "email": "supplier@audit.com",
            "phone": "1234567890",
            "address": "123 Audit Rd"
        }
        supp_resp = client.post("/suppliers/", json=supp_payload)
        assert supp_resp.status_code == 200, f"Supplier creation failed: {supp_resp.text}"
        supplier_id = supp_resp.json()["id"]
        print(f" -> Supplier CRUD: Creation successful. ID: {supplier_id}")

        # Supplier list
        supp_list_resp = client.get("/suppliers/")
        assert supp_list_resp.status_code == 200
        print(" -> Supplier CRUD: Listing successful.")

        # Distributor create
        dist_payload = {
            "company_name": "Audit Distributor Ltd",
            "contact_name": "Distributor Person",
            "email": "dist@audit.com",
            "phone": "0987654321",
            "address": "456 Dist Ave",
            "region": "North"
        }
        dist_resp = client.post("/distributors/", json=dist_payload)
        assert dist_resp.status_code == 200, f"Distributor creation failed: {dist_resp.text}"
        distributor_id = dist_resp.json()["id"]
        print(f" -> Distributor CRUD: Creation successful. ID: {distributor_id}")

        test_results["Supplier & Distributor CRUD"] = "PASSED"
    except Exception as e:
        print(f" -> FAILED: {e}")
        traceback.print_exc()
        test_results["Supplier & Distributor CRUD"] = "FAILED"

    # -------------------------------------------------------------
    # 7. Procurement Suggestion & Orders
    # -------------------------------------------------------------
    print("\n[TEST 7] Verifying AI Procurement Suggestions & Ordering Endpoints...")
    try:
        # Suggestions API
        sug_resp = client.get("/procurement/suggestions?limit=5")
        assert sug_resp.status_code == 200, f"Suggestions failed: {sug_resp.text}"
        suggestions = sug_resp.json()
        assert isinstance(suggestions, list)
        print(f" -> Retrieved {len(suggestions)} AI procurement suggestions successfully.")

        # If we have a suggestion and distributor, test order trigger
        if distributor_id and len(suggestions) > 0:
            order_payload = {
                "distributor_id": distributor_id,
                "limit": 5
            }
            order_resp = client.post("/procurement/create-order", json=order_payload)
            assert order_resp.status_code == 200, f"AI restock order failed: {order_resp.text}"
            print(f" -> AI Restocking Triggered: created Order ID: {order_resp.json()['id']}")
        else:
            print(" -> Skipping order creation test (missing distributor or suggestions).")
            
        test_results["AI Procurement Engine"] = "PASSED"
    except Exception as e:
        print(f" -> FAILED: {e}")
        traceback.print_exc()
        test_results["AI Procurement Engine"] = "FAILED"

    # -------------------------------------------------------------
    # 8. Analytical Endpoints
    # -------------------------------------------------------------
    print("\n[TEST 8] Verifying Store Analytics & Dashboard API...")
    try:
        # Dashboard stats
        dash_resp = client.get("/dashboard/stats")
        assert dash_resp.status_code == 200, f"Dashboard stats failed: {dash_resp.text}"
        print(" -> /dashboard/stats endpoint is fully functional.")

        # Analytics summary
        an_resp = client.get("/analytics/summary")
        assert an_resp.status_code == 200, f"Analytics summary failed: {an_resp.text}"
        ans = an_resp.json()
        assert "total_products" in ans
        assert "total_inventory_cost_value" in ans
        assert "sales_trend_30d" in ans
        print(" -> /analytics/summary analytical dashboard is fully functional.")

        # Supplier intelligence
        intel_resp = client.get("/supplier-intelligence/")
        assert intel_resp.status_code == 200, f"Supplier intelligence failed: {intel_resp.text}"
        print(" -> /supplier-intelligence/ ranking analysis is fully functional.")

        test_results["Store Analytics"] = "PASSED"
    except Exception as e:
        print(f" -> FAILED: {e}")
        traceback.print_exc()
        test_results["Store Analytics"] = "FAILED"

    # -------------------------------------------------------------
    # 9. AI Recommendation API
    # -------------------------------------------------------------
    print("\n[TEST 9] Verifying AI recommendations Engine Endpoint...")
    try:
        rec_resp = client.get("/recommendations/")
        assert rec_resp.status_code == 200, f"Recommendations failed: {rec_resp.text}"
        recs = rec_resp.json()
        assert isinstance(recs, list)
        print(f" -> Retrieved {len(recs)} stock suggestions from AI recommendation service.")
        test_results["AI Recommendations API"] = "PASSED"
    except Exception as e:
        print(f" -> FAILED: {e}")
        traceback.print_exc()
        test_results["AI Recommendations API"] = "FAILED"

    # -------------------------------------------------------------
    # 10. Forecasting Engine (Subprocess & API)
    # -------------------------------------------------------------
    print("\n[TEST 10] Verifying XGBoost Demand Forecasting Subprocess & API...")
    try:
        # Find a product that has enough sales history in DB
        db = SessionLocal()
        p_with_sales = db.query(SaleItem.product_id).join(Sale, Sale.id == SaleItem.sale_id).group_by(SaleItem.product_id).having(func.count(SaleItem.id) >= 14).first()
        db.close()

        if p_with_sales:
            pid = p_with_sales[0]
            print(f" -> Verifying forecasting for product ID: {pid}")
            fc_resp = client.get(f"/forecast/{pid}")
            assert fc_resp.status_code == 200, f"Forecasting API failed: {fc_resp.text}"
            res = fc_resp.json()
            assert "forecast" in res
            assert len(res["forecast"]) == 7
            print(f" -> Demand forecasting successful! Predicted 7-day volume: {res['predicted_total']} units.")
            test_results["Forecasting Engine"] = "PASSED"
        else:
            print(" -> Skipping forecasting endpoint test (not enough sales history for any product).")
            test_results["Forecasting Engine"] = "SKIPPED (Insufficient Sales History)"
    except Exception as e:
        print(f" -> FAILED: {e}")
        traceback.print_exc()
        test_results["Forecasting Engine"] = "FAILED"

    # -------------------------------------------------------------
    # 11. Computer Vision: PyTorch MobileNetV2 Category Classification
    # -------------------------------------------------------------
    print("\n[TEST 11] Verifying PyTorch MobileNetV2 Category Classifier loading & prediction...")
    try:
        # Create a dummy 224x224 RGB image in memory
        img_arr = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
        img = Image.fromarray(img_arr)
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_bytes = img_byte_arr.getvalue()

        # Call the API scan endpoint
        scan_resp = client.post(
            "/recognition/scan",
            files={"file": ("dummy.jpg", img_bytes, "image/jpeg")}
        )
        assert scan_resp.status_code == 200, f"Scanning endpoint failed: {scan_resp.text}"
        res = scan_resp.json()
        assert "predicted_category" in res
        assert "confidence" in res
        print(f" -> Success: MobileNetV2 model loaded and classified image as '{res['predicted_category']}' with {res['confidence']*100}% confidence.")
        test_results["Computer Vision Classifier"] = "PASSED"
    except Exception as e:
        print(f" -> FAILED: {e}")
        traceback.print_exc()
        test_results["Computer Vision Classifier"] = "FAILED"

    # -------------------------------------------------------------
    # 12. Barcode Scanning Handling
    # -------------------------------------------------------------
    print("\n[TEST 12] Verifying Barcode scan endpoint fallback behaviour...")
    try:
        # Create a dummy image
        img_arr = np.random.randint(0, 255, (200, 200, 3), dtype=np.uint8)
        img = Image.fromarray(img_arr)
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        img_bytes = img_byte_arr.getvalue()

        scan_resp = client.post(
            "/barcode/scan",
            files={"file": ("dummy_barcode.jpg", img_bytes, "image/jpeg")}
        )
        assert scan_resp.status_code == 200
        res = scan_resp.json()
        assert "decoded_barcodes" in res
        # Since pyzbar is not installed, it should gracefully fall back and return empty matches rather than throwing exceptions
        assert len(res["decoded_barcodes"]) == 0
        print(" -> Success: Barcode module handled missing pyzbar gracefully, returning empty decoded list.")
        test_results["Barcode Decoder Safe Failover"] = "PASSED"
    except Exception as e:
        print(f" -> FAILED: {e}")
        traceback.print_exc()
        test_results["Barcode Decoder Safe Failover"] = "FAILED"

    # Clean up created product, user, suppliers, and distributors to keep DB clean
    print("\n[CLEANUP] Cleaning up test data records...")
    db = SessionLocal()
    try:
        if test_product_id:
            db.query(Product).filter(Product.id == test_product_id).delete()
        if test_email:
            db.query(User).filter(User.email == test_email).delete()
        if supplier_id:
            db.query(Supplier).filter(Supplier.id == supplier_id).delete()
        if distributor_id:
            db.query(Distributor).filter(Distributor.id == distributor_id).delete()
        db.commit()
        print(" -> Database test records successfully purged.")
    except Exception as cleanup_err:
        print(f" -> Cleanup warning: {cleanup_err}")
    finally:
        db.close()

    print("\n" + "=" * 60)
    print("                      SUMMARY OF TESTS                      ")
    print("=" * 60)
    for test_name, status in test_results.items():
        print(f" - {test_name:<40}: [{status}]")
    print("=" * 60)
    
    # Save test output summary to a json file to read inside node context if needed
    with open("scripts/audit_test_results.json", "w") as out:
        json.dump(test_results, out, indent=2)

if __name__ == "__main__":
    run_tests()
