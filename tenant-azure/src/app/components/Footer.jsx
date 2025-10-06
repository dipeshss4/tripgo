"use client";

import Link from "next/link";
import { Building2, Phone, Mail, MapPin, Clock, Shield, Award, Users, Star, Sparkles, Globe, Zap, ArrowRight, Instagram, Twitter, Linkedin, Facebook, Heart } from "lucide-react";
import { useState } from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hoveredSocial, setHoveredSocial] = useState(null);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setTimeout(() => {
        setIsSubscribed(false);
        setEmail('');
      }, 3000);
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes float-footer {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(2deg); }
        }
        @keyframes pulse-glow-footer {
          0%, 100% {
            box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 25px rgba(59, 130, 246, 0.6);
            transform: scale(1.05);
          }
        }
        @keyframes shimmer-footer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float-footer {
          animation: float-footer 4s ease-in-out infinite;
        }
        .animate-pulse-glow-footer {
          animation: pulse-glow-footer 3s ease-in-out infinite;
        }
        .shimmer-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          animation: shimmer-footer 3s infinite;
        }
      `}</style>

      <footer className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-slate-300 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-indigo-500/5 to-blue-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* Enhanced Top Section */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-4">
            {/* Enhanced Company Info */}
            <div className="lg:col-span-1">
              <div className="group flex items-center gap-6 mb-8">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white shadow-2xl animate-pulse-glow-footer hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-8 w-8" />
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                </div>
                <div>
                  <span className="text-3xl font-black tracking-tight text-white">
                    AZURE
                  </span>
                  <div className="text-sm font-bold text-blue-400 tracking-widest uppercase">
                    ⚡ TRAVEL SOLUTIONS
                  </div>
                  <div className="flex mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-lg leading-relaxed text-blue-100 mb-8">
                Professional travel management for corporate clients, luxury leisure travelers,
                and group coordinators. Licensed, insured, and trusted by 500+ companies worldwide.
                <span className="block mt-3 text-white font-bold">
                  🌟 Your journey to extraordinary begins here.
                </span>
              </p>

              {/* Enhanced Credentials */}
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm px-6 py-4 border border-white/20 hover:scale-105 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black text-white">IATA Certified</span>
                </div>
                <div className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm px-6 py-4 border border-white/20 hover:scale-105 transition-transform duration-300">
                  <Award className="h-6 w-6 text-yellow-400 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black text-white">Licensed Agency</span>
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-4">
                <h5 className="text-white font-black text-lg">🚀 Connect With Us</h5>
                <div className="flex space-x-4">
                  {[
                    { icon: Instagram, color: 'from-pink-500 to-purple-500', name: 'Instagram' },
                    { icon: Twitter, color: 'from-blue-400 to-blue-600', name: 'Twitter' },
                    { icon: Linkedin, color: 'from-blue-600 to-blue-800', name: 'LinkedIn' },
                    { icon: Facebook, color: 'from-blue-500 to-blue-700', name: 'Facebook' }
                  ].map((social, idx) => (
                    <button
                      key={social.name}
                      onMouseEnter={() => setHoveredSocial(social.name)}
                      onMouseLeave={() => setHoveredSocial(null)}
                      className={`group relative w-14 h-14 rounded-2xl bg-gradient-to-r ${social.color} flex items-center justify-center transition-all duration-300 hover:scale-125 hover:rotate-12 shadow-lg hover:shadow-xl animate-float-footer`}
                      style={{animationDelay: `${idx * 0.2}s`}}
                    >
                      <social.icon className="w-6 h-6 text-white" />
                      {hoveredSocial === social.name && (
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-white text-black px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap">
                          {social.name}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Enhanced Services */}
            <div>
              <h4 className="text-white font-black text-xl uppercase tracking-wide mb-8 flex items-center gap-3">
                <Zap className="w-6 h-6 text-blue-400" />
                Corporate Services
              </h4>
              <ul className="space-y-5">
                {[
                  { name: 'Travel Management', icon: '✈️', desc: 'End-to-end solutions' },
                  { name: 'Expense Tracking', icon: '📊', desc: 'Real-time monitoring' },
                  { name: 'Group Bookings', icon: '👥', desc: 'Volume discounts' },
                  { name: 'Corporate Events', icon: '🎯', desc: 'Professional planning' },
                  { name: 'Incentive Travel', icon: '🏆', desc: 'Reward programs' }
                ].map((service, idx) => (
                  <li key={service.name} className="group">
                    <Link
                      href={`/corporate/${service.name.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center gap-4 bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-blue-400/30"
                    >
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <div className="text-white font-bold group-hover:text-blue-300 transition-colors">
                          {service.name}
                        </div>
                        <div className="text-xs text-blue-200">{service.desc}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-400 ml-auto group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enhanced Luxury Travel */}
            <div>
              <h4 className="text-white font-black text-xl uppercase tracking-wide mb-8 flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
                Luxury Travel
              </h4>
              <ul className="space-y-5">
                {[
                  { name: 'Premium Cruises', icon: '🚢', desc: 'Ocean palaces await' },
                  { name: '5-Star Hotels', icon: '🏨', desc: 'Luxury redefined' },
                  { name: 'Curated Packages', icon: '💎', desc: 'Bespoke experiences' },
                  { name: 'Concierge Services', icon: '🛎️', desc: '24/7 personal service' },
                  { name: 'Private Aviation', icon: '🛩️', desc: 'Sky-high luxury' }
                ].map((service, idx) => (
                  <li key={service.name} className="group">
                    <Link
                      href={`/luxury/${service.name.toLowerCase().replace(/\s+/g, '-').replace('5-star-', '')}`}
                      className="flex items-center gap-4 bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-105 border border-white/10 hover:border-purple-400/30"
                    >
                      <span className="text-2xl">{service.icon}</span>
                      <div>
                        <div className="text-white font-bold group-hover:text-purple-300 transition-colors">
                          {service.name}
                        </div>
                        <div className="text-xs text-purple-200">{service.desc}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-400 ml-auto group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enhanced Contact & Newsletter */}
            <div>
              <h4 className="text-white font-black text-xl uppercase tracking-wide mb-8 flex items-center gap-3">
                <Globe className="w-6 h-6 text-cyan-400" />
                Get In Touch
              </h4>
              <div className="space-y-6 mb-8">
                {[
                  { icon: Phone, label: '24/7 Support', value: '+1 (555) 123-4567', color: 'text-green-400' },
                  { icon: Mail, label: 'Email', value: 'support@azuretravel.com', color: 'text-blue-400' },
                  { icon: MapPin, label: 'Headquarters', value: 'New York, NY', color: 'text-purple-400' },
                  { icon: Clock, label: 'Business Hours', value: 'Mon-Fri: 8AM-8PM EST', color: 'text-yellow-400' }
                ].map((contact, idx) => (
                  <div key={contact.label} className="group flex items-start gap-4 bg-white/5 hover:bg-white/10 rounded-xl p-4 transition-all duration-300 hover:scale-105 border border-white/10 animate-float-footer" style={{animationDelay: `${idx * 0.3}s`}}>
                    <contact.icon className={`h-6 w-6 ${contact.color} mt-1 group-hover:scale-110 transition-transform`} />
                    <div>
                      <p className="text-lg font-bold text-white">{contact.label}</p>
                      <p className="text-sm text-blue-200">{contact.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Enhanced Newsletter */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <h5 className="text-white font-black text-xl mb-4 flex items-center gap-3">
                  <Heart className="w-6 h-6 text-red-400" />
                  Stay Connected
                </h5>
                <p className="text-blue-100 mb-6">
                  Exclusive travel industry insights and corporate rates.
                  <span className="block mt-2 text-white font-bold">⚡ Join 10,000+ travel professionals</span>
                </p>
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your business email"
                      className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder:text-blue-200 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 transition-all font-medium"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubscribed}
                    className={`w-full py-4 rounded-xl font-black text-lg transition-all duration-300 shadow-xl ${
                      isSubscribed
                        ? 'bg-green-600 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white hover:scale-105'
                    }`}
                  >
                    {isSubscribed ? (
                      <span className="flex items-center justify-center gap-2">
                        <Star className="w-5 h-5" />
                        Subscribed! 🎉
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5" />
                        Subscribe Now
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Bar */}
        <div className="relative border-t border-white/20 bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-indigo-900/50 backdrop-blur-sm">
          <div className="absolute inset-0 shimmer-footer"></div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {[
                { value: '500+', label: 'Corporate Clients', icon: Users, color: 'from-blue-400 to-cyan-400' },
                { value: '25+', label: 'Years Experience', icon: Award, color: 'from-purple-400 to-pink-400' },
                { value: '98%', label: 'Client Satisfaction', icon: Star, color: 'from-yellow-400 to-orange-400' },
                { value: '24/7', label: 'Support Available', icon: Clock, color: 'from-green-400 to-emerald-400' }
              ].map((stat, idx) => (
                <div key={stat.label} className="group text-center bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:scale-110 hover:rotate-2 transition-all duration-500 animate-pulse-glow-footer" style={{animationDelay: `${idx * 0.2}s`}}>
                  <div className="flex justify-center mb-4">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${stat.color} flex items-center justify-center group-hover:rotate-12 transition-transform duration-300`}>
                      <stat.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div className={`text-4xl font-black bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-blue-200 font-bold uppercase tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Legal */}
        <div className="relative border-t border-white/20 bg-gradient-to-r from-slate-900/80 via-blue-900/80 to-indigo-900/80 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col gap-6 items-center justify-between md:flex-row">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <p className="text-blue-100 font-bold flex items-center gap-2">
                  © {year} Azure Travel Solutions. All rights reserved.
                  <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                </p>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Users className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-bold text-white">Licensed Travel Agency</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span className="text-sm font-bold text-white">Secure & Insured</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                {[
                  { name: 'Privacy Policy', href: '/privacy-policy' },
                  { name: 'Terms & Conditions', href: '/terms-conditions' },
                  { name: 'Corporate Contact', href: '/corporate-contact' },
                  { name: 'Emergency Support', href: '/emergency-support' }
                ].map((link, idx) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="group text-blue-200 hover:text-white font-bold transition-all duration-300 hover:scale-110 flex items-center gap-2"
                  >
                    {link.name}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Made with love */}
            <div className="text-center mt-8 pt-6 border-t border-white/10">
              <p className="text-blue-200 font-bold flex items-center justify-center gap-2">
                Made with
                <Heart className="w-4 h-4 text-red-400 animate-pulse" />
                for extraordinary travelers
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}