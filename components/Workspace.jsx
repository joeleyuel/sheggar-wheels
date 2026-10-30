"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";
import {
  getData,
  saveData,
  initializeDemoData,
  makeId,
  exportCSV,
  resetDemoData,
} from "@/lib/storage";

const supabase = createClient();

const money = n =>
  new Intl.NumberFormat("en-ET", {
    style: "currency",
    currency: "ETB",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const today = () => new Date().toISOString().slice(0, 10);

const statusClass = s =>
  String(s || "").toLowerCase().replaceAll(" ", "-");

const navPublic = [
  ["Home", "/"],
  ["Explore cars", "/cars"],
];

function CarCard({ car, onBook }) {
  return (
    <article className="car-card">
      <Link href={`/cars/${car.id}`} className="car-photo">
        <img
          src={car.photos?.[0]}
          alt={`${car.make} ${car.model}`}
        />
        <span className="photo-tag">{car.transmission}</span>
      </Link>

      <div className="car-card-body">
        <div className="card-top">
          <span className="eyebrow">
            {car.year} · {car.neighbourhood}
          </span>
          <span className="rating">★ 4.9</span>
        </div>

        <Link href={`/cars/${car.id}`} className="car-title">
          {car.make} {car.model}
        </Link>

        <p className="muted small">
          {car.seats} seats · {car.city}
        </p>

        <div className="card-bottom">
          <div>
            <strong>{money(car.pricePerDay)}</strong>
            <span className="muted small"> / day</span>
          </div>

          <button
            className="button small-button"
            onClick={() => onBook(car)}
          >
            Book
          </button>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="stat-card">
      <span className="muted small">{label}</span>
      <strong>{value}</strong>
      {sub && <span className="small muted">{sub}</span>}
    </div>
  );
}

function Empty({ title, body, href, label }) {
  return (
    <div className="empty">
      <div className="empty-icon">✦</div>
      <h3>{title}</h3>
      <p>{body}</p>
      {href && (
        <Link className="button primary" href={href}>
          {label}
        </Link>
      )}
    </div>
  );
}

function Table({ headers, children }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map(h => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default function Workspace({ page = "home", itemId }) {
  const router = useRouter();
  const pathname = usePathname();

  const [ready, setReady] = useState(false);
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [user, setUser] = useState(null);

  const [query, setQuery] = useState("");
  const [area, setArea] = useState("All");
  const [sort, setSort] = useState("recommended");
  const [maxPrice, setMaxPrice] = useState("");
  const [transmission, setTransmission] = useState("All");
  const [pageNo, setPageNo] = useState(1);

  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [error, setError] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load the existing marketplace demo data.
  // This data is still stored locally during our migration.
  const refresh = () => {
    setUsers(getData("users"));
    setCars(getData("cars"));
    setBookings(getData("bookings"));
    setReviews(getData("reviews"));
    setDisputes(getData("disputes"));
    setAnnouncements(getData("announcements"));
  };

  // Load a user's profile from Supabase.
  const loadProfile = async authUser => {
    if (!authUser) {
      setUser(null);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role")
      .eq("id", authUser.id)
      .single();

    if (profileError) {
      console.error("Profile loading error:", profileError.message);
      setUser(null);
      return;
    }

    setUser({
      id: authUser.id,
      name: profile.full_name,
      email: authUser.email,
      phone: profile.phone,
      roles: [profile.role],
      status: "active",
    });
  };

  // Initialize local demo data and check the Supabase session.
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      initializeDemoData();
      refresh();

      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (authError) {
        console.error("Session loading error:", authError.message);
        setUser(null);
      } else if (authUser) {
        await loadProfile(authUser);
      } else {
        setUser(null);
      }

      if (mounted) {
        setReady(true);
      }
    };

    initialize();

    // Listen for Supabase login and logout events.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (!session?.user) {
        setUser(null);
        return;
      }

      // Run profile loading after the auth callback finishes.
      setTimeout(() => {
        if (mounted) {
          loadProfile(session.user);
        }
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const persist = (name, data, setter) => {
    saveData(name, data);
    setter(data);
  };

  const flash = msg => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 3500);
  };

  const isOwner = user?.roles?.includes("owner");
  const isAdmin = user?.roles?.includes("admin");
  const isRenter = user?.roles?.includes("renter");

  // Supabase email/password sign-in.
  const signIn = async () => {
    if (!form.email || !form.password) {
      setError("Enter your email address and password.");
      return;
    }

    setError("");

    const { data, error: signInError } =
      await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

    if (signInError) {
      setError(signInError.message);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role")
      .eq("id", data.user.id)
      .single();

    if (profileError) {
      setError(
        "You signed in, but your profile could not be loaded. Please try again."
      );
      console.error(profileError.message);
      return;
    }

    const signedInUser = {
      id: data.user.id,
      name: profile.full_name,
      email: data.user.email,
      phone: profile.phone,
      roles: [profile.role],
      status: "active",
    };

    setUser(signedInUser);

    const next = new URLSearchParams(window.location.search).get("next");

    const safeNext =
      next && next.startsWith("/") && !next.startsWith("//");

    if (safeNext) {
      router.push(next);
    } else if (profile.role === "admin") {
      router.push("/admin");
    } else if (profile.role === "owner") {
      router.push("/owner");
    } else {
      router.push("/dashboard");
    }
  };

  // Supabase logout.
  const signOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
      return;
    }

    setUser(null);
    router.push("/");
    flash("You have signed out successfully.");
  };

  const safePath = path => {
    if (!user) {
      router.push(`/signin?next=${encodeURIComponent(path)}`);
      return false;
    }

    return true;
  };

  const saveBooking = (car, start, end) => {
    if (!safePath("/bookings")) return;

    const days =
      Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1;

    if (!start || !end || days < 1) {
      setError("Choose a valid start and end date.");
      return;
    }

    if (
      bookings.some(
        b =>
          b.carId === car.id &&
          ["requested", "confirmed", "paid"].includes(b.status) &&
          !(end < b.startDate || start > b.endDate)
      )
    ) {
      setError(
        "Those dates overlap an active booking. Choose different dates."
      );
      return;
    }

    const subtotal = days * car.pricePerDay;
    const fee = Math.round(subtotal * 0.05);

    const booking = {
      id: `SW-${Date.now().toString().slice(-6)}`,
      carId: car.id,
      renterId: user.id,
      ownerId: car.ownerId,
      startDate: start,
      endDate: end,
      days,
      pricePerDay: car.pricePerDay,
      subtotal,
      fee,
      total: subtotal + fee,
      paymentStatus: "unpaid",
      status: "requested",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    persist("bookings", [booking, ...bookings], setBookings);

    sessionStorage.setItem(
      "sw_checkout_draft_v1",
      JSON.stringify({ bookingId: booking.id })
    );

    setModal(null);
    setError("");
    router.push("/bookings");
    flash("Booking request saved. The owner can now review it.");
  };

  const updateBooking = (id, status) => {
    const booking = bookings.find(b => b.id === id);

    if (!booking) return;
    if (status === "confirmed" && !isOwner && !isAdmin) return;

    if (
      status === "cancelled" &&
      booking.renterId !== user?.id &&
      !isAdmin
    ) {
      return;
    }

    if (
      !["requested", "confirmed", "cancelled", "completed", "declined"].includes(
        status
      )
    ) {
      return;
    }

    const updated = bookings.map(b =>
      b.id === id
        ? { ...b, status, updatedAt: new Date().toISOString() }
        : b
    );

    persist("bookings", updated, setBookings);
    flash(`Booking ${status}.`);
  };

  const publicCars = cars.filter(c => c.status === "approved");

  const filtered = useMemo(() => {
    let out = [...publicCars];

    if (query) {
      out = out.filter(c =>
        `${c.make} ${c.model} ${c.neighbourhood} ${c.description}`
          .toLowerCase()
          .includes(query.toLowerCase())
      );
    }

    if (area !== "All") {
      out = out.filter(c => c.neighbourhood === area);
    }

    if (transmission !== "All") {
      out = out.filter(c => c.transmission === transmission);
    }

    if (maxPrice) {
      out = out.filter(c => c.pricePerDay <= Number(maxPrice));
    }

    if (sort === "price-asc") {
      out.sort((a, b) => a.pricePerDay - b.pricePerDay);
    }

    if (sort === "price-desc") {
      out.sort((a, b) => b.pricePerDay - a.pricePerDay);
    }

    if (sort === "newest") {
      out.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return out;
  }, [cars, query, area, transmission, maxPrice, sort]);

  const currentCar = cars.find(c => c.id === itemId);

  const ownedCars = cars.filter(c => c.ownerId === user?.id);
  const myBookings = bookings.filter(b => b.renterId === user?.id);

  const ownerBookings = bookings.filter(b =>
    ownedCars.some(c => c.id === b.carId)
  );

  const carFor = id => cars.find(c => c.id === id);

  const updateCarStatus = (id, status) => {
    const car = cars.find(c => c.id === id);

    if (!car || !isAdmin) return;

    persist(
      "cars",
      cars.map(c => (c.id === id ? { ...c, status } : c)),
      setCars
    );

    flash(`Listing ${status}.`);
  };

  const saveListing = () => {
    const price = Number(form.pricePerDay);
    const seats = Number(form.seats);

    if (
      !form.make ||
      !form.model ||
      !price ||
      price < 100 ||
      !seats ||
      seats < 1
    ) {
      setError(
        "Enter make, model, a valid daily price and number of seats."
      );
      return;
    }

    const car = {
      id: makeId("car"),
      ownerId: user.id,
      make: form.make,
      model: form.model,
      year: Number(form.year) || 2022,
      transmission: form.transmission || "Automatic",
      seats,
      city: "Addis Ababa",
      neighbourhood: form.neighbourhood || "Bole",
      pricePerDay: price,
      photos: [form.photo || "/images/cars/byd-song-plus.webp"],
      description:
        form.description || "Owner-listed vehicle in Addis Ababa.",
      status: "pending",
      unavailableDates: [],
      createdAt: today(),
    };

    persist("cars", [car, ...cars], setCars);

    setModal(null);
    setForm({});
    setError("");
    flash("Your listing was submitted for admin approval.");
  };

  const submitReview = booking => {
    if (!form.comment || !form.rating) {
      setError("Add a rating and a short comment.");
      return;
    }

    const review = {
      id: makeId("review"),
      bookingId: booking.id,
      carId: booking.carId,
      renterId: user.id,
      ownerId: booking.ownerId,
      rating: Number(form.rating),
      comment: form.comment,
      ownerReply: "",
      createdAt: today(),
    };

    persist("reviews", [review, ...reviews], setReviews);

    setModal(null);
    setForm({});
    setError("");
    flash("Thank you. Your review has been saved.");
  };

  const addAnnouncement = () => {
    if (!form.title || !form.message) {
      setError("Add a title and message.");
      return;
    }

    const item = {
      id: makeId("ann"),
      title: form.title,
      message: form.message,
      active: true,
      createdAt: today(),
      createdBy: user.id,
    };

    persist(
      "announcements",
      [item, ...announcements],
      setAnnouncements
    );

    setModal(null);
    setForm({});
    setError("");
    flash("Announcement published.");
  };

  const exportRows = (filename, rows) => {
    if (!exportCSV(filename, rows)) {
      flash("There is no data to export yet.");
    } else {
      flash("CSV export downloaded.");
    }
  };

  // Supabase signup.
  const signUp = async () => {
    if (!form.name?.trim() || !form.email?.trim() || !form.password) {
      setError("Please complete all required fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setError("");

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          full_name: form.name.trim(),
          phone: form.phone?.trim() || null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

   if (data.session) {
      const profile = await loadProfile(data.user);

   if (profile) {
      router.push("/dashboard");
    }
 }  else {
      setForm({});
      flash(
        "Account created! Check your email and confirm your address before signing in."
      );
    }
  };

  const protectedPage = [
    "dashboard",
    "bookings",
    "owner",
    "admin",
  ].includes(page);

  if (!ready) {
    return (
      <div className="loading-screen">
        <div className="brand-mark">S</div>
        <p>Preparing your Sheggar Wheels demo…</p>
      </div>
    );
  }

  if (protectedPage && !user) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <span className="eyebrow">MEMBER AREA</span>
          <h1>Sign in to continue</h1>
          <p className="muted">
            This page is available to signed-in members.
          </p>
          <Link
            className="button primary full"
            href={`/signin?next=${pathname}`}
          >
            Go to sign in
          </Link>
        </div>
      </main>
    );
  }

  if (page === "owner" && !isOwner && !isAdmin) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <h1>Owner access required</h1>
          <p className="muted">
            Your account does not currently have owner access.
          </p>
          <Link href="/dashboard" className="button primary">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (page === "admin" && !isAdmin) {
    return (
      <main className="auth-page">
        <div className="auth-card">
          <h1>Admin access required</h1>
          <p className="muted">
            Your account does not currently have administrator access.
          </p>
          <Link href="/dashboard" className="button primary">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  const openBooking = car => {
    if (!safePath("/bookings")) return;

    setForm({ start: today(), end: today() });
    setError("");
    setModal({ type: "booking", car });
  };

  const navLinks =
    page === "owner" || page === "admin" ? [] : navPublic;

  const title =
    page === "home"
      ? "Find a car. Make the city yours."
      : page === "cars"
        ? "Find your next ride"
        : page === "dashboard"
          ? "Your dashboard"
          : page === "bookings"
            ? "Your bookings"
            : page === "owner"
              ? "Owner workspace"
              : page === "admin"
                ? "Platform overview"
                : "";

  const pageContent = () => {
    if (page === "signin") {
      return (
        <div className="auth-page">
          <form
            className="auth-card"
            onSubmit={e => {
              e.preventDefault();
              signIn();
            }}
          >
            <span className="eyebrow">WELCOME BACK</span>
            <h1>Sign in to Sheggar Wheels</h1>
            <p className="muted">
              Enter the email and password you used when creating your account.
            </p>

            {error && <div className="alert error">{error}</div>}

            <label>
              Email address
              <input
                type="email"
                value={form.email || ""}
                onChange={e =>
                  setForm({ ...form, email: e.target.value })
                }
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={form.password || ""}
                onChange={e =>
                  setForm({ ...form, password: e.target.value })
                }
                autoComplete="current-password"
                required
              />
            </label>

            <button className="button primary full" type="submit">
              Sign in
            </button>

            <p className="tiny muted center">
              Don't have an account?{" "}
              <Link href="/signup">Create an account</Link>
            </p>
          </form>
        </div>
      );
    }

    if (page === "signup") {
      return (
        <div className="auth-page">
          <form
            className="auth-card"
            onSubmit={e => {
              e.preventDefault();
              signUp();
            }}
          >
            <span className="eyebrow">GET STARTED</span>
            <h1>Create your account</h1>
            <p className="muted">
              Create your Sheggar Wheels account. New accounts start with renter access.
            </p>

            {error && <div className="alert error">{error}</div>}

            <label>
              Full name
              <input
                type="text"
                value={form.name || ""}
                onChange={e =>
                  setForm({ ...form, name: e.target.value })
                }
                autoComplete="name"
                required
              />
            </label>

            <label>
              Email address
              <input
                type="email"
                value={form.email || ""}
                onChange={e =>
                  setForm({ ...form, email: e.target.value })
                }
                autoComplete="email"
                required
              />
            </label>

            <label>
              Password
              <input
                type="password"
                value={form.password || ""}
                onChange={e =>
                  setForm({ ...form, password: e.target.value })
                }
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>

            <label>
              Phone number
              <input
                type="tel"
                value={form.phone || ""}
                onChange={e =>
                  setForm({ ...form, phone: e.target.value })
                }
                autoComplete="tel"
              />
            </label>

            <button className="button primary full" type="submit">
              Create account
            </button>

            <p className="tiny muted center">
              You may need to confirm your email before signing in.
            </p>

            <p className="tiny muted center">
              Already have an account?{" "}
              <Link href="/signin">Sign in</Link>
            </p>
          </form>
        </div>
      );
    }

    if (page === "car-detail") {
      if (!currentCar) {
        return (
          <Empty
            title="Car not found"
            body="This listing may have been removed or is not available."
            href="/cars"
            label="Explore cars"
          />
        );
      }

      return (
        <div className="detail-layout">
          <div>
            <img
              className="detail-image"
              src={currentCar.photos?.[0]}
              alt={`${currentCar.make} ${currentCar.model}`}
            />

            <div className="detail-copy">
              <span className="eyebrow">
                {currentCar.year} · {currentCar.neighbourhood}, Addis Ababa
              </span>
              <h1>
                {currentCar.make} {currentCar.model}
              </h1>
              <p>{currentCar.description}</p>

              <div className="spec-grid">
                <Stat label="Transmission" value={currentCar.transmission} />
                <Stat label="Seats" value={currentCar.seats} />
                <Stat label="Model year" value={currentCar.year} />
                <Stat label="Location" value={currentCar.neighbourhood} />
              </div>

              <h3>About this car</h3>
              <p className="muted">{currentCar.description}</p>

              {currentCar.specificationNote && (
                <p className="tiny muted">
                  {currentCar.specificationNote}
                </p>
              )}
            </div>
          </div>

          <aside className="booking-panel">
            <span className="eyebrow">DAILY RATE</span>
            <h2>
              {money(currentCar.pricePerDay)} <small>/ day</small>
            </h2>
            <p className="muted small">
              No payment is collected on this demo.
            </p>
            <button
              className="button primary full"
              onClick={() => openBooking(currentCar)}
            >
              Request to book
            </button>
            <div className="panel-note">
              ✓ Demo availability check
              <br />
              ✓ Owner approval required
              <br />
              ✓ Mock payment only
            </div>
          </aside>
        </div>
      );
    }

    if (page === "cars") {
      return (
        <>
          <section className="page-intro">
            <div>
              <span className="eyebrow">THE FLEET</span>
              <h1>{title}</h1>
              <p className="muted">
                Thoughtfully selected cars around Addis Ababa.
              </p>
            </div>
            <span className="result-count">{filtered.length} cars found</span>
          </section>

          <div className="filters">
            <input
              aria-label="Search cars"
              placeholder="Search make, model or area…"
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setPageNo(1);
              }}
            />

            <select
              value={area}
              onChange={e => {
                setArea(e.target.value);
                setPageNo(1);
              }}
            >
              <option>All</option>
              {["Bole", "Kazanchis", "Megenagna", "CMC", "Piazza", "Sar Bet", "Gerji"].map(x => (
                <option key={x}>{x}</option>
              ))}
            </select>

            <select
              value={transmission}
              onChange={e => setTransmission(e.target.value)}
            >
              <option>All</option>
              <option>Automatic</option>
              <option>Manual</option>
            </select>

            <input
              type="number"
              min="0"
              placeholder="Max ETB / day"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
            />

            <select value={sort} onChange={e => setSort(e.target.value)}>
              <option value="recommended">Recommended</option>
              <option value="price-asc">Price: low to high</option>
              <option value="price-desc">Price: high to low</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          {filtered.length ? (
            <div className="car-grid">
              {filtered
                .slice((pageNo - 1) * 6, pageNo * 6)
                .map(c => (
                  <CarCard key={c.id} car={c} onBook={openBooking} />
                ))}
            </div>
          ) : (
            <Empty
              title="No cars match your search"
              body="Try changing your search or removing a filter."
            />
          )}

          <div className="pagination">
            <button
              className="button secondary"
              disabled={pageNo === 1}
              onClick={() => setPageNo(p => p - 1)}
            >
              Previous
            </button>

            <span>
              Page {pageNo} of {Math.max(1, Math.ceil(filtered.length / 6))}
            </span>

            <button
              className="button secondary"
              disabled={pageNo >= Math.ceil(filtered.length / 6)}
              onClick={() => setPageNo(p => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      );
    }

    if (page === "home") {
      return (
        <>
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow light">YOUR CITY. YOUR JOURNEY.</span>
              <h1>
                Find a car.
                <br />
                <em>Make the city yours.</em>
              </h1>
              <p>
                Discover trusted local cars for the journeys that matter.
                Simple rentals, right here in Addis Ababa.
              </p>

              <div className="hero-actions">
                <Link href="/cars" className="button light-button">
                  Explore cars <span>↗</span>
                </Link>
                <Link href="/signup" className="hero-link">
                  List your car
                </Link>
              </div>

              <div className="hero-trust">
                <span>✦ Local car owners</span>
                <span>✦ Flexible daily rates</span>
              </div>
            </div>

            <div className="hero-art">
              <img
                src="/images/cars/byd-song-plus.webp"
                alt="Modern car on the road"
              />
              <div className="floating-card">
                <span className="eyebrow">START EXPLORING</span>
                <b>From {money(1500)} / day</b>
                <small>Sample listings across Addis</small>
              </div>
            </div>
          </section>

          <section className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">HANDPICKED FOR YOU</span>
                <h2>Featured rides</h2>
              </div>
              <Link href="/cars" className="text-link">
                View all cars ↗
              </Link>
            </div>

            <div className="car-grid">
              {publicCars
                .filter(c => c.featured)
                .slice(0, 3)
                .map(c => (
                  <CarCard key={c.id} car={c} onBook={openBooking} />
                ))}
            </div>
          </section>

          <section className="steps-section">
            <span className="eyebrow">A BETTER WAY TO GET AROUND</span>
            <h2>Three steps to your next trip.</h2>

            <div className="steps-grid">
              {[
                ["01", "Find your ride", "Explore local cars and compare daily prices."],
                ["02", "Request your dates", "Send a booking request to the car owner."],
                ["03", "Enjoy the journey", "Follow your booking status in one place."],
              ].map(x => (
                <div className="step" key={x[0]}>
                  <span>{x[0]}</span>
                  <h3>{x[1]}</h3>
                  <p>{x[2]}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="owner-cta">
            <div>
              <span className="eyebrow light">HAVE A CAR?</span>
              <h2>Put your car to work.</h2>
              <p>
                Share your available vehicle with people looking for their next ride.
              </p>
            </div>
            <Link className="button light-button" href="/signin">
              Become an owner ↗
            </Link>
          </section>
        </>
      );
    }

    if (page === "dashboard") {
      return (
        <>
          <div className="page-intro">
            <div>
              <span className="eyebrow">RENTER SPACE</span>
              <h1>{title}</h1>
              <p className="muted">
                Welcome back, {user?.name?.split(" ")[0]}.
              </p>
            </div>
            <Link className="button primary" href="/cars">
              Find a car
            </Link>
          </div>

          <div className="stats-grid">
            <Stat label="Total bookings" value={myBookings.length} />
            <Stat
              label="Upcoming trips"
              value={myBookings.filter(b => ["requested", "confirmed"].includes(b.status)).length}
            />
            <Stat
              label="Completed trips"
              value={myBookings.filter(b => b.status === "completed").length}
            />
            <Stat
              label="Demo spend"
              value={money(
                myBookings
                  .filter(b => b.paymentStatus === "paid-demo")
                  .reduce((s, b) => s + b.total, 0)
              )}
            />
          </div>

          <section className="panel">
            <div className="section-heading">
              <h2>Recent bookings</h2>
              <Link className="text-link" href="/bookings">
                View all ↗
              </Link>
            </div>

            {myBookings.length ? (
              <Table headers={["Booking", "Car", "Dates", "Total", "Status"]}>
                {myBookings.slice(0, 5).map(b => (
                  <tr key={b.id}>
                    <td><Link href="/bookings">{b.id}</Link></td>
                    <td>{carFor(b.carId)?.make} {carFor(b.carId)?.model}</td>
                    <td>{b.startDate} – {b.endDate}</td>
                    <td>{money(b.total)}</td>
                    <td><span className={`status ${statusClass(b.status)}`}>{b.status}</span></td>
                  </tr>
                ))}
              </Table>
            ) : (
              <Empty
                title="Your next trip starts here"
                body="You haven't made a booking yet."
                href="/cars"
                label="Explore cars"
              />
            )}
          </section>
        </>
      );
    }

    if (page === "bookings") {
      return (
        <>
          <div className="page-intro">
            <div>
              <span className="eyebrow">TRIP HISTORY</span>
              <h1>{title}</h1>
              <p className="muted">
                Track requests, confirmations and completed trips.
              </p>
            </div>

            <button
              className="button secondary"
              onClick={() =>
                exportRows(
                  "my-bookings.csv",
                  myBookings.map(b => ({
                    booking: b.id,
                    car: `${carFor(b.carId)?.make || ""} ${carFor(b.carId)?.model || ""}`,
                    start: b.startDate,
                    end: b.endDate,
                    total: b.total,
                    status: b.status,
                  }))
                )
              }
            >
              ↓ Export CSV
            </button>
          </div>

          {myBookings.length ? (
            <Table headers={["Booking", "Vehicle", "Dates", "Total", "Status", "Action"]}>
              {myBookings.map(b => (
                <tr key={b.id}>
                  <td><b>{b.id}</b></td>
                  <td>{carFor(b.carId)?.make} {carFor(b.carId)?.model}</td>
                  <td>{b.startDate}<br /><span className="muted small">to {b.endDate}</span></td>
                  <td>{money(b.total)}</td>
                  <td><span className={`status ${statusClass(b.status)}`}>{b.status}</span></td>
                  <td>
                    {["requested", "confirmed"].includes(b.status) && (
                      <button className="text-button danger-text" onClick={() => updateBooking(b.id, "cancelled")}>
                        Cancel
                      </button>
                    )}
                    {b.status === "completed" && !reviews.some(r => r.bookingId === b.id) && (
                      <button
                        className="text-button"
                        onClick={() => {
                          setForm({ rating: "5", comment: "" });
                          setModal({ type: "review", booking: b });
                        }}
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          ) : (
            <Empty
              title="No bookings yet"
              body="Your booking history will appear here."
              href="/cars"
              label="Explore cars"
            />
          )}
        </>
      );
    }

    if (page === "owner") {
      return (
        <>
          <div className="page-intro">
            <div>
              <span className="eyebrow">OWNER WORKSPACE</span>
              <h1>{title}</h1>
              <p className="muted">
                Manage your listings and booking requests.
              </p>
            </div>

            <button
              className="button primary"
              onClick={() => {
                setForm({ year: 2022, seats: 5, transmission: "Automatic" });
                setModal({ type: "listing" });
              }}
            >
              ＋ Add a car
            </button>
          </div>

          <div className="stats-grid">
            <Stat label="Your cars" value={ownedCars.length} />
            <Stat label="Approved listings" value={ownedCars.filter(c => c.status === "approved").length} />
            <Stat label="Pending requests" value={ownerBookings.filter(b => b.status === "requested").length} />
            <Stat label="Demo earnings" value={money(ownerBookings.filter(b => b.status === "completed").reduce((s, b) => s + b.subtotal, 0))} />
          </div>

          <section className="panel">
            <div className="section-heading">
              <h2>Your listings</h2>
              <span className="muted small">Only your own vehicles</span>
            </div>

            {ownedCars.length ? (
              <Table headers={["Vehicle", "Area", "Daily rate", "Status"]}>
                {ownedCars.map(c => (
                  <tr key={c.id}>
                    <td><b>{c.make} {c.model}</b><div className="muted small">{c.year} · {c.transmission}</div></td>
                    <td>{c.neighbourhood}</td>
                    <td>{money(c.pricePerDay)}</td>
                    <td><span className={`status ${statusClass(c.status)}`}>{c.status}</span></td>
                  </tr>
                ))}
              </Table>
            ) : (
              <Empty title="No listings yet" body="Add your first car to get started." />
            )}
          </section>

          <section className="panel">
            <div className="section-heading"><h2>Booking requests</h2></div>

            {ownerBookings.length ? (
              <Table headers={["Booking", "Car", "Renter", "Dates", "Status", "Decision"]}>
                {ownerBookings.map(b => (
                  <tr key={b.id}>
                    <td>{b.id}</td>
                    <td>{carFor(b.carId)?.make} {carFor(b.carId)?.model}</td>
                    <td>{users.find(u => u.id === b.renterId)?.name}</td>
                    <td>{b.startDate} – {b.endDate}</td>
                    <td><span className={`status ${statusClass(b.status)}`}>{b.status}</span></td>
                    <td>
                      {b.status === "requested" && (
                        <div className="inline-actions">
                          <button className="text-button" onClick={() => updateBooking(b.id, "confirmed")}>Approve</button>
                          <button className="text-button danger-text" onClick={() => updateBooking(b.id, "declined")}>Decline</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            ) : (
              <p className="muted">No booking requests for your cars yet.</p>
            )}
          </section>

          <section className="panel">
            <h2>Monthly earnings snapshot</h2>
            <div className="bars">
              {[35, 55, 42, 68, 50, 82].map((n, i) => (
                <div className="bar-col" key={i}>
                  <div className="bar" style={{ height: `${n}%` }} />
                  <small>{["May", "Jun", "Jul", "Aug", "Sep", "Oct"][i]}</small>
                </div>
              ))}
            </div>
            <p className="tiny muted">
              Illustrative demo chart. Connect verified booking records in the backend for real earnings.
            </p>
          </section>
        </>
      );
    }

    if (page === "admin") {
      return (
        <>
          <div className="page-intro">
            <div>
              <span className="eyebrow">ADMINISTRATION</span>
              <h1>{title}</h1>
              <p className="muted">
                Moderate the sample marketplace and inspect demo activity.
              </p>
            </div>

            <button
              className="button secondary"
              onClick={() =>
                exportRows(
                  "platform-bookings.csv",
                  bookings.map(b => ({
                    id: b.id,
                    car: b.carId,
                    renter: b.renterId,
                    owner: b.ownerId,
                    total: b.total,
                    status: b.status,
                  }))
                )
              }
            >
              ↓ Export report
            </button>
          </div>

          <div className="stats-grid">
            <Stat label="Demo users" value={users.length} />
            <Stat label="Active listings" value={cars.filter(c => c.status === "approved").length} />
            <Stat label="Pending approval" value={cars.filter(c => c.status === "pending").length} />
            <Stat label="All bookings" value={bookings.length} />
          </div>

          <section className="panel">
            <div className="section-heading"><h2>Listing moderation</h2></div>
            <Table headers={["Vehicle", "Owner", "Daily rate", "Status", "Action"]}>
              {cars.map(c => (
                <tr key={c.id}>
                  <td>{c.make} {c.model}</td>
                  <td>{users.find(u => u.id === c.ownerId)?.name}</td>
                  <td>{money(c.pricePerDay)}</td>
                  <td><span className={`status ${statusClass(c.status)}`}>{c.status}</span></td>
                  <td>
                    {c.status === "pending" && (
                      <div className="inline-actions">
                        <button className="text-button" onClick={() => updateCarStatus(c.id, "approved")}>Approve</button>
                        <button className="text-button danger-text" onClick={() => updateCarStatus(c.id, "rejected")}>Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </section>

          <section className="panel">
            <div className="section-heading"><h2>Demo users</h2></div>
            <Table headers={["Name", "Email", "Role", "Status", "Action"]}>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.roles.join(", ")}</td>
                  <td><span className={`status ${statusClass(u.status)}`}>{u.status}</span></td>
                  <td>
                    {u.id !== "u-admin" && (
                      <button
                        className="text-button"
                        onClick={() => {
                          const next = users.map(x =>
                            x.id === u.id
                              ? { ...x, status: x.status === "active" ? "suspended" : "active" }
                              : x
                          );
                          persist("users", next, setUsers);
                          flash("Demo account status updated.");
                        }}
                      >
                        {u.status === "active" ? "Suspend" : "Reinstate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </section>

          <section className="panel">
            <div className="section-heading"><h2>Dispute inbox</h2></div>
            {disputes.length ? (
              <Table headers={["ID", "Reason", "Description", "Status", "Action"]}>
                {disputes.map(d => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.reason}</td>
                    <td>{d.description}</td>
                    <td>{d.status}</td>
                    <td>
                      {d.status === "open" && (
                        <button
                          className="text-button"
                          onClick={() => {
                            const next = disputes.map(x =>
                              x.id === d.id
                                ? {
                                    ...x,
                                    status: "resolved",
                                    resolutionNotes: "Resolved in frontend demo by administrator.",
                                    resolvedBy: user.id,
                                  }
                                : x
                            );
                            persist("disputes", next, setDisputes);
                            flash("Dispute marked resolved.");
                          }}
                        >
                          Resolve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </Table>
            ) : (
              <p className="muted">No disputes.</p>
            )}
          </section>

          <section className="panel">
            <div className="section-heading">
              <h2>Announcements</h2>
              <button
                className="button secondary small-button"
                onClick={() => {
                  setForm({});
                  setModal({ type: "announcement" });
                }}
              >
                ＋ New announcement
              </button>
            </div>

            {announcements.map(a => (
              <div className="announcement" key={a.id}>
                <b>{a.title}</b>
                <p>{a.message}</p>
                <span className="tiny muted">
                  {a.createdAt} · {a.active ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </section>

          <div className="panel danger-zone">
            <h3>Demo data controls</h3>
            <p className="muted small">
              Reset removes local changes in this browser and restores sample records.
            </p>
            <button
              className="button danger"
              onClick={() => {
                if (confirm("Reset all Sheggar Wheels demo data in this browser?")) {
                  resetDemoData();
                  refresh();
                  flash("Demo data reset.");
                }
              }}
            >
              Reset demo data
            </button>
          </div>
        </>
      );
    }

    return (
      <Empty
        title="Page under construction"
        body="This section is planned for the next frontend iteration."
        href="/"
        label="Back home"
      />
    );
  };

  return (
    <>
      <header className="site-header">
        <Link href="/" className="brand">
          <span className="brand-mark">S</span>
          <span>
            sheggar<span className="brand-light">wheels</span>
          </span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setMobileMenuOpen(open => !open)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav
          id="primary-navigation"
          className={`main-nav${mobileMenuOpen ? " is-open" : ""}`}
        >
          {navLinks.map(([label, href]) => (
            <Link
              onClick={() => setMobileMenuOpen(false)}
              className={pathname === href ? "active" : ""}
              key={href}
              href={href}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          {user ? (
            <>
              <span className="user-chip">
                <span className="avatar tiny-avatar">
                  {user.name?.[0] || "U"}
                </span>
                <span>{user.name?.split(" ")[0] || "Account"}</span>
              </span>

              {isAdmin ? (
                <Link href="/admin" className="button secondary small-button">
                  Admin
                </Link>
              ) : isOwner ? (
                <Link href="/owner" className="button secondary small-button">
                  Owner space
                </Link>
              ) : (
                <Link href="/dashboard" className="button secondary small-button">
                  Dashboard
                </Link>
              )}

              <button className="text-button" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/signin" className="text-button">
                Sign in
              </Link>
              <Link href="/signup" className="button primary small-button">
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className={page === "home" ? "main home-main" : "main"}>
        {pageContent()}
      </main>

      <footer className="footer">
        <div className="footer-top">
          <Link href="/" className="brand">
            <span className="brand-mark">S</span>
            <span>
              sheggar<span className="brand-light">wheels</span>
            </span>
          </Link>

          <p>Local journeys. Shared possibilities.</p>

          <div>
            <Link href="/cars">Explore cars</Link>
            <Link href="/signin">Sign in</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Sheggar Wheels · Frontend capstone demo</span>
          <span>Sample marketplace data · No real payments</span>
        </div>
      </footer>

      {notice && (
        <div className="toast" role="status">
          {notice}
        </div>
      )}

      {modal && (
        <div
          className="modal-backdrop"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div className="modal" role="dialog" aria-modal="true">
            <button
              className="modal-close"
              onClick={() => setModal(null)}
              aria-label="Close"
            >
              ×
            </button>

            {modal.type === "booking" ? (
              <>
                <span className="eyebrow">BOOK YOUR RIDE</span>
                <h2>{modal.car.make} {modal.car.model}</h2>
                <p className="muted small">
                  {money(modal.car.pricePerDay)} per day · {modal.car.neighbourhood}
                </p>

                {error && <div className="alert error">{error}</div>}

                <label>
                  Pick-up date
                  <input
                    type="date"
                    min={today()}
                    value={form.start || ""}
                    onChange={e => setForm({ ...form, start: e.target.value })}
                  />
                </label>

                <label>
                  Return date
                  <input
                    type="date"
                    min={form.start || today()}
                    value={form.end || ""}
                    onChange={e => setForm({ ...form, end: e.target.value })}
                  />
                </label>

                <div className="modal-total">
                  <span>Estimated total incl. 5% demo fee</span>
                  <b>
                    {money(
                      Math.max(
                        1,
                        Math.ceil(
                          (new Date(form.end || form.start) -
                            new Date(form.start || today())) /
                            86400000
                        ) + 1
                      ) *
                        modal.car.pricePerDay *
                        1.05
                    )}
                  </b>
                </div>

                <button
                  className="button primary full"
                  onClick={() => saveBooking(modal.car, form.start, form.end)}
                >
                  Send booking request
                </button>

                <p className="tiny muted">
                  This request is saved in your browser. No payment is taken.
                </p>
              </>
            ) : modal.type === "listing" ? (
              <>
                <span className="eyebrow">OWNER LISTING</span>
                <h2>Add a vehicle</h2>

                {error && <div className="alert error">{error}</div>}

                <div className="form-grid">
                  <label>
                    Make
                    <input
                      value={form.make || ""}
                      onChange={e => setForm({ ...form, make: e.target.value })}
                    />
                  </label>

                  <label>
                    Model
                    <input
                      value={form.model || ""}
                      onChange={e => setForm({ ...form, model: e.target.value })}
                    />
                  </label>

                  <label>
                    Year
                    <input
                      type="number"
                      value={form.year || ""}
                      onChange={e => setForm({ ...form, year: e.target.value })}
                    />
                  </label>

                  <label>
                    Seats
                    <input
                      type="number"
                      value={form.seats || ""}
                      onChange={e => setForm({ ...form, seats: e.target.value })}
                    />
                  </label>

                  <label>
                    Transmission
                    <select
                      value={form.transmission || "Automatic"}
                      onChange={e => setForm({ ...form, transmission: e.target.value })}
                    >
                      <option>Automatic</option>
                      <option>Manual</option>
                    </select>
                  </label>

                  <label>
                    Area
                    <select
                      value={form.neighbourhood || "Bole"}
                      onChange={e => setForm({ ...form, neighbourhood: e.target.value })}
                    >
                      {["Bole", "Kazanchis", "Megenagna", "CMC", "Piazza", "Sar Bet", "Gerji"].map(x => (
                        <option key={x}>{x}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Price per day (ETB)
                    <input
                      type="number"
                      value={form.pricePerDay || ""}
                      onChange={e => setForm({ ...form, pricePerDay: e.target.value })}
                    />
                  </label>

                  <label>
                    Photo URL
                    <input
                      value={form.photo || ""}
                      onChange={e => setForm({ ...form, photo: e.target.value })}
                      placeholder="https://…"
                    />
                  </label>
                </div>

                <label>
                  Description
                  <textarea
                    rows="3"
                    value={form.description || ""}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </label>

                <button className="button primary full" onClick={saveListing}>
                  Submit for approval
                </button>

                <p className="tiny muted">
                  New listings are hidden publicly until an admin approves them.
                </p>
              </>
            ) : modal.type === "review" ? (
              <>
                <span className="eyebrow">SHARE YOUR EXPERIENCE</span>
                <h2>Review your trip</h2>

                {error && <div className="alert error">{error}</div>}

                <label>
                  Rating
                  <select
                    value={form.rating || "5"}
                    onChange={e => setForm({ ...form, rating: e.target.value })}
                  >
                    <option value="5">5 — Excellent</option>
                    <option value="4">4 — Good</option>
                    <option value="3">3 — Okay</option>
                    <option value="2">2 — Poor</option>
                    <option value="1">1 — Very poor</option>
                  </select>
                </label>

                <label>
                  Your review
                  <textarea
                    rows="4"
                    value={form.comment || ""}
                    onChange={e => setForm({ ...form, comment: e.target.value })}
                  />
                </label>

                <button
                  className="button primary full"
                  onClick={() => submitReview(modal.booking)}
                >
                  Save review
                </button>
              </>
            ) : (
              <>
                <span className="eyebrow">PLATFORM UPDATE</span>
                <h2>New announcement</h2>

                {error && <div className="alert error">{error}</div>}

                <label>
                  Title
                  <input
                    value={form.title || ""}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                </label>

                <label>
                  Message
                  <textarea
                    rows="4"
                    value={form.message || ""}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                  />
                </label>

                <button className="button primary full" onClick={addAnnouncement}>
                  Publish announcement
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}