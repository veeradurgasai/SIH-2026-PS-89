import React from "react";
import { Logo } from "./Logo";
import { ShieldCheck, Phone, Mail, MapPin, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer id="shramconnect-footer" className="bg-[#0F3B66] text-white pt-16 pb-12 border-t border-[#144473] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Motto Pill from ShramConnect Palette */}
        <div className="mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#144473]/70 border border-[#1E4E7A]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 font-sans">People Work Communities Grow Together</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-200">
            <span>Trusted Services</span>
            <span className="text-cyan-400 font-bold">•</span>
            <span>Stronger Communities</span>
            <span className="text-cyan-400 font-bold">•</span>
            <span>Brighter Futures</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#144473]">
          {/* Col 1: Brand & Identity */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" inverted={true} />
            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mt-3">
              A cooperative-owned digital workforce network connecting certified, skilled workers with households and institutions, while empowering cooperatives with predictive capacity management.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#06B6D4] pt-2 font-medium">
              <ShieldCheck className="w-4 h-4 text-[#06B6D4]" />
              <span>100% Cooperative Verified • Social Security Integrated</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-white uppercase mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li><a href="#services" className="hover:text-[#06B6D4] transition-colors">Plumbing Solutions</a></li>
              <li><a href="#services" className="hover:text-[#06B6D4] transition-colors">Electrical & Wiring</a></li>
              <li><a href="#services" className="hover:text-[#06B6D4] transition-colors">Carpentry & Modular</a></li>
              <li><a href="#services" className="hover:text-[#06B6D4] transition-colors">Deep Cleaning & Sanitization</a></li>
              <li><a href="#services" className="hover:text-[#06B6D4] transition-colors">Caregiving Support</a></li>
              <li><a href="#services" className="hover:text-[#06B6D4] transition-colors">Technician Appliance Care</a></li>
            </ul>
          </div>

          {/* Col 3: For Workers & Cooperatives */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-white uppercase mb-4">
              Network
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li><a href="#for-workers" className="hover:text-[#06B6D4] transition-colors">Join as a Worker</a></li>
              <li><a href="#for-workers" className="hover:text-[#06B6D4] transition-colors">Social Welfare & Insurance</a></li>
              <li><a href="#for-workers" className="hover:text-[#06B6D4] transition-colors">Skill Certifications</a></li>
              <li><a href="#for-cooperatives" className="hover:text-[#06B6D4] transition-colors">Cooperative Onboarding</a></li>
              <li><a href="#for-cooperatives" className="hover:text-[#06B6D4] transition-colors">Workforce Intelligence</a></li>
              <li><a href="#for-cooperatives" className="hover:text-[#06B6D4] transition-colors">Regional Capacity Planner</a></li>
            </ul>
          </div>

          {/* Col 4: Trust & Support */}
          <div>
            <h4 className="text-sm font-bold tracking-wider text-white uppercase mb-4">
              Contact & Trust
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#06B6D4] mt-0.5 shrink-0" />
                <span>Central Cooperative Federation, Bengaluru Urban, Karnataka</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#06B6D4] shrink-0" />
                <span>+91 80 2664 1900</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#06B6D4] shrink-0" />
                <span>support@shramconnect.coop</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} ShramConnect Cooperative Federation. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-cyan-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-cyan-300 cursor-pointer">Terms of Service</span>
            <span className="hover:text-cyan-300 cursor-pointer">Fair Wage Commitment</span>
            <span className="hover:text-cyan-300 cursor-pointer">Security Audits</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
