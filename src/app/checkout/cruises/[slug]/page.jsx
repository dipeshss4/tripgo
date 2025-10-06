"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { cruiseApi, bookingApi } from "../../../lib/api";
import { useApi } from "../../../components/hooks/useApi";


/* ——— Page ——— */
export default function CheckoutCruise({ params }) {
  const { data: cruiseData, loading: cruiseLoading, error: cruiseError } = useApi(
    () => cruiseApi.getBySlug(params.slug),
    [params.slug]
  );

  const cruise = cruiseData?.data;

  // State
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Confirm
  const [date, setDate] = useState("");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [cabin, setCabin] = useState("Balcony");
  const [addons, setAddons] = useState({ wifi: true, drinks: false, excursion: true, insurance: false });
  const [promo, setPromo] = useState("");
  const [appliedPromo, setAppliedPromo] = useState("");
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Pricing rules
  const cabinAdd = useMemo(() => ({ Interior: 0, Oceanview: 120, Balcony: 260, Suite: 520 }), []);
  const addonsAdd = useMemo(() => ({ wifi: 6, drinks: 25, excursion: 60, insurance: 12 }), []);

  // Check availability when date or travelers change
  useEffect(() => {
    if (cruise && date && (adults + children) > 0) {
      checkAvailability();
    }
  }, [cruise, date, adults, children]);

  const checkAvailability = async () => {
    if (!cruise || !date) return;

    setCheckingAvailability(true);
    try {
      const response = await cruiseApi.checkAvailability(cruise.id, {
        date,
        guests: adults + children
      });
      setAvailability(response.data);
    } catch (error) {
      console.error('Availability check failed:', error);
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  // Totals
  const travelers = adults + children;
  const perPerson =
    (cruise?.price || 0) +
    (cabinAdd[cabin] || 0) +
    Object.entries(addons).filter(([, v]) => v).reduce((sum, [k]) => sum + (addonsAdd[k] || 0), 0);
  const subtotal = perPerson * travelers;

  const promoDiscount = appliedPromo === "SAIL50" ? Math.min(50, subtotal * 0.05) // flat $50 or 5%, whichever lower
    : appliedPromo === "WOW10" ? Math.round(subtotal * 0.1) // 10% off
    : 0;

  const taxedBase = Math.max(0, subtotal - promoDiscount);
  const taxes = Math.round(taxedBase * 0.12);
  const fees = 59;
  const total = taxedBase + taxes + fees;

  if (cruiseLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20">
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading cruise details...</div>
        </div>
      </main>
    );
  }

  if (cruiseError || !cruise) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="text-2xl font-bold">Cruise not found</h1>
        <p className="mt-2 text-gray-600">{cruiseError?.message || 'The cruise you are looking for could not be found.'}</p>
        <Link href="/cruises" className="mt-4 inline-block text-primary underline">
          Back to all cruises
        </Link>
      </main>
    );
  }

  return (
    <main className="bg-gray-50">
      {/* HERO */}
      <section className="relative h-[42vh] w-full overflow-hidden">
        <img src={cruise.image} alt={cruise.title} className="absolute inset-0 h-full w-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/70" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-4 pb-8 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-white">
            <p className="text-[11px] uppercase tracking-[0.25em] text-white/85">Checkout</p>
            <h1 className="mt-1 text-3xl font-extrabold sm:text-4xl">{cruise.title}</h1>
            <p className="mt-2 text-white/90">{cruise.description || cruise.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/90">
              <Badge ghost>⭐ {cruise.rating || 'N/A'}</Badge>
              <Badge ghost>⏱ {cruise.duration || cruise.durationDays || 'N/A'} days</Badge>
              <Badge ghost>🚢 {cruise.type}</Badge>
              {cruise.isActive && <Badge solid>Available</Badge>}
            </div>
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <Steps current={step} labels={["Details", "Payment", "Confirm"]} />
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:px-6 lg:grid-cols-3 lg:px-8">
          {/* LEFT */}
          <div className="space-y-6 lg:col-span-2">
            {step === 1 && (
              <>
                <Card title="Travel Details">
                  {availability && (
                    <div className={`mb-4 rounded-lg p-3 text-sm ${
                      availability.available ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {availability.available ? (
                        <div>
                          ✅ <strong>Available!</strong> {availability.remainingSpots} spots remaining.
                          <br />Price: ${availability.pricePerPerson}/person
                        </div>
                      ) : (
                        <div>
                          ❌ <strong>Not available</strong> for selected date/guests.
                        </div>
                      )}
                    </div>
                  )}

                  {checkingAvailability && (
                    <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
                      🔍 Checking availability...
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Departure date">
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </Field>
                    <NumberField label="Adults" value={adults} setValue={setAdults} min={1} />
                    <NumberField label="Children" value={children} setValue={setChildren} min={0} />
                    <Field label="Cabin Type" full>
                      <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
                        {["Interior", "Oceanview", "Balcony", "Suite"].map((opt) => (
                          <button
                            type="button"
                            key={opt}
                            onClick={() => setCabin(opt)}
                            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                              cabin === opt
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                            }`}
                          >
                            {opt}
                            {cabinAdd[opt] > 0 && (
                              <span className="ml-1 text-xs text-gray-500">
                                +${cabinAdd[opt]}/pp
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    </Field>
                  </div>
                </Card>

                <Card title="Add-ons & Protection">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Addon
                      label="Unlimited Wi-Fi"
                      note="+$6 per person/day"
                      checked={addons.wifi}
                      onChange={(v) => setAddons((s) => ({ ...s, wifi: v }))}
                    />
                    <Addon
                      label="Drinks Package"
                      note="+$25 per person/day"
                      checked={addons.drinks}
                      onChange={(v) => setAddons((s) => ({ ...s, drinks: v }))}
                    />
                    <Addon
                      label="Signature Excursion"
                      note="+$60 per person"
                      checked={addons.excursion}
                      onChange={(v) => setAddons((s) => ({ ...s, excursion: v }))}
                    />
                    <Addon
                      label="Travel Insurance"
                      note="+$12 per person"
                      checked={addons.insurance}
                      onChange={(v) => setAddons((s) => ({ ...s, insurance: v }))}
                    />
                  </div>

                  {/* Promo Code */}
                  <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-4">
                    <p className="text-sm font-semibold text-gray-900">Have a promo code?</p>
                    <div className="mt-2 flex gap-2">
                      <input
                        value={promo}
                        onChange={(e) => setPromo(e.target.value.toUpperCase())}
                        placeholder="Enter code (e.g. SAIL50 or WOW10)"
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setAppliedPromo(promo.trim())}
                        className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
                      >
                        Apply
                      </button>
                    </div>
                    {appliedPromo && (
                      <p className="mt-2 text-xs text-gray-600">
                        Applied: <span className="font-medium">{appliedPromo}</span>
                        {promoDiscount > 0 ? ` — discount $${promoDiscount.toLocaleString()}` : " (no discount recognized)"}
                      </p>
                    )}
                  </div>

                  {/* Next */}
                  <div className="mt-6 flex items-center justify-between">
                    <Link href={`/cruises/${cruise.slug}`} className="text-sm font-semibold text-gray-600 hover:underline">
                      ← Back to cruise
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        if (!date) return alert("Choose a departure date first.");
                        if (availability && !availability.available) {
                          return alert("This cruise is not available for the selected date and number of guests.");
                        }
                        setStep(2);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      disabled={checkingAvailability || (availability && !availability.available)}
                      className={`rounded-xl px-6 py-3 text-sm font-semibold text-white ${
                        checkingAvailability || (availability && !availability.available)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                    >
                      {checkingAvailability ? 'Checking...' : 'Continue to Payment'}
                    </button>
                  </div>
                </Card>
              </>
            )}

            {step === 2 && (
              <>
                <Card title="Lead Traveler">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="First name" placeholder="Alex" />
                    <Input label="Last name" placeholder="Johnson" />
                    <Input label="Email" type="email" placeholder="alex@example.com" />
                    <Input label="Phone" type="tel" placeholder="+1 555 123 4567" />
                    <div className="sm:col-span-2">
                      <Input label="Country" placeholder="United States" />
                    </div>
                  </div>
                </Card>

                <Card title="Payment">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Cardholder name" placeholder="Alex Johnson" />
                    <Input label="Card number" placeholder="4242 4242 4242 4242" />
                    <Input label="Expiry (MM/YY)" placeholder="08/28" />
                    <Input label="CVC" placeholder="123" />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <Badge>SSL Secured</Badge>
                    <Badge>3D Secure</Badge>
                    <Badge>Zero Liability</Badge>
                    <Badge>Price Guarantee</Badge>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      ← Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStep(3);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary/90"
                    >
                      Review & Confirm
                    </button>
                  </div>
                </Card>
              </>
            )}

            {step === 3 && (
              <>
                <Card title="Review & Confirm">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• <b>Cruise:</b> {cruise.title}</li>
                    <li>• <b>Date:</b> {date || "—"}</li>
                    <li>• <b>Travelers:</b> {adults} adults{children ? `, ${children} children` : ""}</li>
                    <li>• <b>Cabin:</b> {cabin}</li>
                    <li>• <b>Add-ons:</b> {Object.entries(addons).filter(([, v]) => v).map(([k]) => titleize(k)).join(", ") || "None"}</li>
                    <li>• <b>Promo:</b> {appliedPromo || "—"}</li>
                  </ul>

                  <div className="mt-6 rounded-xl bg-gray-50 p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium">${subtotal.toLocaleString()}</span>
                    </div>
                    {promoDiscount > 0 && (
                      <div className="mt-1 flex items-center justify-between text-green-700">
                        <span>Promo discount</span>
                        <span className="font-medium">−${promoDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="mt-1 flex items-center justify-between">
                      <span>Taxes (12%)</span>
                      <span className="font-medium">${taxes.toLocaleString()}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span>Fees</span>
                      <span className="font-medium">${fees.toLocaleString()}</span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-base font-semibold">
                      <span>Total</span>
                      <span>${total.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                    >
                      ← Back to Payment
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!availability?.available) {
                          return alert('Please check availability first.');
                        }

                        setBookingLoading(true);
                        try {
                          // In a real app, you'd get the token from auth context
                          const token = localStorage.getItem('authToken');

                          if (!token) {
                            alert('Please log in to complete your booking.');
                            return;
                          }

                          const bookingData = {
                            sailingDate: date,
                            guests: travelers,
                            cabinType: cabin,
                            addons: Object.entries(addons)
                              .filter(([, v]) => v)
                              .map(([k]) => k),
                            totalAmount: total,
                            promoCode: appliedPromo || null
                          };

                          await bookingApi.createCruiseBooking(cruise.id, bookingData, token);
                          alert(`🎉 Booking confirmed!\n\n${cruise.title}\nDate: ${date}\nTravelers: ${travelers}\nTotal: $${total.toLocaleString()}`);
                          // You can replace alert with router.push('/checkout/success') later
                        } catch (error) {
                          console.error('Booking failed:', error);
                          alert(`Booking failed: ${error.message || 'Please try again.'}`);
                        } finally {
                          setBookingLoading(false);
                        }
                      }}
                      disabled={bookingLoading || !availability?.available}
                      className={`rounded-xl px-5 py-3 text-sm font-semibold text-white ${
                        bookingLoading || !availability?.available
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                    >
                      {bookingLoading
                        ? 'Processing...'
                        : `Pay $${total.toLocaleString()} & Confirm`
                      }
                    </button>
                  </div>

                  <p className="mt-4 text-xs text-gray-500">
                    By placing this booking you agree to our{" "}
                    <a href="/terms" className="underline">Terms & Conditions</a>.
                  </p>
                </Card>

                {/* Social proof */}
                <Card title="What travelers say">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Quote text="Smooth booking and a fantastic ship. Will book again!" name="Priya S." />
                    <Quote text="Loved the balcony cabin—sunsets were unreal." name="Daniel R." />
                    <Quote text="Great value with the promo. Super helpful support." name="Maya K." />
                  </div>
                </Card>
              </>
            )}
          </div>

          {/* RIGHT: Sticky Summary */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl bg-white shadow ring-1 ring-black/5">
              <div className="relative h-44 w-full">
                <img src={cruise.image} alt={cruise.title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="text-lg font-semibold">{cruise.title}</h3>
                  <p className="text-white/85 text-sm">{cruise.duration || cruise.durationDays || 'N/A'} days • {cruise.type}</p>
                </div>
              </div>

              <div className="p-5">
                <SummaryRow label="Travelers" value={`${travelers}`} />
                <SummaryRow label="Cabin" value={cabin} />
                <SummaryRow
                  label="Add-ons"
                  value={Object.entries(addons).filter(([, v]) => v).map(([k]) => titleize(k)).join(", ") || "None"}
                />
                <hr className="my-4 border-dashed border-gray-200" />
                <SummaryRow label="Subtotal" value={`$${subtotal.toLocaleString()}`} />
                {promoDiscount > 0 && (
                  <SummaryRow label="Promo" value={`−$${promoDiscount.toLocaleString()}`} highlight />
                )}
                <SummaryRow label="Taxes (12%)" value={`$${taxes.toLocaleString()}`} />
                <SummaryRow label="Fees" value={`$${fees.toLocaleString()}`} />
                <div className="mt-2 flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>${total.toLocaleString()}</span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (step === 1 && !date) return alert("Pick a departure date first.");
                    if (step === 1 && availability && !availability.available) {
                      return alert("This cruise is not available for the selected date and number of guests.");
                    }
                    setStep((s) => Math.min(3, s + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  disabled={step === 1 && (checkingAvailability || (availability && !availability.available))}
                  className={`mt-5 inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-white ${
                    step === 1 && (checkingAvailability || (availability && !availability.available))
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {step === 1 && checkingAvailability
                    ? 'Checking...'
                    : step === 1
                    ? "Continue to Payment"
                    : step === 2
                    ? "Review & Confirm"
                    : bookingLoading
                    ? "Processing..."
                    : "Confirm Booking"
                  }
                </button>

                <p className="mt-4 text-xs text-gray-500">
                  Prices shown in USD. Final charges displayed before payment.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

/* ——— Small UI helpers ——— */

function Steps({ current, labels }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-gray-600 sm:text-sm">
        {labels.map((l, i) => (
          <div key={l} className={`text-center ${current === i + 1 ? "text-primary" : ""}`}>{l}</div>
        ))}
      </div>
      <div className="mt-2 h-2 w-full rounded bg-gray-100">
        <div
          className="h-2 rounded bg-primary transition-all"
          style={{ width: `${(current / labels.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow ring-1 ring-black/5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <div className="h-1 w-20 rounded bg-gradient-to-r from-primary/70 via-primary to-primary/70" />
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, full = false }) {
  return (
    <div className={full ? "sm:col-span-3" : ""}>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function NumberField({ label, value, setValue, min = 0 }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1 flex items-center rounded-xl border border-gray-300 bg-white">
        <button
          type="button"
          className="px-3 py-2 text-gray-700 hover:bg-gray-50"
          onClick={() => setValue((v) => Math.max(min, v - 1))}
        >
          −
        </button>
        <input
          type="number"
          min={min}
          value={value}
          onChange={(e) => setValue(Math.max(min, Number(e.target.value || 0)))}
          className="w-full border-0 px-3 py-2 text-center text-sm focus:ring-0"
        />
        <button
          type="button"
          className="px-3 py-2 text-gray-700 hover:bg-gray-50"
          onClick={() => setValue((v) => v + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <input
        {...props}
        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
    </div>
  );
}

function Addon({ label, note, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:border-gray-300">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-gray-300"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>
        <span className="block text-sm font-semibold text-gray-900">{label}</span>
        <span className="block text-xs text-gray-600">{note}</span>
      </span>
    </label>
  );
}

function SummaryRow({ label, value, highlight = false }) {
  return (
    <div className={`flex items-center justify-between ${highlight ? "text-green-700" : ""}`}>
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${highlight ? "" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}

function Quote({ text, name }) {
  return (
    <figure className="rounded-xl border border-gray-200 bg-white p-4">
      <blockquote className="text-gray-700">“{text}”</blockquote>
      <figcaption className="mt-2 text-sm font-semibold text-gray-900">— {name}</figcaption>
    </figure>
  );
}

function Badge({ children, ghost = false, solid = false }) {
  if (solid) {
    return <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-gray-900">{children}</span>;
  }
  if (ghost) {
    return <span className="inline-flex items-center rounded-full bg-white/15 px-2.5 py-1 text-xs text-white">{children}</span>;
  }
  return <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-700">{children}</span>;
}

function titleize(k) {
  return k.charAt(0).toUpperCase() + k.slice(1);
}