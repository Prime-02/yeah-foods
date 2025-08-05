// ProductsAdmin.js (Main Component)
"use client";

import React, { useState, useEffect } from "react";
import { Package, Plus, Search, Grid3X3, List } from "lucide-react";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  searchProducts,
  uploadFile,
  bucketId,
  addToCart,
} from "@/lib/appwrite";
import { toast } from "react-toastify";
import { useGlobalState } from "../GlobalStateProvider";
import ProductCard from "./ProductCard";
import ProductTable from "./ProductTable";
import ProductModal from "./ProductModal";

const ProductsAdmin = () => {
  const { currentUser, fetchUserData } = useGlobalState();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [quantities, setQuantities] = useState({});
  const [addingToCart, setAddingToCart] = useState({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image: null,
  });

  const categories = [
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Sports",
    "Beauty",
    "Toys",
    "Food",
    "Other",
  ];

  const isAdmin = currentUser?.isAdmin;

  useEffect(() => {
    loadProducts();
    setViewMode(isAdmin ? "table" : "grid");
  }, [currentUser, isAdmin]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await getAllProducts(100, 0);
      const productsData = result.documents || [];
      setProducts(productsData);

      const initialQuantities = {};
      productsData.forEach((product) => {
        initialQuantities[product.$id] = 1;
      });
      setQuantities(initialQuantities);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    }
    setLoading(false);
  };

  const handleSearch = async (term) => {
    if (!term.trim()) {
      loadProducts();
      return;
    }

    setLoading(true);
    try {
      const results = await searchProducts(term);
      setProducts(results);
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Search failed");
    }
    setLoading(false);
  };

  const handleCategoryFilter = async (category) => {
    if (!category) {
      loadProducts();
      return;
    }

    setLoading(true);
    try {
      const results = await getProductsByCategory(category);
      setProducts(results);
    } catch (error) {
      console.error("Filter error:", error);
      toast.error("Filter failed");
    }
    setLoading(false);
  };

  const openModal = (mode, product = null) => {
    setModalMode(mode);
    setSelectedProduct(product);

    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "",
        stock: product.stock || "",
        image: null,
      });
      setImagePreview(product.image || "");
    } else {
      resetForm();
    }

    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProduct(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      category: "",
      stock: "",
      image: null,
    });
    setImagePreview("");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    try {
      setUploading(true);
      const uploadedFile = await uploadFile(file, bucketId);

      if (uploadedFile) {
        const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${uploadedFile.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
        return fileUrl;
      }
      return null;
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      toast.error("Only admins can manage products");
      return;
    }

    if (!formData.name || !formData.price || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    let imageUrl = selectedProduct?.image || "";

    if (formData.image) {
      imageUrl = await uploadImage(formData.image);
      if (!imageUrl) {
        toast.error("Image upload failed. Please try again.");
        return;
      }
    }

    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      category: formData.category,
      stock: parseInt(formData.stock) || 0,
      image: imageUrl,
    };

    try {
      if (modalMode === "create") {
        await createProduct(productData);
      } else if (modalMode === "edit") {
        await updateProduct(selectedProduct.$id, productData);
      }

      closeModal();
      loadProducts();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Operation failed");
    }
  };

  const handleDelete = async (productId) => {
    if (!isAdmin) {
      toast.error("Only admins can delete products");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteProduct(productId);
      loadProducts();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete product");
    }
  };

  const updateQuantity = (productId, change) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change),
    }));
  };

  const handleAddToCart = async (product) => {
    if (!currentUser || !currentUser.account) {
      toast.error("Please login to add items to cart");
      // toast.info(currentUser.account);
      // console.log(currentUser);

      toast.info(product.$id);

      return;
    }

    if (!product || !product.$id) {
      toast.error("Invalid product selected");
      return;
    }

    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    const quantity = quantities[product.$id] || 1;

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock} items available in stock`);
      return;
    }

    setAddingToCart((prev) => ({ ...prev, [product.$id]: true }));

    try {
      // Add console logs for debugging
      console.log("Adding to cart:", {
        userId: currentUser.account,
        productId: product.$id,
        quantity,
      });

      await addToCart(currentUser.account, product.$id, quantity);
      setQuantities((prev) => ({ ...prev, [product.$id]: 1 }));
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product.$id]: false }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">
            {isAdmin ? "Products Management" : "Products"}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              title="Grid View"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-white text-green-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => openModal("create")}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                handleSearch(e.target.value);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            handleCategoryFilter(e.target.value);
          }}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No products found</div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.$id}
              product={product}
              isAdmin={isAdmin}
              currentUser={currentUser}
              quantities={quantities}
              addingToCart={addingToCart}
              onView={() => openModal("view", product)}
              onEdit={() => openModal("edit", product)}
              onDelete={handleDelete}
              onUpdateQuantity={updateQuantity}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      ) : (
        <ProductTable
          products={products}
          isAdmin={isAdmin}
          onView={(product) => openModal("view", product)}
          onEdit={(product) => openModal("edit", product)}
          onDelete={handleDelete}
        />
      )}

      {/* Modal */}
      <ProductModal
        showModal={showModal}
        modalMode={modalMode}
        formData={formData}
        imagePreview={imagePreview}
        uploading={uploading}
        categories={categories}
        onClose={closeModal}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
      />
    </div>
  );
};

export default ProductsAdmin;
