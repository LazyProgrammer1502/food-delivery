import api from './axios';

export const authService = {
  register: (d)  => api.post('/auth/register', d),
  login:    (d)  => api.post('/auth/login', d),
  getMe:    ()   => api.get('/auth/me'),
  updateMe: (d)  => api.put('/auth/me', d),
};

export const menuService = {
  getAll:      (params) => api.get('/menu', { params }),
  getOne:      (id)     => api.get(`/menu/${id}`),
  getAdmin:    ()       => api.get('/menu/admin'),
  create:      (fd)     => api.post('/menu', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:      (id, fd) => api.put(`/menu/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  remove:      (id)     => api.delete(`/menu/${id}`),
  toggle:      (id)     => api.put(`/menu/${id}/toggle`),
};

export const categoryService = {
  getAll:  ()       => api.get('/categories'),
  create:  (d)      => api.post('/categories', d),
  update:  (id, d)  => api.put(`/categories/${id}`, d),
  remove:  (id)     => api.delete(`/categories/${id}`),
};

export const orderService = {
  place:       (d)      => api.post('/orders', d),
  getMyOrders: ()       => api.get('/orders/me'),
  getOne:      (id)     => api.get(`/orders/${id}`),
  cancel:      (id)     => api.put(`/orders/${id}/cancel`),
  getAll:      (params) => api.get('/orders', { params }),
  updateStatus:(id, s)  => api.put(`/orders/${id}/status`, { status: s }),
  getStats:    ()       => api.get('/orders/admin/stats'),
};
