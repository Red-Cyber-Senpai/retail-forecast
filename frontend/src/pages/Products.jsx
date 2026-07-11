import { useEffect, useState } from "react";

import ProductToolbar from "../components/products/ProductToolbar";
import ProductTable from "../components/products/ProductTable";
import AddProductModal from "../components/products/AddProductModal";

import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import toast from "react-hot-toast";

import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
} from "../services/productService";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);

      const data = await getProducts();

      setProducts(data);

      setError("");
    } catch (err) {
      console.error(err);

      setError("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    setEditingProduct(null);
    setShowAddModal(true);
  }

  function handleEdit(product) {
    setEditingProduct(product);
    setShowAddModal(true);
  }

  async function handleSaveProduct(product) {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, product);
      } else {
        await addProduct(product);
      }

      await loadProducts();

      setShowAddModal(false);
      setEditingProduct(null);

      toast.success(
        editingProduct
          ? "Product Updated Successfully"
          : "Product Added Successfully"
  );
    } catch (err) {
      console.error(err);
      toast.error("Operation Failed");
    }
  }

  async function handleDelete(product) {
  try {
    await deleteProduct(product.id);

    await loadProducts();

    toast.success("Product Deleted Successfully");
  } catch (err) {
    console.error(err);

    toast.error("Failed to Delete Product");
  }
}

  const filteredProducts = products.filter((product) => {
    const query = search.toLowerCase();

    return (
      product.name?.toLowerCase().includes(query) ||
      product.brand?.toLowerCase().includes(query) ||
      product.category?.toLowerCase().includes(query) ||
      product.barcode?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="space-y-6">

      <ProductToolbar
        onAdd={handleAdd}
        search={search}
        setSearch={setSearch}
      />

      <AddProductModal
        isOpen={showAddModal}
        editingProduct={editingProduct}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
      />

      {filteredProducts.length === 0 ? (
        <EmptyState message="No Products Found" />
      ) : (
        <ProductTable
          products={filteredProducts}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

    </div>
  );
}

export default Products;