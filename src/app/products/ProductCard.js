"use client";

import React from "react";
import {
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
  ShoppingCart,
  Minus,
  Plus,
} from "lucide-react";

const ProductCard = ({ 
  product, 
  isAdmin, 
  currentUser, 
  quantities, 
  addingToCart, 
  onView, 
  onEdit, 
  onDelete, 
  onUpdateQuantity, 
  onAddToCart 
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
            Out of Stock
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2">{product.category}</p>
        <p className="text-lg font-bold text-gray-900 mb-2">${product.price}</p>
        
        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${
            product.stock > 0 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            Stock: {product.stock}
          </span>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => onView(product)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {isAdmin && (
              <>
                <button
                  onClick={() => onEdit(product)}
                  className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-full"
                  title="Edit Product"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(product.$id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full"
                  title="Delete Product"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {/* Add to Cart Section - Only for non-admin users */}
        {!isAdmin && currentUser && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              {/* Quantity Controls */}
              <div className="flex items-center bg-gray-100 rounded-lg">
                <button
                  onClick={() => onUpdateQuantity(product.$id, -1)}
                  disabled={quantities[product.$id] <= 1}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                  title="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-3 py-2 text-sm font-medium min-w-[2rem] text-center">
                  {quantities[product.$id] || 1}
                </span>
                <button
                  onClick={() => onUpdateQuantity(product.$id, 1)}
                  disabled={quantities[product.$id] >= product.stock}
                  className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
                  title="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              
              {/* Add to Cart Button */}
              <button
                onClick={() => onAddToCart(product)}
                disabled={product.stock === 0 || addingToCart[product.$id]}
                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  product.stock === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                } disabled:opacity-50`}
                title={product.stock === 0 ? "Out of stock" : "Add to cart"}
              >
                {addingToCart[product.$id] ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                ) : (
                  <ShoppingCart className="w-3 h-3" />
                )}
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
