// ─── API Base ─────────────────────────────────────────────────────────────────
const BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:6969';

// ─── Token helpers ────────────────────────────────────────────────────────────
export const tokenStorage = {
  get: () => localStorage.getItem('nkp_token'),
  set: (token) => localStorage.setItem('nkp_token', token),
  remove: () => localStorage.removeItem('nkp_token'),
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = tokenStorage.get();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // Handle empty bodies (e.g. 204 No Content)
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    // Backend sends { success:false, message:"..." } on errors
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return data; // { success, message, data }
}

// Multipart (file upload) — no Content-Type header so browser sets boundary
async function requestMultipart(path, formData, method = 'POST') {
  const token = tokenStorage.get();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { method, headers, body: formData });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) throw new Error(data.message || `Upload failed: ${res.status}`);
  return data;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
// Backend: LoginRequest record has only `password` field
export const authApi = {
  login: (password) =>
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password }),
      }),

  verify: () => request('/api/auth/verify'),
};

// ─── Projects API ─────────────────────────────────────────────────────────────
// Backend: ApiResponse<T> = { success, message, data }
// Backend: ProjectResponse has images: ImageDto[] = { id, url, publicId, caption }
export const projectsApi = {
  // GET /api/projects — visible only (public)
  getPublic: () => request('/api/projects'),

  // GET /api/projects?admin=true — all (admin)
  getAll: () => request('/api/projects?admin=true'),

  // GET /api/projects/:id
  getById: (id) => request(`/api/projects/${id}`),

  // POST /api/projects
  create: (projectData) =>
      request('/api/projects', {
        method: 'POST',
        body: JSON.stringify(projectData),
      }),

  // PUT /api/projects/:id
  update: (id, projectData) =>
      request(`/api/projects/${id}`, {
        method: 'PUT',
        body: JSON.stringify(projectData),
      }),

  // PATCH /api/projects/:id/toggle
  toggleVisibility: (id) =>
      request(`/api/projects/${id}/toggle`, { method: 'PATCH' }),

  // DELETE /api/projects/:id
  delete: (id) =>
      request(`/api/projects/${id}`, { method: 'DELETE' }),

  // POST /api/projects/:id/images/upload  (multipart, field: "image")
  uploadImage: (id, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return requestMultipart(`/api/projects/${id}/images/upload`, formData);
  },

  // DELETE /api/projects/:id/images/:publicId
  // Cloudinary publicId includes folder prefix e.g. "nkp-construction/xyzabc"
  // encodeURIComponent encodes the "/" → "%2F". Spring Boot 3 with the default
  // path matcher decodes %2F in @PathVariable correctly.
  deleteImage: (id, publicId) =>
      request(`/api/projects/${id}/images/${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      }),
};

// ─── Reviews API ──────────────────────────────────────────────────────────────
export const reviewsApi = {
  getAll: () => request('/api/reviews'),
  create: (reviewData) =>
      request('/api/reviews', {
        method: 'POST',
        body: JSON.stringify(reviewData),
      }),
  delete: (id) =>
      request(`/api/reviews/${id}`, { method: 'DELETE' }),
};

// ─── Upload API (standalone Cloudinary upload without attaching to a project) ──
export const uploadApi = {
  // POST /api/upload/single  (field: "image")
  single: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return requestMultipart('/api/upload/single', formData);
  },

  // POST /api/upload/multiple  (field: "images", max 10)
  multiple: (files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    return requestMultipart('/api/upload/multiple', formData);
  },
};