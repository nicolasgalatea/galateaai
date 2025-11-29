import { Card, CardContent } from '@/components/ui/card';
import { Users } from 'lucide-react';
import ceoAvatar from '@/assets/ceo-avatar.jpg';
import ctoAvatar from '@/assets/cto-avatar.png';
import cmoAvatar from '@/assets/cmo-avatar.png';

export function FoundingTeam() {
  return (
    <section className="mb-20" id="founding-team">
      <div className="text-center mb-12 scroll-reveal">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Users className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold">Founding Team</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Nicolás - CEO */}
        <Card className="hover-lift scroll-reveal">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <img 
                src={ceoAvatar} 
                alt="Nicolás - CEO" 
                className="w-32 h-32 rounded-xl object-cover object-top shadow-lg flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Nicolás Pérez Rivera</h3>
                <p className="text-primary font-semibold mb-4">CEO & Co-Founder</p>
                <p className="text-muted-foreground mb-4">
                  Bilingual executive specialized in international relations, global commerce, and B2B business development, with over 7 years of experience in sales, commercial development, and data analysis, and 5 years of experience in HealthTech and artificial intelligence applied to healthcare.
                </p>
              </div>
            </div>
            <ul className="space-y-2 mt-4">
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <span>•</span>
                <span><strong>HealthTech Experience:</strong> Led AI integration projects with pharmaceutical companies and hospitals, managing multidisciplinary teams.</span>
              </li>
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <span>•</span>
                <span><strong>Results:</strong> Driven 15-20% annual revenue growth through identification of untapped opportunities.</span>
              </li>
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <span>•</span>
                <span><strong>Vision:</strong> As CEO of Galatea AI, leads the mission to democratize access to AI in healthcare worldwide.</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Carlos - CMO */}
        <Card className="hover-lift scroll-reveal" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <img 
                src={cmoAvatar} 
                alt="Carlos - CMO" 
                className="w-32 h-32 rounded-xl object-cover shadow-lg flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Carlos José Pérez Rivera, M.D., M.Sc.</h3>
                <p className="text-primary font-semibold mb-4">Co-Founder & Chief Medical Officer</p>
                <p className="text-muted-foreground mb-4">
                  General surgeon, clinical researcher, and university professor with solid academic and international background.
                </p>
              </div>
            </div>
            <ul className="space-y-2 mt-4">
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <span>•</span>
                <span><strong>Medical Training:</strong> Specialist in General Surgery (Universidad El Bosque), Master in Clinical Epidemiology (Universidad de los Andes).</span>
              </li>
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <span>•</span>
                <span><strong>Research:</strong> Author/co-author of over 40 scientific publications. Awards include Paul Dudley White International Scholar Award (AHA 2024).</span>
              </li>
              <li className="text-sm text-muted-foreground flex items-start gap-2">
                <span>•</span>
                <span><strong>Role:</strong> Guarantees the scientific and medical validity of AI solutions, ensuring clinical relevance and academic rigor.</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* CTO */}
      <Card className="hover-lift scroll-reveal" style={{ animationDelay: '0.2s' }}>
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <img 
              src={ctoAvatar} 
              alt="CTO" 
              className="w-32 h-32 rounded-xl object-cover object-top shadow-lg flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Uriel Rodríguez Castro</h3>
              <p className="text-primary font-semibold mb-4">CTO & Co-Founder</p>
              <p className="text-muted-foreground mb-3">
                Executive Leader in Enterprise Architecture & Digital Governance. 15+ years architecting mission-critical ecosystems for Fortune 500 corporations.
              </p>
              <ul className="space-y-2 mt-4">
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Global Operations:</strong> Formerly Head of Global Digital Engineering at Inchcape PLC, leading 300+ engineers across 60 countries.</span>
                </li>
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Strategic Trust:</strong> Proven track record as C-Level Advisor at NTT DATA and Digital Leader for Chedraui, driving multi-million dollar transformations.</span>
                </li>
                <li className="text-sm text-muted-foreground flex items-start gap-2">
                  <span>•</span>
                  <span><strong>Galatea Mission:</strong> Building our "Sovereign Infrastructure", ensuring banking-grade security, TOGAF/CGEIT compliance, and seamless integration for healthcare.</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
