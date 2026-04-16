import { Building2, Mountain, Hammer, Layers } from 'lucide-react';

const services = [
  {
    icon: Building2,
    title: 'Infrastructure',
    description: 'Roads, bridges, and large-scale infrastructure projects built to last with precision engineering.',
    image: 'https://images.unsplash.com/photo-1649736661701-c9c8d0947cd3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzF8MHwxfHNlYXJjaHwyfHxpbmZyYXN0cnVjdHVyZSUyMGJyaWRnZSUyMGNvbnN0cnVjdGlvbnxlbnwwfHx8fDE3NzU4MDcxMDJ8MA&ixlib=rb-4.1.0&q=85',
  },
  {
    icon: Mountain,
    title: 'Excavation',
    description: 'Expert land clearing, grading, and excavation services for residential and commercial projects.',
    image: 'https://images.unsplash.com/photo-1762438441913-cd4ec8da39d8?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHxleGNhdmF0b3IlMjBjb25zdHJ1Y3Rpb258ZW58MHx8fHwxNzc1ODA3MDk4fDA&ixlib=rb-4.1.0&q=85',
  },
  {
    icon: Hammer,
    title: 'Structural Work',
    description: 'Reinforced concrete structures, steel frameworks, and load-bearing solutions for any scale.',
    image: 'https://images.unsplash.com/photo-1707583085127-5841dced44b1?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHw0fHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwYXJjaGl0ZWN0dXJlJTIwYnVpbGRpbmd8ZW58MHx8fHwxNzc1ODA3MDc1fDA&ixlib=rb-4.1.0&q=85',
  },
  {
    icon: Layers,
    title: 'Development',
    description: 'End-to-end project development from planning and design to construction and handover.',
    image: 'https://images.unsplash.com/photo-1770823556202-2eba715a415b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Njd8MHwxfHNlYXJjaHwxfHxjb25zdHJ1Y3Rpb24lMjBzaXRlJTIwYXJjaGl0ZWN0dXJlJTIwYnVpbGRpbmd8ZW58MHx8fHwxNzc1ODA3MDc1fDA&ixlib=rb-4.1.0&q=85',
  },
];

export default function ServicesSection() {
  return (
      <section data-testid="services-section" className="py-24 sm:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-gold text-sm font-semibold tracking-[0.2em] uppercase">What We Do</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground">
              Our Expertise
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-base">
              With over 14 years of experience, we deliver comprehensive construction solutions that stand the test of time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map(({ icon: Icon, title, description, image }) => (
                <div
                    key={title}
                    data-testid={`service-card-${title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="group bg-card rounded-xl overflow-hidden border border-border hover:-translate-y-2 transition-all duration-300 hover:shadow-xl"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  </div>
                  <div className="p-6 border-l-4 border-gold">
                    <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-gold" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-card-foreground mb-2">{title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </section>
  );
}