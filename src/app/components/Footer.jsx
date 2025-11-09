"use client";

import { useState, useEffect } from "react";
import { Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

export default function Footer() {
  const year = new Date().getFullYear();
  const [footerConfig, setFooterConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooterConfig();
  }, []);

  const fetchFooterConfig = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/footer`);
      const data = await response.json();

      if (data.success && data.data) {
        setFooterConfig(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch footer config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");

    // TODO: Wire this to your newsletter API
    alert(`Thanks! We'll send deals to: ${email}`);
    form.reset();
  };

  const renderSocialIcon = (platform) => {
    const iconProps = { size: 18 };

    switch(platform.toLowerCase()) {
      case 'facebook':
        return <Facebook {...iconProps} />;
      case 'twitter':
        return <Twitter {...iconProps} />;
      case 'instagram':
        return <Instagram {...iconProps} />;
      case 'linkedin':
        return <Linkedin {...iconProps} />;
      case 'youtube':
        return <Youtube {...iconProps} />;
      default:
        return null;
    }
  };

  // Default fallback footer
  if (loading || !footerConfig) {
    return (
      <footer className="bg-gray-950 text-gray-300">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12 py-12">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            {/* Brand */}
            <div>
              <div className="inline-flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-900">
                  <span className="font-black">T</span>
                </div>
                <span className="text-xl font-extrabold tracking-tight text-white">
                  TripGo
                </span>
              </div>
              <p className="mt-3 text-sm text-gray-400">
                Less planning, more memories. Curated cruises, hotels, and travel
                packages with flexible dates and transparent pricing.
              </p>
            </div>

            {/* Cruises */}
            <div>
              <h4 className="text-white font-semibold">Cruises</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="/cruises" className="hover:text-white">View All Cruises</a></li>
              </ul>
            </div>

            {/* Hotels */}
            <div>
              <h4 className="text-white font-semibold">Hotels</h4>
              <ul className="mt-3 space-y-2 text-sm">
                <li><a href="/hotels" className="hover:text-white">View All Hotels</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-white font-semibold">Stay in the loop</h4>
              <p className="mt-3 text-sm text-gray-400">
                Get fresh deals and new routes weekly. No spam.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-2 items-center justify-between text-xs text-gray-400 md:flex-row">
            <p>© {year} TripGo. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <a href="/privacy" className="hover:text-white">Privacy</a>
              <a href="/terms" className="hover:text-white">Terms</a>
              <a href="/contact" className="hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  const {
    companyName,
    companyTagline,
    description,
    logo,
    copyrightText,
    email,
    phone,
    address,
    facebook,
    twitter,
    instagram,
    linkedin,
    youtube,
    pinterest,
    showNewsletter,
    newsletterTitle,
    newsletterText,
    backgroundColor,
    textColor,
    accentColor,
    sections
  } = footerConfig;

  const socialLinks = [
    { platform: 'facebook', url: facebook },
    { platform: 'twitter', url: twitter },
    { platform: 'instagram', url: instagram },
    { platform: 'linkedin', url: linkedin },
    { platform: 'youtube', url: youtube }
  ].filter(social => social.url);

  return (
    <footer
      className="text-gray-300"
      style={{
        backgroundColor: backgroundColor || '#030712',
        color: textColor || '#d1d5db'
      }}
    >
      {/* Top */}
      <div className="mx-auto max-w-[1600px] px-6 sm:px-8 lg:px-12 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="inline-flex items-center gap-2">
              {logo ? (
                <img src={logo} alt={companyName} className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-900">
                  <span className="font-black">{companyName?.[0] || 'T'}</span>
                </div>
              )}
              <span className="text-xl font-extrabold tracking-tight text-white">
                {companyName || 'TripGo'}
              </span>
            </div>

            {companyTagline && (
              <p className="mt-2 text-sm font-medium" style={{ color: accentColor || '#3b82f6' }}>
                {companyTagline}
              </p>
            )}

            {description && (
              <p className="mt-3 text-sm text-gray-400">
                {description}
              </p>
            )}

            {/* Contact Info */}
            {(email || phone || address) && (
              <div className="mt-4 space-y-2 text-sm text-gray-400">
                {email && (
                  <div className="flex items-center gap-2">
                    <span>✉</span>
                    <a href={`mailto:${email}`} className="hover:text-white">{email}</a>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <span>📞</span>
                    <a href={`tel:${phone}`} className="hover:text-white">{phone}</a>
                  </div>
                )}
                {address && (
                  <div className="flex items-start gap-2">
                    <span>📍</span>
                    <span>{address}</span>
                  </div>
                )}
              </div>
            )}

            {/* Socials */}
            {socialLinks.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                {socialLinks.map(({ platform, url }) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={platform}
                    className="rounded-lg p-2 hover:bg-white/10 transition-colors"
                    style={{ color: textColor }}
                  >
                    {renderSocialIcon(platform)}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Dynamic Sections */}
          {sections && sections.length > 0 && sections.slice(0, showNewsletter ? 2 : 3).map((section) => (
            <div key={section.id}>
              <h4 className="text-white font-semibold">{section.title}</h4>
              <ul className="mt-3 space-y-2 text-sm">
                {section.links && section.links.map((link) => (
                  <li key={link.id}>
                    <a
                      href={link.url}
                      className="hover:text-white transition-colors"
                      target={link.openInNewTab ? "_blank" : undefined}
                      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          {showNewsletter && (
            <div>
              <h4 className="text-white font-semibold">
                {newsletterTitle || 'Stay in the loop'}
              </h4>
              <p className="mt-3 text-sm text-gray-400">
                {newsletterText || 'Get fresh deals and new routes weekly. No spam.'}
              </p>
              <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 outline-none focus:ring-2"
                  style={{
                    '--tw-ring-color': accentColor || '#3b82f6'
                  }}
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-xl px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: accentColor || '#3b82f6' }}
                >
                  Join
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-2 items-center justify-between text-xs text-gray-400 md:flex-row">
          <p>{copyrightText || `© ${year} ${companyName || 'TripGo'}. All rights reserved.`}</p>

          {/* Additional Links from Last Section */}
          {sections && sections.length > 0 && sections[sections.length - 1] && (
            <div className="flex items-center gap-4">
              {sections[sections.length - 1].links && sections[sections.length - 1].links.slice(0, 4).map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  className="hover:text-white transition-colors"
                  target={link.openInNewTab ? "_blank" : undefined}
                  rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
