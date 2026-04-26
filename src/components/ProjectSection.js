import { useState, useEffect, useCallback } from 'react';
import { projectsApi } from '@/services/api';
import { MapPin, Calendar, ImageOff, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ProjectReviewsModal } from '@/components/ProjectReviews';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';

// ─── Image Lightbox ───────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
    const [idx, setIdx] = useState(startIndex);
    const prev = () => setIdx((i) => (i - 1 + images.length) % images.length);
    const next = () => setIdx((i) => (i + 1) % images.length);

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    });

    return (
        <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            {images.length > 1 && (
                <>
                    <button
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-full bg-white/10 transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 rounded-full bg-white/10 transition-colors"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            <img
                src={images[idx].url}
                alt=""
                className="max-h-[85vh] max-w-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
            />
            {images.length > 1 && (
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
                    {idx + 1} / {images.length}
                </p>
            )}
        </div>
    );
}

// ─── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project }) {
    const [lightbox, setLightbox] = useState(null); // index or null
    const hasImages = project.images?.length > 0;
    const cover = hasImages ? project.images[0].url : null;

    return (
        <>
            {lightbox !== null && (
                <Lightbox
                    images={project.images}
                    startIndex={lightbox}
                    onClose={() => setLightbox(null)}
                />
            )}

            <div
                data-testid={`project-card-${project.id}`}
                className="group bg-card rounded-xl overflow-hidden border border-border hover:-translate-y-2 transition-all duration-300 hover:shadow-xl flex flex-col"
            >
                {/* Cover image */}
                <div
                    className="h-52 bg-muted relative overflow-hidden cursor-pointer"
                    onClick={() => hasImages && setLightbox(0)}
                >
                    {cover ? (
                        <img
                            src={cover}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageOff className="w-8 h-8 opacity-40" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                    {/* Image count badge */}
                    {project.images?.length > 1 && (
                        <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
              +{project.images.length - 1} more
            </span>
                    )}

                    {/* Type badge */}
                    <span className="absolute top-3 left-3 bg-gold/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {project.type}
          </span>
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col flex-1 border-l-4 border-gold">
                    <h3 className="font-heading text-lg font-bold text-card-foreground leading-tight">
                        {project.name}
                    </h3>

                    <div className="flex items-center gap-3 mt-2 text-muted-foreground text-xs">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
                {project.location}
            </span>
                        <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
                            {project.year}
            </span>
                    </div>

                    {project.description && (
                        <p className="mt-3 text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-1">
                            {project.description}
                        </p>
                    )}

                    {/* Thumbnail strip */}
                    {project.images?.length > 1 && (
                        <div className="mt-4 flex gap-2">
                            {project.images.slice(0, 4).map((img, i) => (
                                <button
                                    key={img.publicId}
                                    onClick={() => setLightbox(i)}
                                    className="w-12 h-12 rounded-md overflow-hidden border border-border hover:border-gold/50 transition-colors flex-shrink-0"
                                >
                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                            {project.images.length > 4 && (
                                <button
                                    onClick={() => setLightbox(4)}
                                    className="w-12 h-12 rounded-md border border-border bg-muted text-muted-foreground text-xs flex items-center justify-center hover:border-gold/50 transition-colors flex-shrink-0"
                                >
                                    +{project.images.length - 4}
                                </button>
                            )}
                        </div>
                    )}

                    {/* ⭐ Project Reviews Button */}
                    <div className="mt-4 pt-4 border-t border-border flex justify-end">
                        <ProjectReviewsModal
                            projectId={project.id}
                            projectName={project.name}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

// ─── Projects Section ─────────────────────────────────────────────────────────
export default function ProjectsSection() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All');

    const load = useCallback(async () => {
        try {
            const res = await projectsApi.getPublic();
            setProjects(res.data || []);
        } catch (err) {
            setError('Could not load projects. Please try again later.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Auto-refresh every 30 s — picks up images added/deleted via admin panel
    useAutoRefresh(load, 30_000);

    // Derive unique types for filter tabs
    const types = ['All', ...Array.from(new Set(projects.map((p) => p.type).filter(Boolean)))];
    const filtered = filter === 'All' ? projects : projects.filter((p) => p.type === filter);

    return (
        <section id="works" data-testid="projects-section" className="py-24 sm:py-32 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section header */}
                <div className="text-center mb-12">
                    <span className="text-gold text-sm font-semibold tracking-[0.2em] uppercase">Our Work</span>
                    <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground">
                        Featured Projects
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base">
                        A showcase of our work across infrastructure, excavation, structural builds,
                        and complete development projects.
                    </p>
                </div>

                {/* Filter tabs — only show when there are multiple types */}
                {types.length > 2 && !loading && !error && (
                    <div className="flex flex-wrap gap-2 justify-center mb-10">
                        {types.map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                                    filter === type
                                        ? 'bg-gold text-white border-gold'
                                        : 'bg-transparent text-muted-foreground border-border hover:border-gold/50 hover:text-foreground'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        Loading projects…
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center py-20 text-muted-foreground">
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        <p className="text-sm">No projects to display yet.</p>
                    </div>
                )}

                {/* Grid */}
                {!loading && !error && filtered.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}