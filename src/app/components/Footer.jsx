"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    // You can wire this to your API route later
    alert(`Thanks! We’ll send deals to: ${email}`);
    form.reset();
  };

  return (
    <footer className="bg-gray-950 text-gray-300">
      {/* Top */}
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

            {/* Socials */}
            <div className="mt-4 flex items-center gap-3">
              <a href="#" aria-label="Instagram" className="rounded-lg p-2 hover:bg-white/10">
                <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current">
                  <path d="M12 7a5 5 0 1 0 .001 10.001A5 5 0 0 0 12 7m0-5c2.7 0 3.042.01 4.115.059 1.07.049 1.798.218 2.44.465.66.253 1.217.593 1.77 1.146.553.553.893 1.11 1.146 1.77.247.642.416 1.37.465 2.44C22.99 9.958 23 10.3 23 13s-.01 3.042-.059 4.115c-.049 1.07-.218 1.798-.465 2.44a4.93 4.93 0 0 1-1.146 1.77 4.93 4.93 0 0 1-1.77 1.146c-.642.247-1.37.416-2.44.465C15.042 22.99 14.7 23 12 23s-3.042-.01-4.115-.059c-1.07-.049-1.798-.218-2.44-.465a4.93 4.93 0 0 1-1.77-1.146 4.93 4.93 0 0 1-1.146-1.77c-.247-.642-.416-1.37-.465-2.44C1.01 16.042 1 15.7 1 13s.01-3.042.059-4.115c.049-1.07.218-1.798.465-2.44.253-.66.593-1.217 1.146-1.77.553-.553 1.11-.893 1.77-1.146.642-.247 1.37-.416 2.44-.465C8.958 1.01 9.3 1 12 1zm0 2c-2.66 0-2.987.01-4.04.058-.975.045-1.504.208-1.856.345-.467.181-.8.397-1.15.747-.35.35-.566.683-.747 1.15-.137.352-.3.881-.345 1.856C3.81 8.013 3.8 8.34 3.8 11s.01 2.987.058 4.04c.045.975.208 1.504.345 1.856.181.467.397.8.747 1.15.35.35.683.566 1.15.747.352.137.881.3 1.856.345C9.013 19.19 9.34 19.2 12 19.2s2.987-.01 4.04-.058c.975-.045 1.504-.208 1.856-.345.467-.181.8-.397 1.15-.747.35-.35.566-.683.747-1.15.137-.352.3-.881.345-1.856.048-1.053.058-1.38.058-4.04s-.01-2.987-.058-4.04c-.045-.975-.208-1.504-.345-1.856a3.05 3.05 0 0 0-.747-1.15 3.05 3.05 0 0 0-1.15-.747c-.352-.137-.881-.3-1.856-.345C14.987 3.01 14.66 3 12 3zm0 3.6a5.4 5.4 0 1 1 0 10.8 5.4 5.4 0 0 1 0-10.8zm6.6-.9a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/>
                </svg>
              </a>
              <a href="#" aria-label="Twitter" className="rounded-lg p-2 hover:bg白/10">
                <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current">
                  <path d="M19.633 7.997c.013.176.013.352.013.53 0 5.384-4.098 11.593-11.593 11.593-2.302 0-4.444-.674-6.245-1.84.32.037.628.05.962.05a8.2 8.2 0 0 0 5.084-1.75 4.1 4.1 0 0 1-3.83-2.84c.249.037.498.062.76.062.36 0 .722-.05 1.06-.137a4.094 4.094 0 0 1-3.29-4.02v-.05c.548.3 1.184.486 1.86.511A4.09 4.09 0 0 1 2.8 6.64a11.62 11.62 0 0 0 8.428 4.276 4.614 4.614 0 0 1-.1-.94 4.09 4.09 0 0 1 7.078-2.8 8.05 8.05 0 0 0 2.594-.987 4.1 4.1 0 0 1-1.796 2.26A8.17 8.17 0 0 0 22 7.4a8.82 8.82 0 0 1-2.367 2.445z"/>
                </svg>
              </a>
              <a href="#" aria-label="YouTube" className="rounded-lg p-2 hover:bg-white/10">
                <svg width="18" height="18" viewBox="0 0 24 24" className="fill-current">
                  <path d="M23.5 7.2a4 4 0 0 0-2.8-2.8C18.9 4 12 4 12 4s-6.9 0-8.7.4A4 4 0 0 0 .5 7.2 41.8 41.8 0 0 0 0 12c0 1.6.2 3.2.5 4.8a4 4 0 0 0 2.8 2.8C5.1 20 12 20 12 20s6.9 0 8.7-.4a4 4 0 0 0 2.8-2.8c.3-1.6.5-3.2.5-4.8 0-1.6-.2-3.2-.5-4.8zM9.6 15.5v-7l6 3.5-6 3.5z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Cruises */}
          <div>
            <h4 className="text-white font-semibold">Cruises</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="/cruises/caribbean-cruise" className="hover:text-white">Caribbean Cruise</a></li>
              <li><a href="/cruises/mediterranean-cruise" className="hover:text-white">Mediterranean Cruise</a></li>
              <li><a href="/cruises/alaskan-cruise" className="hover:text-white">Alaskan Cruise</a></li>
              <li><a href="/cruises/tropical-cruise" className="hover:text-white">Tropical Cruise</a></li>
            </ul>
          </div>

          {/* Hotels & Resources */}
          <div>
            <h4 className="text-white font-semibold">Hotels & Resources</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li><a href="/hotels/luxury-beach-resort" className="hover:text-white">Luxury Beach Resort</a></li>
              <li><a href="/hotels/mountain-retreat" className="hover:text-white">Mountain Retreat</a></li>
              <li><a href="/hotels/budget-friendly-hotel" className="hover:text-white">Budget-Friendly Hotel</a></li>
              <li><a href="/blog" className="hover:text-white font-medium">Travel Blog</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold">Stay in the loop</h4>
            <p className="mt-3 text-sm text-gray-400">
              Get fresh deals and new routes weekly. No spam.
            </p>
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
              <input
                type="email"
                name="email"
                required
                placeholder="Enter your email"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="shrink-0 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-2 items-center justify-between text-xs text-gray-400 md:flex-row">
          <p>© {year} TripGo. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-white">Privacy</a>
            <a href="/terms" className="hover:text-white">Terms</a>
            <a href="/contact" className="hover:text-white">Contact</a>
            <a href="/blog" className="hover:text-white">Blog</a>
          </div>
        </div>
      </div>
    </footer>
  );
}