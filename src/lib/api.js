const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

async function upload(path, formData) {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    method: "POST",
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data;
}

export const api = {
  get: path => request(path),
  post: (path, body) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  patch: (path, body) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: path => request(path, { method: "DELETE" }),
  upload
};

export const auth = {
  login: body => api.post("/api/login", body),
  signup: body => api.post("/api/signup", body)
};

export const userMe = {
  get: () => api.get("/api/user/me"),
  update: formData => upload("/api/user/me", formData)
};

export const products = {
  list: (params = {}) =>
    api.get(`/api/data/products?${new URLSearchParams(params)}`),
  get: id => api.get(`/api/data/products?id=${id}`),
  detail: id => api.get(`/api/data/products?id=${id}&detail=true`),
  getBySlug: slug => api.get(`/api/data/products/${slug}`),
  create: body => api.post("/api/data/products", body),
  update: (id, body) => api.patch(`/api/data/products?id=${id}`, body),
  delete: id => api.delete(`/api/data/products?id=${id}`),
  restore: id => api.patch(`/api/data/products?id=${id}&action=restore`, {}),
  hardDelete: id => api.delete(`/api/data/products?id=${id}&permanent=true`)
};

export const variants = {
  list: (params = {}) =>
    api.get(`/api/data/product-variants?${new URLSearchParams(params)}`),
  get: id => api.get(`/api/data/product-variants?id=${id}`),
  listByProduct: (productId, params = {}) =>
    api.get(
      `/api/data/product-variants?product_id=${productId}&${new URLSearchParams(params)}`
    ),
  create: body => api.post("/api/data/product-variants", body),
  update: (id, body) => api.patch(`/api/data/product-variants?id=${id}`, body),
  delete: id => api.delete(`/api/data/product-variants?id=${id}`)
};

export const images = {
  listByProduct: productId =>
    api.get(`/api/data/images?product_id=${productId}`),
  listByVariant: variantId =>
    api.get(`/api/data/images?variant_id=${variantId}`),
  addUrl: body => api.post("/api/data/images", body),
  uploadFile: formData => upload("/api/data/images", formData),
  update: (id, type, body) =>
    api.patch(`/api/data/images?id=${id}&type=${type}`, body),
  delete: (id, type) => api.delete(`/api/data/images?id=${id}&type=${type}`)
};

export const categories = {
  list: (params = {}) =>
    api.get(`/api/data/categories?${new URLSearchParams(params)}`),
  get: id => api.get(`/api/data/categories?id=${id}`),
  listRoots: () => api.get("/api/data/categories?parent_id="),
  listByParent: parentId =>
    api.get(`/api/data/categories?parent_id=${parentId}`),
  create: body => api.post("/api/data/categories", body),
  update: (id, body) => api.patch(`/api/data/categories?id=${id}`, body),
  delete: id => api.delete(`/api/data/categories?id=${id}`),
  restore: id => api.patch(`/api/data/categories?id=${id}&action=restore`, {}),
  hardDelete: id => api.delete(`/api/data/categories?id=${id}&permanent=true`)
};

export const orders = {
  list: (params = {}) =>
    api.get(`/api/data/orders?${new URLSearchParams(params)}`),
  get: id => api.get(`/api/data/orders?id=${id}`),
  create: body => api.post("/api/data/orders", body),
  complete: id => api.patch(`/api/data/orders/${id}/complete`, {})
};

export const guestOrders = {
  list: (params = {}) =>
    api.get(`/api/data/guest-orders?${new URLSearchParams(params)}`),
  get: (id, params = {}) =>
    api.get(`/api/data/guest-orders?id=${id}&${new URLSearchParams(params)}`),
  create: body => api.post("/api/data/guest-orders", body)
};

export const productReviews = {
  list: (productId, params = {}) =>
    api.get(
      `/api/data/product-reviews?product_id=${productId}&${new URLSearchParams(params)}`
    ),
  get: id => api.get(`/api/data/product-reviews?id=${id}`),
  create: body => api.post("/api/data/product-reviews", body),
  delete: id => api.delete(`/api/data/product-reviews?id=${id}`)
};

export const addresses = {
  list: () => api.get("/api/dashboard/addresses"),
  get: id => api.get(`/api/dashboard/addresses?id=${id}`),
  create: body => api.post("/api/dashboard/addresses", body),
  update: (id, body) => api.patch(`/api/dashboard/addresses?id=${id}`, body),
  delete: id => api.delete(`/api/dashboard/addresses?id=${id}`)
};

export const wishlist = {
  list: () => api.get("/api/dashboard/wishlist"),
  add: productId =>
    api.post("/api/dashboard/wishlist", { product_id: productId }),
  remove: productId =>
    api.delete(`/api/dashboard/wishlist?product_id=${productId}`)
};

export const cart = {
  list: () => api.get("/api/dashboard/cart"),
  add: body => api.post("/api/dashboard/cart", body),
  update: (id, quantity) =>
    api.patch(`/api/dashboard/cart?id=${id}`, { quantity }),
  remove: id => api.delete(`/api/dashboard/cart?id=${id}`),
  clear: () => api.delete("/api/dashboard/cart?clear=true")
};

export const adminMe = {
  get: () => api.get("/api/admin/me")
};

export const adminOrders = {
  list: (params = {}) =>
    api.get(`/api/admin/orders?${new URLSearchParams(params)}`),
  get: id => api.get(`/api/admin/orders?id=${id}`),
  update: (id, body) => api.patch(`/api/admin/orders?id=${id}`, body)
};

export const adminGuestOrders = {
  list: (params = {}) =>
    api.get(`/api/admin/guest-orders?${new URLSearchParams(params)}`),
  get: id => api.get(`/api/admin/guest-orders?id=${id}`),
  update: (id, body) => api.patch(`/api/admin/guest-orders?id=${id}`, body)
};

export const adminUsers = {
  list: (params = {}) =>
    api.get(`/api/admin/users?${new URLSearchParams(params)}`),
  get: id => api.get(`/api/admin/users?id=${id}`),
  update: (id, body) => api.patch(`/api/admin/users?id=${id}`, body),
  delete: id => api.delete(`/api/admin/users?id=${id}`),
  addresses: id => api.get(`/api/admin/users/${id}/addresses`),
  orderHistory: (id, params = {}) =>
    api.get(`/api/admin/users/${id}/orders?${new URLSearchParams(params)}`),
  wishlist: id => api.get(`/api/admin/users/${id}/wishlist`)
};

export const admins = {
  list: (params = {}) =>
    api.get(`/api/admin/admins?${new URLSearchParams(params)}`),
  get: id => api.get(`/api/admin/admins?id=${id}`),
  create: body => api.post("/api/admin/admins", body),
  update: (id, body) => api.patch(`/api/admin/admins?id=${id}`, body),
  delete: id => api.delete(`/api/admin/admins?id=${id}`)
};

export const feedbacks = {
  list: (params = {}) =>
    api.get(`/api/admin/feedbacks?${new URLSearchParams(params)}`),
  get: id => api.get(`/api/admin/feedbacks?id=${id}`),
  delete: id => api.delete(`/api/admin/feedbacks?id=${id}`)
};

export const inventoryLogs = {
  list: (params = {}) =>
    api.get(`/api/admin/inventory-logs?${new URLSearchParams(params)}`),
  create: body => api.post("/api/admin/inventory-logs", body)
};

export const promoCodes = {
  list: (params = {}) =>
    api.get(`/api/admin/promo-codes?${new URLSearchParams(params)}`),
  get: id => api.get(`/api/admin/promo-codes?id=${id}`),
  create: body => api.post("/api/admin/promo-codes", body),
  update: (id, body) => api.patch(`/api/admin/promo-codes?id=${id}`, body),
  delete: id => api.delete(`/api/admin/promo-codes?id=${id}`)
};

export const shippingMethods = {
  list: (params = {}) =>
    api.get(`/api/admin/shipping-methods?${new URLSearchParams(params)}`),
  create: body => api.post("/api/admin/shipping-methods", body),
  update: (id, body) => api.patch(`/api/admin/shipping-methods?id=${id}`, body),
  delete: id => api.delete(`/api/admin/shipping-methods?id=${id}`)
};

export const bannerAds = {
  list: (params = {}) =>
    api.get(`/api/admin/banner-ads?${new URLSearchParams(params)}`),
  create: body => api.post("/api/admin/banner-ads", body),
  update: (id, body) => api.patch(`/api/admin/banner-ads?id=${id}`, body),
  delete: id => api.delete(`/api/admin/banner-ads?id=${id}`)
};

export const suppliers = {
  list: (params = {}) =>
    api.get(`/api/admin/suppliers?${new URLSearchParams(params)}`),
  get: id => api.get(`/api/admin/suppliers?id=${id}`),
  create: body => api.post("/api/admin/suppliers", body),
  update: (id, body) => api.patch(`/api/admin/suppliers?id=${id}`, body),
  delete: id => api.delete(`/api/admin/suppliers?id=${id}`)
};
