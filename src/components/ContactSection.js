import { Mail, Phone, MessageCircle, Smartphone, ArrowUpRight } from 'lucide-react';

const PHONE = '+91 9876543210';
const WHATSAPP = '919876543210';

const contactCards = [
  {
    icon: Mail,
    title: 'Email Us',
    value: 'contact@nkpconstruction.com',
    href: 'mailto:contact@nkpconstruction.com',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: PHONE,
    href: `https://wa.me/${WHATSAPP}`,
    color: 'bg-green-500/10 text-green-500',
  },
  {
    icon: Phone,
    title: 'Call Us',
    value: PHONE,
    href: `tel:${PHONE.replace(/\s/g, '')}`,
    color: 'bg-gold/10 text-gold',
  },
  {
    icon: Smartphone,
    title: 'SMS',
    value: PHONE,
    href: `sms:${PHONE.replace(/\s/g, '')}`,
    color: 'bg-purple-500/10 text-purple-500',
  },
];

export default function ContactSection() {
  return (
    <section id="contact" data-testid="contact-section" className="py-24 sm:py-32 bg-secondary/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <span className="text-gold text-sm font-semibold tracking-[0.2em] uppercase">Contact</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-heading font-bold text-foreground">
              Let's Build Together
            </h2>
            <p className="mt-5 text-muted-foreground leading-relaxed max-w-md">
              Ready to start your next construction project? Reach out to us and
              let's turn your vision into reality.
            </p>

            <div className="mt-8 space-y-6">
              <div>
                <h4 className="font-heading text-lg font-semibold text-foreground">NKP Construction</h4>
                <p className="text-muted-foreground text-sm mt-1">Projects. Infrastructure. Development.</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Founded by</p>
                <p className="font-semibold text-foreground">NKP Group</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-semibold text-foreground">India</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactCards.map(({ icon: Icon, title, value, href, color }) => (
              <a
                key={title}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                data-testid={`contact-card-${title.toLowerCase().replace(/\s/g, '-')}`}
                className="group flex flex-col p-6 bg-card rounded-xl border border-border hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-gold group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h4 className="font-semibold text-card-foreground">{title}</h4>
                <p className="text-muted-foreground text-sm mt-1 truncate">{value}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
