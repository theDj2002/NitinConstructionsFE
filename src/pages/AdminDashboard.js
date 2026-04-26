import { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { projectsApi, reviewsApi } from '@/services/api';
import {
  ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff,
  Upload, X, ImagePlus, Loader2, AlertCircle,
  MessageSquare, Star, Trash
} from 'lucide-react';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Badge({ visible }) {
  return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
          visible ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
      }`}>
      {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
        {visible ? 'Visible' : 'Hidden'}
    </span>
  );
}

function Spinner() {
  return <Loader2 className="w-4 h-4 animate-spin" />;
}

// ─── Project Form Modal ───────────────────────────────────────────────────────
function ProjectFormModal({ project, onClose, onSaved }) {
  const isEdit = !!project;
  const [form, setForm] = useState({
    name: project?.name || '',
    type: project?.type || '',
    location: project?.location || '',
    description: project?.description || '',
    year: project?.year || new Date().getFullYear(),
    isVisible: project?.isVisible ?? true,
    order: project?.order ?? 0,
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        year: parseInt(form.year, 10),
        order: parseInt(form.order, 10),
      };
      let saved;
      if (isEdit) {
        const res = await projectsApi.update(project.id, payload);
        saved = res.data;
      } else {
        const res = await projectsApi.create(payload);
        saved = res.data;
      }
      // Upload selected images (single or multi)
      if (imageFiles.length === 1) {
        const imgRes = await projectsApi.uploadImage(saved.id, imageFiles[0]);
        saved = imgRes.data;
      } else if (imageFiles.length > 1) {
        const imgRes = await projectsApi.uploadImages(saved.id, imageFiles);
        saved = imgRes.data;
      }
      onSaved(saved, isEdit);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="font-heading text-xl font-bold text-foreground">
              {isEdit ? 'Edit Project' : 'New Project'}
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
            )}

            {[
              { label: 'Project Name', key: 'name', required: true },
              { label: 'Type', key: 'type', placeholder: 'e.g. Infrastructure, Excavation', required: true },
              { label: 'Location', key: 'location', required: true },
            ].map(({ label, key, placeholder, required }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
                  <input
                      type="text"
                      value={form[key]}
                      onChange={set(key)}
                      placeholder={placeholder}
                      required={required}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                  />
                </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <textarea
                  rows={3}
                  value={form.description}
                  onChange={set('description')}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Year</label>
                <input
                    type="number"
                    value={form.year}
                    onChange={set('year')}
                    min="2000" max="2099"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Order</label>
                <input
                    type="number"
                    value={form.order}
                    onChange={set('order')}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                  type="checkbox"
                  checked={form.isVisible}
                  onChange={set('isVisible')}
                  className="w-4 h-4 accent-gold"
              />
              <span className="text-sm font-medium text-foreground">Visible on public site</span>
            </label>

            {/* Image upload (optional) — supports multiple */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                {isEdit ? 'Add Images (optional)' : 'Images (optional)'}
              </label>
              <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border border-dashed border-border hover:border-gold/50 bg-background text-sm text-muted-foreground transition-colors">
                <ImagePlus className="w-4 h-4" />
                <span className="truncate flex-1">
                  {imageFiles.length === 0 ? 'Choose images…' :
                      imageFiles.length === 1 ? imageFiles[0].name :
                          `${imageFiles.length} images selected`}
                </span>
                {imageFiles.length > 0 && (
                    <button
                        type="button"
                        onClick={(e) => { e.preventDefault(); setImageFiles([]); }}
                        className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                )}
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => setImageFiles(Array.from(e.target.files))}
                />
              </label>
              {imageFiles.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {imageFiles.length} file{imageFiles.length !== 1 ? 's' : ''} selected
                  </p>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2 rounded-lg bg-gradient-gold text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving && <Spinner />}
                {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}

// ─── Image Manager ────────────────────────────────────────────────────────────
function ImageManager({ project, onUpdated }) {
  const [queue, setQueue]           = useState([]);
  const [dragOver, setDragOver]     = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [globalError, setGlobalError] = useState('');
  const inputRef = useRef(null);

  const addFiles = (rawFiles) => {
    const allowed = Array.from(rawFiles).filter((f) => f.type.startsWith('image/')).slice(0, 10);
    if (!allowed.length) return;
    const entries = allowed.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending',
      error: '',
    }));
    setQueue((q) => [...q, ...entries]);
  };

  const uploadAll = async () => {
    const pending = queue.filter((q) => q.status === 'pending');
    if (!pending.length) return;
    setGlobalError('');
    setQueue((q) =>
        q.map((item) => pending.some((p) => p.id === item.id) ? { ...item, status: 'uploading' } : item)
    );
    const tryUploadOne = async (item) => {
      try {
        const res = await projectsApi.uploadImage(project.id, item.file);
        onUpdated(res.data);
        setQueue((q) => q.map((i) => i.id === item.id ? { ...i, status: 'done' } : i));
      } catch (e) {
        setQueue((q) => q.map((i) => i.id === item.id ? { ...i, status: 'error', error: e.message || 'Failed' } : i));
      }
    };
    if (pending.length === 1) {
      await tryUploadOne(pending[0]);
    } else {
      try {
        const res = await projectsApi.uploadImages(project.id, pending.map((p) => p.file));
        onUpdated(res.data);
        setQueue((q) =>
            q.map((item) => pending.some((p) => p.id === item.id) ? { ...item, status: 'done' } : item)
        );
      } catch {
        // Batch failed — fall back to individual uploads
        for (const item of pending) {
          await tryUploadOne(item);
        }
      }
    }
    setTimeout(() => setQueue((q) => q.filter((i) => i.status !== 'done')), 1200);
  };

  const removeFromQueue = (id) => {
    setQueue((q) => {
      const item = q.find((i) => i.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return q.filter((i) => i.id !== id);
    });
  };

  const handleDelete = async (publicId) => {
    setGlobalError('');
    setDeletingId(publicId);
    try {
      const res = await projectsApi.deleteImage(project.id, publicId);
      onUpdated(res.data);
    } catch (err) {
      setGlobalError(err.message || 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  const hasPending  = queue.some((i) => i.status === 'pending');
  const isUploading = queue.some((i) => i.status === 'uploading');
  const pendingCount = queue.filter((i) => i.status === 'pending').length;

  return (
      <div className="mt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        {globalError && (
            <p className="text-destructive text-xs flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {globalError}
            </p>
        )}

        {/* Existing saved images */}
        {project.images?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.images.map((img) => (
                  <div key={img.publicId} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    <button
                        onClick={() => handleDelete(img.publicId)}
                        disabled={!!deletingId}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                    >
                      {deletingId === img.publicId ? <Spinner /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
              ))}
            </div>
        )}

        {/* Drop zone */}
        <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
            onClick={() => inputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-1.5 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all text-sm select-none
          ${dragOver ? 'border-gold bg-gold/5 text-gold' : 'border-border hover:border-gold/50 text-muted-foreground hover:text-foreground'}`}
        >
          <ImagePlus className="w-6 h-6" />
          <span className="font-medium">Drop images here or <span className="text-gold underline">browse</span></span>
          <span className="text-xs opacity-60">Up to 10 images · JPG, PNG, WEBP</span>
          <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
          />
        </div>

        {/* Upload queue */}
        {queue.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                Queue ({queue.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {queue.map((item) => (
                    <div key={item.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border flex-shrink-0">
                      <img src={item.preview} alt="" className="w-full h-full object-cover" />
                      {item.status === 'uploading' && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          </div>
                      )}
                      {item.status === 'done' && (
                          <div className="absolute inset-0 bg-green-500/60 flex items-center justify-center">
                            <span className="text-white text-xl font-bold leading-none">✓</span>
                          </div>
                      )}
                      {item.status === 'error' && (
                          <div className="absolute inset-0 bg-destructive/70 flex flex-col items-center justify-center p-1">
                            <AlertCircle className="w-4 h-4 text-white" />
                            <span className="text-[9px] text-white text-center leading-tight mt-0.5 line-clamp-2">{item.error}</span>
                          </div>
                      )}
                      {(item.status === 'pending' || item.status === 'error') && (
                          <button
                              onClick={(e) => { e.stopPropagation(); removeFromQueue(item.id); }}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition-colors"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                      )}
                    </div>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                {hasPending && (
                    <button
                        onClick={uploadAll}
                        disabled={isUploading}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-gold text-white text-xs font-bold rounded-full disabled:opacity-60 transition-all hover:shadow-md"
                    >
                      {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      {isUploading ? 'Uploading…' : `Upload ${pendingCount} image${pendingCount !== 1 ? 's' : ''}`}
                    </button>
                )}
                {!isUploading && (
                    <button
                        onClick={() => setQueue([])}
                        className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground border border-border rounded-full transition-colors"
                    >
                      Clear all
                    </button>
                )}
              </div>
            </div>
        )}
      </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [activeTab, setActiveTab] = useState('projects'); // 'projects' or 'reviews'
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [expandedImages, setExpandedImages] = useState(null);

  const fetchReviews = useCallback(async () => {
    setLoadingReviews(true);
    try {
      const res = await reviewsApi.getAll();
      setReviews(res.data || res);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    setFetchError('');
    try {
      const res = await projectsApi.getAll();
      setProjects(res.data || []);
    } catch (err) {
      setFetchError(err.message || 'Failed to load projects.');
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
    fetchReviews();
  }, [fetchProjects, fetchReviews]);

  // Also poll every 30 s so external API actions (new reviews, image uploads) appear automatically
  const { refresh: refreshProjects } = useAutoRefresh(fetchProjects, 30_000);
  const { refresh: refreshReviews }  = useAutoRefresh(fetchReviews,  30_000);

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this review? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await reviewsApi.delete(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
      refreshReviews();
    } catch (err) {
      alert(err.message || 'Delete review failed.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!isAuthenticated) return <Navigate to="/" replace />;

  const handleSaved = (saved, isEdit) => {
    setProjects((prev) =>
        isEdit ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev]
    );
    // Re-fetch to ensure images and all fields are up to date
    refreshProjects();
  };

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      const res = await projectsApi.toggleVisibility(id);
      setProjects((prev) => prev.map((p) => (p.id === id ? res.data : p)));
      refreshProjects();
    } catch (err) {
      alert(err.message || 'Toggle failed.');
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await projectsApi.delete(id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
      refreshProjects();
    } catch (err) {
      alert(err.message || 'Delete failed.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
      <div data-testid="admin-dashboard" className="min-h-screen bg-background pt-24 pb-12">
        {(showForm || editProject) && (
            <ProjectFormModal
                project={editProject}
                onClose={() => { setShowForm(false); setEditProject(null); }}
                onSaved={handleSaved}
            />
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <button
              data-testid="back-to-home"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-foreground">
                Admin Dashboard
              </h1>
              <p className="mt-2 text-muted-foreground">
                Welcome back, {user?.name || 'Admin'}. Manage your projects below.
              </p>
            </div>
            <button
                onClick={() => { setEditProject(null); setShowForm(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-gold text-white font-semibold rounded-full gold-glow text-sm transition-all hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              New Project
            </button>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Total Projects', value: projects.length },
              { label: 'Visible', value: projects.filter((p) => p.isVisible).length },
              { label: 'Reviews', value: reviews.length },
              { label: 'Avg Rating', value: reviews.length ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1) : 'N/A' },
              { label: 'Total Images', value: projects.reduce((a, p) => a + (p.images?.length || 0), 0) },
            ].map(({ label, value }) => (
                <div key={label} className="bg-card rounded-xl border border-border p-5">
                  <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{label}</p>
                </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6">
            <button
                onClick={() => setActiveTab('projects')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeTab === 'projects' ? 'bg-gold text-white' : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
            >
              Projects
            </button>
            <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                    activeTab === 'reviews' ? 'bg-gold text-white' : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          {/* List area */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {activeTab === 'projects' ? (
                <>
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-heading text-lg font-bold text-foreground">Projects</h2>
                  </div>

                  {fetchError && (
                      <div className="flex items-center gap-2 m-6 p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {fetchError}
                        <button onClick={fetchProjects} className="ml-auto underline text-xs">Retry</button>
                      </div>
                  )}

                  {loadingProjects ? (
                      <div className="flex items-center justify-center py-16 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading projects…
                      </div>
                  ) : projects.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <p className="mb-3">No projects yet.</p>
                        <button
                            onClick={() => setShowForm(true)}
                            className="text-gold text-sm font-medium hover:underline"
                        >
                          Create your first project →
                        </button>
                      </div>
                  ) : (
                      <div className="divide-y divide-border">
                        {projects.map((project) => (
                            <div key={project.id} className="p-5 sm:p-6 hover:bg-accent/30 transition-colors">
                              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-heading font-semibold text-foreground truncate">{project.name}</h3>
                                    <Badge visible={project.isVisible} />
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-0.5">
                                    {project.type} · {project.location} · {project.year}
                                  </p>
                                  {project.description && (
                                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                                  )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                  <button
                                      onClick={() => setExpandedImages(expandedImages === project.id ? null : project.id)}
                                      title="Manage images"
                                      className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors text-xs flex items-center gap-1"
                                  >
                                    <ImagePlus className="w-4 h-4" />
                                    <span className="hidden sm:inline">{project.images?.length || 0}</span>
                                  </button>
                                  <button
                                      onClick={() => handleToggle(project.id)}
                                      disabled={togglingId === project.id}
                                      title={project.isVisible ? 'Hide project' : 'Show project'}
                                      className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                                  >
                                    {togglingId === project.id ? <Spinner /> : project.isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                  </button>
                                  <button
                                      onClick={() => { setEditProject(project); setShowForm(false); }}
                                      title="Edit project"
                                      className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                      onClick={() => handleDelete(project.id)}
                                      disabled={deletingId === project.id}
                                      title="Delete project"
                                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                  >
                                    {deletingId === project.id ? <Spinner /> : <Trash2 className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>

                              {/* Inline image manager */}
                              {expandedImages === project.id && (
                                  <ImageManager
                                      project={project}
                                      onUpdated={(updated) => {
                                        setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                                        // Re-fetch all projects so public site also sees the change
                                        refreshProjects();
                                      }}
                                  />
                              )}
                            </div>
                        ))}
                      </div>
                  )}
                </>
            ) : (
                <>
                  <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                    <h2 className="font-heading text-lg font-bold text-foreground">Reviews</h2>
                  </div>

                  {loadingReviews ? (
                      <div className="flex items-center justify-center py-16 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading reviews…
                      </div>
                  ) : reviews.length === 0 ? (
                      <div className="text-center py-16 text-muted-foreground">
                        <p>No reviews yet.</p>
                      </div>
                  ) : (
                      <div className="divide-y divide-border">
                        {reviews.map((review) => (
                            <div key={review.id} className="p-5 sm:p-6 hover:bg-accent/30 transition-colors">
                              <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-heading font-semibold text-foreground">{review.user_name}</h3>
                                    <div className="flex text-gold">
                                      {[...Array(5)].map((_, i) => (
                                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-gold' : 'text-muted'}`} />
                                      ))}
                                    </div>
                                  </div>
                                  <p className="text-xs text-muted-foreground uppercase tracking-widest">
                                    {new Date(review.timestamp).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm text-foreground mt-2 italic">"{review.comment}"</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteReview(review.id)}
                                    disabled={deletingId === review.id}
                                    title="Delete review"
                                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                                >
                                  {deletingId === review.id ? <Spinner /> : <Trash className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                        ))}
                      </div>
                  )}
                </>
            )}
          </div>
        </div>
      </div>
  );
}