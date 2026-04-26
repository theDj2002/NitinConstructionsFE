import { CheckCircle } from 'lucide-react';

// const ABOUT_IMAGE = 'https://customer-assets.emergentagent.com/job_nkp-construction/artifacts/yv1w73t4_Poster-1.png';
import ABOUT_IMAGE from "./assets/NKP-Poster.png"
const highlights = [
  'Quality materials and workmanship guaranteed',
  'On-time project delivery with transparent process',
  'Experienced team of engineers and skilled workers',
  'Complete end-to-end project management',
];

const tags = ['Infrastructure', 'Excavation', 'Structural', 'Development', 'Consulting'];

export default function AboutSection() {
  return (
    <section id="about" data-testid="about-section" className="py-24 sm:py-32 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={ABOUT_IMAGE}
                alt="NKP Construction founder at work site"
                className="w-full h-auto object-cover"
                data-testid="about-image"
              />
            </div>
            <div
              data-testid="about-est-card"
              className="absolute -bottom-6 -right-4 sm:bottom-6 sm:right-6 bg-gold text-white px-6 py-4 rounded-xl shadow-lg"
            >
              <p className="text-sm font-medium opacity-80">Established</p>
              <p className="text-3xl font-heading font-bold">2019</p>
            </div>
          </div>

          <div>
            <span className="text-gold text-sm font-semibold tracking-[0.2em] uppercase">About Us</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold text-foreground">
              Crafting Excellence in Every Structure
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              NKP Construction has been a trusted name in the construction industry since 2019.
              We specialize in infrastructure, excavation, structural work, and complete project
              development, delivering quality results that exceed expectations.
            </p>

            <div className="mt-8 space-y-4">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <span className="text-foreground text-sm">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  data-testid={`about-tag-${tag.toLowerCase()}`}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
