import {
  Client,
  Account,
  Databases,
  Storage,
  Avatars,
  ID,
  Query,
} from "appwrite";
import { toast } from "react-toastify";

const config = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.NEXT_PUBLIC_DATABASE_ID,
  userCollectionId: process.env.NEXT_PUBLIC_USER_COLECTION_ID,
  productCollectionId: process.env.NEXT_PUBLIC_PRODUCT_COLLECTION_ID,
  cartCollectionId: process.env.NEXT_PUBLIC_CART_COLLECTION_ID, // Optional: for cart items
  bucketId: process.env.NEXT_PUBLIC_PRODUCT_BUCKET_ID,
};

const {
  endpoint,
  projectId,
  userCollectionId,
  databaseId,
  productCollectionId,
  cartCollectionId,
  bucketId,
} = config;

const client = new Client();

client.setEndpoint(endpoint).setProject(projectId);

const account = new Account(client);
const avatar = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

// ===================== USER AUTHENTICATION =====================

export const createUser = async (
  email,
  password,
  username,
  isAdmin = false
) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    if (!newAccount) {
      toast.error("Failed to create account");
      return null;
    }

    const avatarUrl = avatar.getInitials(username);
    await signIn(email, password);

    const newUser = await databases.createDocument(
      databaseId,
      userCollectionId,
      ID.unique(),
      {
        userId: newAccount.$id,
        email,
        username,
        avatar: avatarUrl,
        isAdmin: isAdmin,
      }
    );

    const response = {
      account: newUser.userId,
      email: newUser.email,
      username: newUser.username,
      avatar: newUser.avatar,
      isAdmin: newUser.isAdmin,
    };

    toast.success(`Welcome ${username}`);
    return response;
  } catch (error) {
    console.error("Error creating user:", error.message);
    toast.error("Error creating user");
    return null;
  }
};

export const signIn = async (email, password) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  } catch (error) {
    console.log("Error in Sign In", error.message);
    toast.error("Error signing in");
    return null;
  }
};

export const signOut = async () => {
  try {
    await account.deleteSession("current");
    toast.success("Signed out successfully");
    return true;
  } catch (error) {
    console.error("Error signing out:", error.message);
    toast.error("Error signing out");
    return false;
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) return null;

    const currentUser = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("userId", currentAccount.$id)]
    );

    if (!currentUser || currentUser.documents.length === 0) return null;

    return {
      account: currentUser.documents[0].userId,
      email: currentUser.documents[0].email,
      username: currentUser.documents[0].username,
      avatar: currentUser.documents[0].avatar,
      isAdmin: currentUser.documents[0].isAdmin || false,
    };
  } catch (error) {
    console.error("Error getting current user:", error.message);
    return null;
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userDocs = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("userId", userId)]
    );

    if (userDocs.documents.length === 0) {
      toast.error("User not found");
      return null;
    }

    const updatedUser = await databases.updateDocument(
      databaseId,
      userCollectionId,
      userDocs.documents[0].$id,
      updates
    );

    toast.success("Profile updated successfully");
    return updatedUser;
  } catch (error) {
    console.error("Error updating profile:", error.message);
    toast.error("Error updating profile");
    return null;
  }
};

export const deleteUser = async (userId) => {
  try {
    // Delete user document
    const userDocs = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("userId", userId)]
    );

    if (userDocs.documents.length > 0) {
      await databases.deleteDocument(
        databaseId,
        userCollectionId,
        userDocs.documents[0].$id
      );
    }

    // Delete account
    await account.delete();
    toast.success("Account deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting user:", error.message);
    toast.error("Error deleting account");
    return false;
  }
};

// ===================== ADMIN FUNCTIONS =====================

export const adminSignIn = async (email, password) => {
  try {
    const session = await signIn(email, password);
    if (!session) return null;

    const user = await getCurrentUser();
    if (!user || !user.isAdmin) {
      await signOut();
      toast.error("Access denied. Admin privileges required.");
      return null;
    }

    toast.success("Admin signed in successfully");
    return { ...user, session };
  } catch (error) {
    console.error("Error in admin sign in:", error.message);
    toast.error("Admin sign in failed");
    return null;
  }
};

export const getAllUsers = async () => {
  try {
    const users = await databases.listDocuments(databaseId, userCollectionId, [
      Query.limit(100),
    ]);
    return users.documents;
  } catch (error) {
    console.error("Error fetching users:", error.message);
    toast.error("Error fetching users");
    return [];
  }
};

export const makeUserAdmin = async (userId) => {
  try {
    const userDocs = await databases.listDocuments(
      databaseId,
      userCollectionId,
      [Query.equal("userId", userId)]
    );

    if (userDocs.documents.length === 0) {
      toast.error("User not found");
      return null;
    }

    const updatedUser = await databases.updateDocument(
      databaseId,
      userCollectionId,
      userDocs.documents[0].$id,
      { isAdmin: true }
    );

    toast.success("User promoted to admin");
    return updatedUser;
  } catch (error) {
    console.error("Error making user admin:", error.message);
    toast.error("Error updating user privileges");
    return null;
  }
};

// ===================== PRODUCT FUNCTIONS =====================

export const createProduct = async (productData) => {
  try {
    const newProduct = await databases.createDocument(
      databaseId,
      productCollectionId,
      ID.unique(),
      {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        image: productData.image,
        category: productData.category,
        stock: productData.stock,
        createdAt: new Date().toISOString(),
      }
    );

    toast.success("Product created successfully");
    return newProduct;
  } catch (error) {
    console.error("Error creating product:", error.message);
    toast.error("Error creating product");
    return null;
  }
};

export const getAllProducts = async (limit = 50, offset = 0) => {
  try {
    const products = await databases.listDocuments(
      databaseId,
      productCollectionId,
      [Query.limit(limit), Query.offset(offset), Query.orderDesc("createdAt")]
    );
    return products;
  } catch (error) {
    console.error("Error fetching products:", error.message);
    toast.error("Error loading products");
    return { documents: [], total: 0 };
  }
};

export const getProductById = async (productId) => {
  try {
    const product = await databases.getDocument(
      databaseId,
      productCollectionId,
      productId
    );
    return product;
  } catch (error) {
    console.error("Error fetching product:", error.message);
    toast.error("Product not found");
    return null;
  }
};

export const updateProduct = async (productId, updates) => {
  try {
    const updatedProduct = await databases.updateDocument(
      databaseId,
      productCollectionId,
      productId,
      updates
    );

    toast.success("Product updated successfully");
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error.message);
    toast.error("Error updating product");
    return null;
  }
};

export const deleteProduct = async (productId) => {
  try {
    await databases.deleteDocument(databaseId, productCollectionId, productId);

    toast.success("Product deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting product:", error.message);
    toast.error("Error deleting product");
    return false;
  }
};

export const getProductsByCategory = async (category, limit = 20) => {
  try {
    const products = await databases.listDocuments(
      databaseId,
      productCollectionId,
      [
        Query.equal("category", category),
        Query.limit(limit),
        Query.orderDesc("createdAt"),
      ]
    );
    return products.documents;
  } catch (error) {
    console.error("Error fetching products by category:", error.message);
    toast.error("Error loading category products");
    return [];
  }
};

export const searchProducts = async (searchTerm, limit = 20) => {
  try {
    const products = await databases.listDocuments(
      databaseId,
      productCollectionId,
      [Query.search("name", searchTerm), Query.limit(limit)]
    );
    return products.documents;
  } catch (error) {
    console.error("Error searching products:", error.message);
    toast.error("Error searching products");
    return [];
  }
};

export const updateProductStock = async (productId, newStock) => {
  try {
    const updatedProduct = await databases.updateDocument(
      databaseId,
      productCollectionId,
      productId,
      { stock: newStock }
    );

    return updatedProduct;
  } catch (error) {
    console.error("Error updating stock:", error.message);
    toast.error("Error updating stock");
    return null;
  }
};

// ===================== CART FUNCTIONS =====================

export const addToCart = async (userId, productId, quantity = 1) => {
  try {
    // Validate inputs
    if (!userId) {
      throw new Error("User ID is required");
    }

    if (!productId) {
      throw new Error("Product ID is required");
    }

    console.log("Cart query params:", { userId, productId, quantity });

    // Check if item already exists in cart
    const existingItems = await databases.listDocuments(
      databaseId,
      cartCollectionId,
      [Query.equal("userId", userId), Query.equal("productId", productId)]
    );

    if (existingItems.documents.length > 0) {
      // Update quantity if item exists
      const existingItem = existingItems.documents[0];
      const updatedItem = await databases.updateDocument(
        databaseId,
        cartCollectionId,
        existingItem.$id,
        { quantity: existingItem.quantity + quantity }
      );

      toast.success("Cart updated");
      return updatedItem;
    } else {
      // Create new cart item
      const cartItem = await databases.createDocument(
        databaseId,
        cartCollectionId,
        ID.unique(),
        {
          userId,
          productId,
          quantity,
          addedAt: new Date().toISOString(),
        }
      );

      toast.success("Added to cart");
      return cartItem;
    }
  } catch (error) {
    console.error("Error adding to cart:", error.message);
    toast.error("Error adding to cart");
    return null;
  }
};

export const getCartItems = async (userId) => {
  try {
    const cartItems = await databases.listDocuments(
      databaseId,
      cartCollectionId,
      [Query.equal("userId", userId), Query.orderDesc("addedAt")]
    );

    // Get product details for each cart item
    const itemsWithProducts = await Promise.all(
      cartItems.documents.map(async (item) => {
        const product = await getProductById(item.productId);
        return {
          ...item,
          product,
        };
      })
    );

    return itemsWithProducts;
  } catch (error) {
    console.error("Error fetching cart items:", error.message);
    toast.error("Error loading cart");
    return [];
  }
};

export const updateCartItemQuantity = async (cartItemId, quantity) => {
  try {
    if (quantity <= 0) {
      return await removeFromCart(cartItemId);
    }

    const updatedItem = await databases.updateDocument(
      databaseId,
      cartCollectionId,
      cartItemId,
      { quantity }
    );

    toast.success("Cart updated");
    return updatedItem;
  } catch (error) {
    console.error("Error updating cart quantity:", error.message);
    toast.error("Error updating cart");
    return null;
  }
};

export const removeFromCart = async (cartItemId) => {
  try {
    await databases.deleteDocument(databaseId, cartCollectionId, cartItemId);

    toast.success("Removed from cart");
    return true;
  } catch (error) {
    console.error("Error removing from cart:", error.message);
    toast.error("Error removing item");
    return false;
  }
};

export const clearCart = async (userId) => {
  try {
    const cartItems = await databases.listDocuments(
      databaseId,
      cartCollectionId,
      [Query.equal("userId", userId)]
    );

    await Promise.all(
      cartItems.documents.map((item) =>
        databases.deleteDocument(databaseId, cartCollectionId, item.$id)
      )
    );

    toast.success("Cart cleared");
    return true;
  } catch (error) {
    console.error("Error clearing cart:", error.message);
    toast.error("Error clearing cart");
    return false;
  }
};

// ===================== UTILITY FUNCTIONS =====================

export const uploadFile = async (file) => {
  try {
    // Validate input
    if (!file) throw new Error("No file provided");
    if (!bucketId) throw new Error("Bucket ID not configured");

    // Upload file
    const uploadedFile = await storage.createFile(bucketId, ID.unique(), file);

    return uploadedFile;
  } catch (error) {
    console.error("Error uploading file:", error.message);
    toast.error(error.message || "Error uploading file");
    return null;
  }
};

export const getFilePreview = (fileId) => {
  try {
    if (!bucketId) throw new Error("Bucket ID not configured");
    if (!fileId) throw new Error("File ID is required");

    return storage.getFilePreview(bucketId, fileId);
  } catch (error) {
    console.error("Error getting file preview:", error);
    return null;
  }
};

export const deleteFile = async (fileId) => {
  try {
    await storage.deleteFile(bucketId, fileId);
    return true;
  } catch (error) {
    console.error("Error deleting file:", error.message);
    return false;
  }
};

// Export the client and services for direct use if needed
export { client, account, databases, storage, avatar, bucketId };
