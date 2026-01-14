import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Store IDs for later use
  const [userId, setUserId] = useState('');
  const [productId, setProductId] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [resourceId, setResourceId] = useState('');
  const [orderId, setOrderId] = useState('');
  
  // Form states
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'customer'
  });
  
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postal_code: ''
  });
  
  const [productData, setProductData] = useState({
    name: '',
    description: '',
    price: '',
    discounted_price: '',
    category: '',
    subcategory: '',
    brand: '',
    sku: '',
    stock_quantity: '',
    weight: '',
    color: '',
    size: '',
    image_url: '',
    tags: '',
    is_featured: false
  });
  
  const [serviceData, setServiceData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    requires_booking: false,
    max_participants: '',
    image_url: ''
  });
  
  const [resourceData, setResourceData] = useState({
    title: '',
    description: '',
    type: '',
    category: '',
    file_url: '',
    thumbnail_url: '',
    price: '',
    is_free: false,
    tags: ''
  });
  
  const [orderData, setOrderData] = useState({
    items: [{ item_type: 'product', item_id: '', quantity: 1, variant: '' }],
    shipping_address: '',
    billing_address: '',
    shipping_method: '',
    notes: ''
  });
  
  const [paymentData, setPaymentData] = useState({
    order_id: '',
    amount: '',
    method: 'credit_card',
    currency: 'USD'
  });
  
  const [trackingData, setTrackingData] = useState({
    status: 'in_transit',
    location: '',
    description: '',
    tracking_number: '',
    estimated_delivery: ''
  });
  
  const [reviewData, setReviewData] = useState({
    product_id: '',
    service_id: '',
    rating: 5,
    title: '',
    comment: '',
    is_verified_purchase: false
  });
  
  const [analyticsFilters, setAnalyticsFilters] = useState({
    days: 30
  });
  
  const [searchQuery, setSearchQuery] = useState('');

  // Configure axios
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const handleResponse = (data) => {
    setResponse(JSON.stringify(data, null, 2));
  };

  const handleError = (error) => {
    setResponse(`Error: ${error.response?.data?.error || error.message}`);
  };

  // ============ HELPER FUNCTIONS ============

  const handleFormChange = (setter) => (e) => {
    const { name, value, type, checked } = e.target;
    setter(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayFormChange = (setter, index, field, value) => {
    setter(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const addOrderItem = () => {
    setOrderData(prev => ({
      ...prev,
      items: [...prev.items, { item_type: 'product', item_id: '', quantity: 1, variant: '' }]
    }));
  };

  const removeOrderItem = (index) => {
    setOrderData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // ============ AUTHENTICATION OPERATIONS ============

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/auth/register', registerData);
      const token = res.data.access_token;
      const role = res.data.user.role;
      setToken(token);
      setUserRole(role);
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/auth/login', loginData);
      const token = res.data.access_token;
      const role = res.data.user.role;
      setToken(token);
      setUserRole(role);
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getProfile = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/auth/profile');
      setProfileData({
        first_name: res.data.user.first_name || '',
        last_name: res.data.user.last_name || '',
        phone: res.data.user.phone || '',
        address: res.data.user.address || '',
        city: res.data.user.city || '',
        country: res.data.user.country || '',
        postal_code: res.data.user.postal_code || ''
      });
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put('/auth/profile', profileData);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const logout = () => {
    setToken('');
    setUserRole('');
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    delete axios.defaults.headers.common['Authorization'];
    setResponse('Logged out');
  };

  // ============ ADMIN USER MANAGEMENT ============

  const getAllUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/users');
      if (res.data.users && res.data.users.length > 0) {
        setUserId(res.data.users[0].id);
      }
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getSpecificUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`/admin/users/${userId}`);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const updateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(`/admin/users/${userId}`, {
        role: 'admin',
        is_verified: true,
        is_active: true
      });
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  // ============ PRODUCT MANAGEMENT ============

  const createProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        ...productData,
        price: parseFloat(productData.price),
        discounted_price: productData.discounted_price ? parseFloat(productData.discounted_price) : null,
        stock_quantity: parseInt(productData.stock_quantity) || 0,
        weight: productData.weight ? parseFloat(productData.weight) : null,
        tags: productData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        gallery_images: [],
        specifications: {}
      };
      
      const res = await axios.post('/products', dataToSend);
      if (res.data.product) {
        setProductId(res.data.product.id);
      }
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getAllProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/products');
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`/products/${productId}`);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const updateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        ...productData,
        price: parseFloat(productData.price),
        stock_quantity: parseInt(productData.stock_quantity) || 0
      };
      
      const res = await axios.put(`/products/${productId}`, dataToSend);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const deleteProduct = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(`/products/${productId}`);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  // ============ SERVICE MANAGEMENT ============

  const createService = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        ...serviceData,
        price: parseFloat(serviceData.price),
        max_participants: serviceData.max_participants ? parseInt(serviceData.max_participants) : null,
        availability: {}
      };
      
      const res = await axios.post('/services', dataToSend);
      if (res.data.service) {
        setServiceId(res.data.service.id);
      }
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getAllServices = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/services');
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getService = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`/services/${serviceId}`);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const updateService = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(`/services/${serviceId}`, serviceData);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const deleteService = async () => {
    setLoading(true);
    try {
      const res = await axios.delete(`/services/${serviceId}`);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  // ============ RESOURCE MANAGEMENT ============

  const createResource = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        ...resourceData,
        price: parseFloat(resourceData.price) || 0,
        tags: resourceData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        metadata: {}
      };
      
      const res = await axios.post('/resources', dataToSend);
      if (res.data.resource) {
        setResourceId(res.data.resource.id);
      }
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getAllResources = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/resources');
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getResource = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`/resources/${resourceId}`);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const downloadResource = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`/resources/${resourceId}/download`);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  // ============ ORDER MANAGEMENT ============

  const createOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        ...orderData,
        items: orderData.items.map(item => ({
          ...item,
          quantity: parseInt(item.quantity) || 1
        }))
      };
      
      const res = await axios.post('/orders', dataToSend);
      if (res.data.order) {
        setOrderId(res.data.order.id);
        setPaymentData(prev => ({ ...prev, order_id: res.data.order.id }));
      }
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getUserOrders = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/orders');
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getOrder = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`/orders/${orderId}`);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const updateOrderStatus = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(`/orders/${orderId}/status`, {
        status: 'processing'
      });
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  // ============ PAYMENT PROCESSING ============

  const createPayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        ...paymentData,
        amount: parseFloat(paymentData.amount),
        payment_details: {}
      };
      
      const res = await axios.post('/payments', dataToSend);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  // ============ DELIVERY TRACKING ============

  const addTracking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`/orders/${orderId}/tracking`, trackingData);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getTracking = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/orders/${orderId}/tracking`);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  // ============ REVIEWS & RATINGS ============

  const createReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        ...reviewData,
        rating: parseInt(reviewData.rating)
      };
      
      const res = await axios.post('/reviews', dataToSend);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getProductReviews = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/products/${productId}/reviews`);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  // ============ ANALYTICS & ADMIN ============

  const getAnalyticsSummary = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/analytics/summary');
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getSalesAnalytics = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`/admin/analytics/sales?days=${analyticsFilters.days}`);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const getAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/admin/audit-logs');
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  // ============ UTILITY ENDPOINTS ============

  const healthCheck = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/health');
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.get(`/search?q=${searchQuery}`);
      handleResponse(res.data);
    } catch (error) {
      handleError(error);
    }
    setLoading(false);
  };

  // Form sections state
  const [activeSection, setActiveSection] = useState('auth');

  return (
    <div className="app">
      <header className="header">
        <h1>E-Commerce API Tester</h1>
        <div className="auth-status">
          <span>Status: {token ? `Logged in as ${userRole}` : 'Not logged in'}</span>
          <span>Token: {token ? '✓' : '✗'}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="container">
        <div className="sidebar">
          <h2>Operations</h2>
          
          <div className="nav-section">
            <button 
              className={`nav-btn ${activeSection === 'auth' ? 'active' : ''}`}
              onClick={() => setActiveSection('auth')}
            >
              🔐 Authentication
            </button>
            
            <button 
              className={`nav-btn ${activeSection === 'users' ? 'active' : ''}`}
              onClick={() => setActiveSection('users')}
            >
              👥 User Management
            </button>
            
            <button 
              className={`nav-btn ${activeSection === 'products' ? 'active' : ''}`}
              onClick={() => setActiveSection('products')}
            >
              🛍️ Products
            </button>
            
            <button 
              className={`nav-btn ${activeSection === 'services' ? 'active' : ''}`}
              onClick={() => setActiveSection('services')}
            >
              ⚙️ Services
            </button>
            
            <button 
              className={`nav-btn ${activeSection === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveSection('resources')}
            >
              📚 Resources
            </button>
            
            <button 
              className={`nav-btn ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSection('orders')}
            >
              📦 Orders
            </button>
            
            <button 
              className={`nav-btn ${activeSection === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveSection('payments')}
            >
              💰 Payments
            </button>
            
            <button 
              className={`nav-btn ${activeSection === 'tracking' ? 'active' : ''}`}
              onClick={() => setActiveSection('tracking')}
            >
              🚚 Tracking
            </button>
            
            <button 
              className={`nav-btn ${activeSection === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveSection('reviews')}
            >
              ⭐ Reviews
            </button>
            
            <button 
              className={`nav-btn ${activeSection === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveSection('analytics')}
            >
              📊 Analytics
            </button>
            
            <button 
              className={`nav-btn ${activeSection === 'utilities' ? 'active' : ''}`}
              onClick={() => setActiveSection('utilities')}
            >
              🔧 Utilities
            </button>
          </div>
        </div>

        <div className="content">
          <div className="forms-container">
            {/* AUTHENTICATION SECTION */}
            {activeSection === 'auth' && (
              <div className="section">
                <h2>🔐 Authentication</h2>
                
                <div className="form-group">
                  <h3>Register</h3>
                  <form onSubmit={handleRegister}>
                    <input type="text" name="username" placeholder="Username" value={registerData.username} onChange={handleFormChange(setRegisterData)} required />
                    <input type="email" name="email" placeholder="Email" value={registerData.email} onChange={handleFormChange(setRegisterData)} required />
                    <input type="password" name="password" placeholder="Password" value={registerData.password} onChange={handleFormChange(setRegisterData)} required />
                    <input type="text" name="first_name" placeholder="First Name" value={registerData.first_name} onChange={handleFormChange(setRegisterData)} />
                    <input type="text" name="last_name" placeholder="Last Name" value={registerData.last_name} onChange={handleFormChange(setRegisterData)} />
                    <input type="text" name="phone" placeholder="Phone" value={registerData.phone} onChange={handleFormChange(setRegisterData)} />
                    <select name="role" value={registerData.role} onChange={handleFormChange(setRegisterData)}>
                      <option value="customer">Customer</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button type="submit" disabled={loading}>Register</button>
                  </form>
                </div>

                <div className="form-group">
                  <h3>Login</h3>
                  <form onSubmit={handleLogin}>
                    <input type="email" name="email" placeholder="Email" value={loginData.email} onChange={handleFormChange(setLoginData)} required />
                    <input type="password" name="password" placeholder="Password" value={loginData.password} onChange={handleFormChange(setLoginData)} required />
                    <button type="submit" disabled={loading}>Login</button>
                  </form>
                </div>

                <div className="form-group">
                  <h3>Profile Management</h3>
                  <button onClick={getProfile} disabled={!token}>Get Profile</button>
                  <form onSubmit={updateProfile}>
                    <input type="text" name="first_name" placeholder="First Name" value={profileData.first_name} onChange={handleFormChange(setProfileData)} />
                    <input type="text" name="last_name" placeholder="Last Name" value={profileData.last_name} onChange={handleFormChange(setProfileData)} />
                    <input type="text" name="phone" placeholder="Phone" value={profileData.phone} onChange={handleFormChange(setProfileData)} />
                    <input type="text" name="address" placeholder="Address" value={profileData.address} onChange={handleFormChange(setProfileData)} />
                    <input type="text" name="city" placeholder="City" value={profileData.city} onChange={handleFormChange(setProfileData)} />
                    <input type="text" name="country" placeholder="Country" value={profileData.country} onChange={handleFormChange(setProfileData)} />
                    <input type="text" name="postal_code" placeholder="Postal Code" value={profileData.postal_code} onChange={handleFormChange(setProfileData)} />
                    <button type="submit" disabled={!token || loading}>Update Profile</button>
                  </form>
                </div>
              </div>
            )}

            {/* USER MANAGEMENT SECTION */}
            {activeSection === 'users' && (
              <div className="section">
                <h2>👥 User Management (Admin Only)</h2>
                
                <div className="form-group">
                  <h3>Get Users</h3>
                  <button onClick={getAllUsers} disabled={!token || userRole !== 'admin'}>Get All Users</button>
                  
                  <h3>Specific User</h3>
                  <form onSubmit={getSpecificUser}>
                    <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
                    <button type="submit" disabled={!token || userRole !== 'admin'}>Get User</button>
                  </form>
                  
                  <h3>Update User</h3>
                  <form onSubmit={updateUser}>
                    <input type="text" placeholder="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} />
                    <button type="submit" disabled={!token || userRole !== 'admin'}>Update User (Set as Admin)</button>
                  </form>
                </div>
              </div>
            )}

            {/* PRODUCTS SECTION */}
            {activeSection === 'products' && (
              <div className="section">
                <h2>🛍️ Product Management</h2>
                
                <div className="form-group">
                  <h3>Create Product</h3>
                  <form onSubmit={createProduct}>
                    <input type="text" name="name" placeholder="Product Name" value={productData.name} onChange={handleFormChange(setProductData)} required />
                    <textarea name="description" placeholder="Description" value={productData.description} onChange={handleFormChange(setProductData)} rows="3" />
                    <input type="number" name="price" placeholder="Price" value={productData.price} onChange={handleFormChange(setProductData)} required step="0.01" />
                    <input type="number" name="discounted_price" placeholder="Discounted Price" value={productData.discounted_price} onChange={handleFormChange(setProductData)} step="0.01" />
                    <input type="text" name="category" placeholder="Category" value={productData.category} onChange={handleFormChange(setProductData)} />
                    <input type="text" name="subcategory" placeholder="Subcategory" value={productData.subcategory} onChange={handleFormChange(setProductData)} />
                    <input type="text" name="brand" placeholder="Brand" value={productData.brand} onChange={handleFormChange(setProductData)} />
                    <input type="text" name="sku" placeholder="SKU" value={productData.sku} onChange={handleFormChange(setProductData)} required />
                    <input type="number" name="stock_quantity" placeholder="Stock Quantity" value={productData.stock_quantity} onChange={handleFormChange(setProductData)} />
                    <input type="number" name="weight" placeholder="Weight (kg)" value={productData.weight} onChange={handleFormChange(setProductData)} step="0.01" />
                    <input type="text" name="color" placeholder="Color" value={productData.color} onChange={handleFormChange(setProductData)} />
                    <input type="text" name="size" placeholder="Size" value={productData.size} onChange={handleFormChange(setProductData)} />
                    <input type="text" name="image_url" placeholder="Image URL" value={productData.image_url} onChange={handleFormChange(setProductData)} />
                    <input type="text" name="tags" placeholder="Tags (comma separated)" value={productData.tags} onChange={handleFormChange(setProductData)} />
                    <label>
                      <input type="checkbox" name="is_featured" checked={productData.is_featured} onChange={handleFormChange(setProductData)} />
                      Featured Product
                    </label>
                    <button type="submit" disabled={!token || (userRole !== 'vendor' && userRole !== 'admin')}>Create Product</button>
                  </form>
                </div>

                <div className="form-group">
                  <h3>Product Operations</h3>
                  <button onClick={getAllProducts}>Get All Products</button>
                  
                  <form onSubmit={getProduct}>
                    <input type="text" placeholder="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
                    <button type="submit">Get Product</button>
                  </form>
                  
                  <form onSubmit={updateProduct}>
                    <input type="text" placeholder="Product ID" value={productId} onChange={(e) => setProductId(e.target.value)} />
                    <button type="submit" disabled={!token || (userRole !== 'vendor' && userRole !== 'admin')}>Update Product</button>
                  </form>
                  
                  <button onClick={deleteProduct} disabled={!token || (userRole !== 'vendor' && userRole !== 'admin')}>Delete Product</button>
                </div>
              </div>
            )}

            {/* SERVICES SECTION */}
            {activeSection === 'services' && (
              <div className="section">
                <h2>⚙️ Service Management</h2>
                
                <div className="form-group">
                  <h3>Create Service</h3>
                  <form onSubmit={createService}>
                    <input type="text" name="name" placeholder="Service Name" value={serviceData.name} onChange={handleFormChange(setServiceData)} required />
                    <textarea name="description" placeholder="Description" value={serviceData.description} onChange={handleFormChange(setServiceData)} rows="3" />
                    <input type="number" name="price" placeholder="Price" value={serviceData.price} onChange={handleFormChange(setServiceData)} required step="0.01" />
                    <input type="text" name="duration" placeholder="Duration (e.g., 2 hours)" value={serviceData.duration} onChange={handleFormChange(setServiceData)} required />
                    <input type="text" name="category" placeholder="Category" value={serviceData.category} onChange={handleFormChange(setServiceData)} />
                    <input type="number" name="max_participants" placeholder="Max Participants" value={serviceData.max_participants} onChange={handleFormChange(setServiceData)} />
                    <input type="text" name="image_url" placeholder="Image URL" value={serviceData.image_url} onChange={handleFormChange(setServiceData)} />
                    <label>
                      <input type="checkbox" name="requires_booking" checked={serviceData.requires_booking} onChange={handleFormChange(setServiceData)} />
                      Requires Booking
                    </label>
                    <button type="submit" disabled={!token || (userRole !== 'vendor' && userRole !== 'admin')}>Create Service</button>
                  </form>
                </div>

                <div className="form-group">
                  <h3>Service Operations</h3>
                  <button onClick={getAllServices}>Get All Services</button>
                  
                  <form onSubmit={getService}>
                    <input type="text" placeholder="Service ID" value={serviceId} onChange={(e) => setServiceId(e.target.value)} />
                    <button type="submit">Get Service</button>
                  </form>
                  
                  <form onSubmit={updateService}>
                    <input type="text" placeholder="Service ID" value={serviceId} onChange={(e) => setServiceId(e.target.value)} />
                    <button type="submit" disabled={!token || (userRole !== 'vendor' && userRole !== 'admin')}>Update Service</button>
                  </form>
                  
                  <button onClick={deleteService} disabled={!token || (userRole !== 'vendor' && userRole !== 'admin')}>Delete Service</button>
                </div>
              </div>
            )}

            {/* RESOURCES SECTION */}
            {activeSection === 'resources' && (
              <div className="section">
                <h2>📚 Resource Management</h2>
                
                <div className="form-group">
                  <h3>Create Resource</h3>
                  <form onSubmit={createResource}>
                    <input type="text" name="title" placeholder="Title" value={resourceData.title} onChange={handleFormChange(setResourceData)} required />
                    <textarea name="description" placeholder="Description" value={resourceData.description} onChange={handleFormChange(setResourceData)} rows="3" />
                    <select name="type" value={resourceData.type} onChange={handleFormChange(setResourceData)} required>
                      <option value="">Select Type</option>
                      <option value="ebook">E-book</option>
                      <option value="video">Video</option>
                      <option value="template">Template</option>
                      <option value="tool">Tool</option>
                    </select>
                    <input type="text" name="category" placeholder="Category" value={resourceData.category} onChange={handleFormChange(setResourceData)} />
                    <input type="text" name="file_url" placeholder="File URL" value={resourceData.file_url} onChange={handleFormChange(setResourceData)} />
                    <input type="text" name="thumbnail_url" placeholder="Thumbnail URL" value={resourceData.thumbnail_url} onChange={handleFormChange(setResourceData)} />
                    <input type="number" name="price" placeholder="Price" value={resourceData.price} onChange={handleFormChange(setResourceData)} step="0.01" />
                    <label>
                      <input type="checkbox" name="is_free" checked={resourceData.is_free} onChange={handleFormChange(setResourceData)} />
                      Is Free
                    </label>
                    <input type="text" name="tags" placeholder="Tags (comma separated)" value={resourceData.tags} onChange={handleFormChange(setResourceData)} />
                    <button type="submit" disabled={!token}>Create Resource</button>
                  </form>
                </div>

                <div className="form-group">
                  <h3>Resource Operations</h3>
                  <button onClick={getAllResources}>Get All Resources</button>
                  
                  <form onSubmit={getResource}>
                    <input type="text" placeholder="Resource ID" value={resourceId} onChange={(e) => setResourceId(e.target.value)} />
                    <button type="submit">Get Resource</button>
                  </form>
                  
                  <button onClick={downloadResource} disabled={!token}>Download Resource</button>
                </div>
              </div>
            )}

            {/* ORDERS SECTION */}
            {activeSection === 'orders' && (
              <div className="section">
                <h2>📦 Order Management</h2>
                
                <div className="form-group">
                  <h3>Create Order</h3>
                  <form onSubmit={createOrder}>
                    {orderData.items.map((item, index) => (
                      <div key={index} className="order-item">
                        <h4>Item {index + 1}</h4>
                        <select 
                          value={item.item_type} 
                          onChange={(e) => handleArrayFormChange(setOrderData, index, 'item_type', e.target.value)}
                        >
                          <option value="product">Product</option>
                          <option value="service">Service</option>
                          <option value="resource">Resource</option>
                        </select>
                        <input 
                          type="text" 
                          placeholder="Item ID" 
                          value={item.item_id} 
                          onChange={(e) => handleArrayFormChange(setOrderData, index, 'item_id', e.target.value)} 
                          required 
                        />
                        <input 
                          type="number" 
                          placeholder="Quantity" 
                          value={item.quantity} 
                          onChange={(e) => handleArrayFormChange(setOrderData, index, 'quantity', e.target.value)} 
                          min="1"
                          required 
                        />
                        <input 
                          type="text" 
                          placeholder="Variant (optional)" 
                          value={item.variant} 
                          onChange={(e) => handleArrayFormChange(setOrderData, index, 'variant', e.target.value)} 
                        />
                        {index > 0 && (
                          <button type="button" onClick={() => removeOrderItem(index)} className="remove-btn">
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addOrderItem} className="add-btn">Add Item</button>
                    
                    <input type="text" name="shipping_address" placeholder="Shipping Address" value={orderData.shipping_address} onChange={handleFormChange(setOrderData)} required />
                    <input type="text" name="billing_address" placeholder="Billing Address" value={orderData.billing_address} onChange={handleFormChange(setOrderData)} />
                    <input type="text" name="shipping_method" placeholder="Shipping Method" value={orderData.shipping_method} onChange={handleFormChange(setOrderData)} />
                    <textarea name="notes" placeholder="Notes" value={orderData.notes} onChange={handleFormChange(setOrderData)} rows="2" />
                    <button type="submit" disabled={!token}>Create Order</button>
                  </form>
                </div>

                <div className="form-group">
                  <h3>Order Operations</h3>
                  <button onClick={getUserOrders} disabled={!token}>Get My Orders</button>
                  
                  <form onSubmit={getOrder}>
                    <input type="text" placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
                    <button type="submit" disabled={!token}>Get Order</button>
                  </form>
                  
                  <form onSubmit={updateOrderStatus}>
                    <input type="text" placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
                    <button type="submit" disabled={!token || (userRole !== 'vendor' && userRole !== 'admin')}>Update Status to Processing</button>
                  </form>
                </div>
              </div>
            )}

            {/* PAYMENTS SECTION */}
            {activeSection === 'payments' && (
              <div className="section">
                <h2>💰 Payment Processing</h2>
                
                <div className="form-group">
                  <h3>Create Payment</h3>
                  <form onSubmit={createPayment}>
                    <input type="text" name="order_id" placeholder="Order ID" value={paymentData.order_id} onChange={handleFormChange(setPaymentData)} required />
                    <input type="number" name="amount" placeholder="Amount" value={paymentData.amount} onChange={handleFormChange(setPaymentData)} required step="0.01" />
                    <select name="method" value={paymentData.method} onChange={handleFormChange(setPaymentData)}>
                      <option value="credit_card">Credit Card</option>
                      <option value="paypal">PayPal</option>
                      <option value="stripe">Stripe</option>
                      <option value="cash">Cash</option>
                    </select>
                    <input type="text" name="currency" placeholder="Currency" value={paymentData.currency} onChange={handleFormChange(setPaymentData)} />
                    <button type="submit" disabled={!token}>Create Payment</button>
                  </form>
                </div>
              </div>
            )}

            {/* TRACKING SECTION */}
            {activeSection === 'tracking' && (
              <div className="section">
                <h2>🚚 Delivery Tracking</h2>
                
                <div className="form-group">
                  <h3>Add Tracking</h3>
                  <form onSubmit={addTracking}>
                    <input type="text" placeholder="Order ID" value={orderId} onChange={(e) => setOrderId(e.target.value)} required />
                    <select name="status" value={trackingData.status} onChange={handleFormChange(setTrackingData)}>
                      <option value="picked_up">Picked Up</option>
                      <option value="in_transit">In Transit</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="delayed">Delayed</option>
                    </select>
                    <input type="text" name="location" placeholder="Location" value={trackingData.location} onChange={handleFormChange(setTrackingData)} required />
                    <input type="text" name="tracking_number" placeholder="Tracking Number" value={trackingData.tracking_number} onChange={handleFormChange(setTrackingData)} />
                    <input type="datetime-local" name="estimated_delivery" placeholder="Estimated Delivery" value={trackingData.estimated_delivery} onChange={handleFormChange(setTrackingData)} />
                    <textarea name="description" placeholder="Description" value={trackingData.description} onChange={handleFormChange(setTrackingData)} rows="2" />
                    <button type="submit" disabled={!token || (userRole !== 'vendor' && userRole !== 'admin')}>Add Tracking</button>
                  </form>
                </div>

                <div className="form-group">
                  <h3>Get Tracking</h3>
                  <button onClick={getTracking} disabled={!token}>Get Tracking Info</button>
                </div>
              </div>
            )}

            {/* REVIEWS SECTION */}
            {activeSection === 'reviews' && (
              <div className="section">
                <h2>⭐ Reviews & Ratings</h2>
                
                <div className="form-group">
                  <h3>Create Review</h3>
                  <form onSubmit={createReview}>
                    <input type="text" name="product_id" placeholder="Product ID" value={reviewData.product_id} onChange={handleFormChange(setReviewData)} />
                    <input type="text" name="service_id" placeholder="Service ID" value={reviewData.service_id} onChange={handleFormChange(setReviewData)} />
                    <input type="number" name="rating" placeholder="Rating (1-5)" value={reviewData.rating} onChange={handleFormChange(setReviewData)} min="1" max="5" required />
                    <input type="text" name="title" placeholder="Title" value={reviewData.title} onChange={handleFormChange(setReviewData)} />
                    <textarea name="comment" placeholder="Comment" value={reviewData.comment} onChange={handleFormChange(setReviewData)} rows="3" />
                    <label>
                      <input type="checkbox" name="is_verified_purchase" checked={reviewData.is_verified_purchase} onChange={handleFormChange(setReviewData)} />
                      Verified Purchase
                    </label>
                    <button type="submit" disabled={!token}>Create Review</button>
                  </form>
                </div>

                <div className="form-group">
                  <h3>Get Product Reviews</h3>
                  <button onClick={getProductReviews}>Get Reviews</button>
                </div>
              </div>
            )}

            {/* ANALYTICS SECTION */}
            {activeSection === 'analytics' && (
              <div className="section">
                <h2>📊 Analytics & Admin Dashboard</h2>
                
                <div className="form-group">
                  <h3>Analytics</h3>
                  <button onClick={getAnalyticsSummary} disabled={!token || userRole !== 'admin'}>Get Analytics Summary</button>
                  
                  <form onSubmit={getSalesAnalytics}>
                    <input type="number" name="days" placeholder="Days (default: 30)" value={analyticsFilters.days} onChange={(e) => setAnalyticsFilters({...analyticsFilters, days: e.target.value})} />
                    <button type="submit" disabled={!token || userRole !== 'admin'}>Get Sales Analytics</button>
                  </form>
                  
                  <button onClick={getAuditLogs} disabled={!token || userRole !== 'admin'}>Get Audit Logs</button>
                </div>
              </div>
            )}

            {/* UTILITIES SECTION */}
            {activeSection === 'utilities' && (
              <div className="section">
                <h2>🔧 Utility Endpoints</h2>
                
                <div className="form-group">
                  <h3>Health Check</h3>
                  <button onClick={healthCheck}>Check API Health</button>
                  
                  <h3>Search</h3>
                  <form onSubmit={handleSearch}>
                    <input type="text" placeholder="Search query" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} required />
                    <button type="submit">Search</button>
                  </form>
                </div>
              </div>
            )}
          </div>

          <div className="response-section">
            <div className="response-header">
              <h2>API Response</h2>
              <div className="loading">{loading && 'Loading...'}</div>
            </div>
            <div className="response-container">
              <pre className="response">{response || 'Response will appear here...'}</pre>
            </div>
            
            <div className="ids-display">
              <h3>Stored IDs</h3>
              <div className="ids-grid">
                <div><strong>User ID:</strong> {userId || 'None'}</div>
                <div><strong>Product ID:</strong> {productId || 'None'}</div>
                <div><strong>Service ID:</strong> {serviceId || 'None'}</div>
                <div><strong>Resource ID:</strong> {resourceId || 'None'}</div>
                <div><strong>Order ID:</strong> {orderId || 'None'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;