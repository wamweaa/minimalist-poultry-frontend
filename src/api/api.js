import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

/* =======================
   AXIOS INSTANCE
======================= */
const api = axios.create({
  baseURL: API_BASE_URL,
});

/* =======================
   TOKEN HANDLING
======================= */
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

/* =======================
   AUTH
======================= */
export const registerUser = (data) =>
  api.post("/auth/register", data);

export const loginUser = (data) =>
  api.post("/auth/login", data);

export const getProfile = () =>
  api.get("/auth/profile");

export const updateProfile = (data) =>
  api.put("/auth/profile", data);

/* =======================
   ADMIN – USERS
======================= */
export const getAllUsers = () =>
  api.get("/admin/users");

export const getUserById = (id) =>
  api.get(`/admin/users/${id}`);

export const updateUser = (id, data) =>
  api.put(`/admin/users/${id}`, data);

/* =======================
   PRODUCTS
======================= */
export const createProduct = (data) =>
  api.post("/products", data);

export const getProducts = () =>
  api.get("/products");

export const getProductById = (id) =>
  api.get(`/products/${id}`);

export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data);

export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);

/* =======================
   SERVICES
======================= */
export const createService = (data) =>
  api.post("/services", data);

export const getServices = () =>
  api.get("/services");

export const getServiceById = (id) =>
  api.get(`/services/${id}`);

export const updateService = (id, data) =>
  api.put(`/services/${id}`, data);

export const deleteService = (id) =>
  api.delete(`/services/${id}`);

/* =======================
   RESOURCES
======================= */
export const createResource = (data) =>
  api.post("/resources", data);

export const getResources = () =>
  api.get("/resources");

export const getResourceById = (id) =>
  api.get(`/resources/${id}`);

export const downloadResource = (id) =>
  api.post(`/resources/${id}/download`);

/* =======================
   ORDERS
======================= */
export const createOrder = (data) =>
  api.post("/orders", data);

export const getUserOrders = () =>
  api.get("/orders");

export const getOrderById = (id) =>
  api.get(`/orders/${id}`);

export const updateOrderStatus = (id, data) =>
  api.put(`/orders/${id}/status`, data);

/* =======================
   PAYMENTS
======================= */
export const createPayment = (data) =>
  api.post("/payments", data);

/* =======================
   TRACKING
======================= */
export const addTracking = (orderId, data) =>
  api.post(`/orders/${orderId}/tracking`, data);

export const getTracking = (orderId) =>
  api.get(`/orders/${orderId}/tracking`);

/* =======================
   REVIEWS
======================= */
export const createReview = (data) =>
  api.post("/reviews", data);

export const getProductReviews = (productId) =>
  api.get(`/products/${productId}/reviews`);

/* =======================
   ANALYTICS & UTILITIES
======================= */
export const getAnalyticsSummary = () =>
  api.get("/admin/analytics/summary");

export const getSalesAnalytics = (days) =>
  api.get(`/admin/analytics/sales?days=${days}`);

export const getAuditLogs = () =>
  api.get("/admin/audit-logs");

export const healthCheck = () =>
  api.get("/health");

export const search = (query) =>
  api.get(`/search?q=${query}`);
