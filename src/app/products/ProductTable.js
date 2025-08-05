"use client";

import React from "react";
import {
  Edit,
  Trash2,
  Eye,
  Image as ImageIcon,
} from "lucide-react";

const ProductTable = ({ 
  products, 
  isAdmin, 
  onView, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-auto">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Image
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Name
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Category
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Price
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Stock
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.$id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {product.name}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {product.category}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                ${product.price}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock > 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.stock}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onView(product)}
                    className="p-1 text-gray-600 hover:text-green-600"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => onEdit(product)}
                        className="p-1 text-gray-600 hover:text-yellow-600"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(product.$id)}
                        className="p-1 text-gray-600 hover:text-red-600"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;
