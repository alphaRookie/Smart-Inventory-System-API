import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="text-xl font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            SmartSense
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">
              Features
            </a>
            <a href="#architecture" className="hover:text-indigo-600 transition-colors">
              System Stack
            </a>
            <a href="#roles" className="hover:text-indigo-600 transition-colors">
              Access Roles
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-6 pt-14 pb-16 grid lg:grid-cols-12 gap-10 items-center">
          {/* Left Copy (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full mb-5">
              Weather-ML Inventory & Spoilage System
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
              Multi-shelf stock control with weather-based demand forecasting.
            </h1>

            <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-7">
              SmartSense tracks products across multiple shelves, switches stock automatically during sales, predicts demand using live weather ML, and sends zero-spam spoilage alerts straight to Telegram.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Sign In
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 w-full flex items-center gap-5 text-xs text-gray-500">
              <div>
                <span className="block text-sm font-bold text-gray-900">Auto-Switch</span>
                Multi-shelf stock
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <span className="block text-sm font-bold text-gray-900">Weather ML</span>
                RandomForest model
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <span className="block text-sm font-bold text-gray-900">Zero-Spam</span>
                Telegram & app alerts
              </div>
            </div>
          </div>

          {/* Right Live Preview Card (7 cols) */}
          <div id="preview" className="lg:col-span-7">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Mock App Sub-header */}
              <div className="px-5 py-3.5 bg-slate-50/70 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="text-indigo-600 border-b-2 border-indigo-600 pb-1">
                    Multi-Shelf & Forecasts
                  </span>
                  <span className="text-gray-400 pb-1">Spoilage Check</span>
                  <span className="text-gray-400 pb-1">Scheduler</span>
                </div>
                <span className="text-[11px] font-medium text-gray-500">
                  Weather Sync: 29°C Sunny
                </span>
              </div>

              <div className="p-5">
                {/* Multi-Shelf & Weather Forecast Table */}
                <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-gray-500 border-b border-gray-200">
                        <th className="py-2.5 px-3.5 font-semibold">Product</th>
                        <th className="py-2.5 px-3.5 font-semibold">Shelf Priority</th>
                        <th className="py-2.5 px-3.5 font-semibold">ML Forecast</th>
                        <th className="py-2.5 px-3.5 font-semibold">Alert</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-gray-700">
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-gray-900">Fresh Whole Milk 1L</td>
                        <td className="py-2.5 px-3.5 text-gray-500">Shelf #1 (4) → #2 (10)</td>
                        <td className="py-2.5 px-3.5">12 units / 2d</td>
                        <td className="py-2.5 px-3.5">
                          <span className="px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wide bg-red-100 text-red-600">
                            DANGER
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-gray-900">Iced Cold Brew 250ml</td>
                        <td className="py-2.5 px-3.5 text-gray-500">Shelf #1 (18)</td>
                        <td className="py-2.5 px-3.5 text-indigo-600 font-semibold">+40% (Hot Weather)</td>
                        <td className="py-2.5 px-3.5">
                          <span className="px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wide bg-yellow-100 text-yellow-600">
                            WARNING
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-gray-900">Greek Yogurt Cup</td>
                        <td className="py-2.5 px-3.5 text-gray-500">Shelf #1 (9)</td>
                        <td className="py-2.5 px-3.5 text-gray-500">Sells out before expiry</td>
                        <td className="py-2.5 px-3.5">
                          <span className="px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wide bg-emerald-100 text-emerald-600">
                            INFO
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Matching Notification & Telegram Feed Snippet */}
                <div className="flex flex-col gap-2">
                  <div className="text-xs p-3 rounded-xl border bg-indigo-50/30 border-indigo-100 flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-indigo-100/80 text-indigo-700 font-bold px-2 py-0.5 rounded text-[9px] tracking-wide">
                          SPOILAGE + TELEGRAM
                        </span>
                        <span className="px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wide bg-red-100 text-red-600">
                          DANGER
                        </span>
                        <span className="font-bold text-gray-900">Fresh Whole Milk 1L</span>
                      </div>
                      <p className="text-gray-600">
                        4 units on Shelf #1 will not sell out before expiry. Push alert sent to Telegram.
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">01:30</span>
                  </div>

                  <div className="text-xs p-3 rounded-xl border bg-white border-slate-200/80 flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="bg-indigo-100/80 text-indigo-700 font-bold px-2 py-0.5 rounded text-[9px] tracking-wide">
                          WEATHER FORECAST
                        </span>
                        <span className="px-2 py-0.5 rounded font-bold uppercase text-[9px] tracking-wide bg-yellow-100 text-yellow-600">
                          WARNING
                        </span>
                        <span className="font-bold text-gray-900">Iced Cold Brew 250ml</span>
                      </div>
                      <p className="text-gray-600">
                        Warm forecast detected. Batch ML model recommends restocking 35 units.
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 shrink-0">01:00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Engineering & Product Features */}
        <section id="features" className="bg-white border-y border-gray-200 py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Built for Real Warehouse Logic</h2>
              <p className="text-sm text-gray-600 mt-1">
                Automated math, machine learning forecasts, and strict access controls out of the box.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Feature 1: Multi-Shelf & Auto Switching */}
              <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                  </svg>
                  <h3 className="text-sm font-bold text-gray-900">Multi-Shelf & Auto Switching</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Store one product across multiple shelves. When a sale happens, stock automatically deducts from Shelf #1 first, then moves to Shelf #2 once empty.
                </p>
              </div>

              {/* Feature 2: Weather-Based ML Forecasting */}
              <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
                  </svg>
                  <h3 className="text-sm font-bold text-gray-900">Weather-Based ML Forecasting</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Pulls live OpenWeatherMap data and runs a custom RandomForest model to predict demand for hot or cold weather items in single or batch requests.
                </p>
              </div>

              {/* Feature 3: Zero-Spam Spoilage & Telegram */}
              <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                  </svg>
                  <h3 className="text-sm font-bold text-gray-900">Zero-Spam Spoilage & Telegram</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Calculates financial expiry risk and skips alerts if an item will sell out in time. Real risks trigger instant Telegram lock-screen notifications.
                </p>
              </div>

              {/* Feature 4: Customizable Background Scheduler */}
              <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <h3 className="text-sm font-bold text-gray-900">Adaptive Rules & Scheduler</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Configure sales lookback windows, forecast horizons, expiry thresholds, and exact day/hour/minute schedules for automated warehouse checks.
                </p>
              </div>

              {/* Feature 5: Secure Auth & Redis OTP */}
              <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                  </svg>
                  <h3 className="text-sm font-bold text-gray-900">JWT Auth, Google & Redis OTP</h3>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Includes rotating JWT tokens, Google OAuth login with automatic email merging, and a 3-step password recovery flow backed by Redis codes.
                </p>
              </div>

              {/* Feature 6: Upcoming Complex Analytics */}
              <div className="p-5 rounded-xl border border-gray-200 bg-white shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5 text-indigo-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                    </svg>
                    <h3 className="text-sm font-bold text-gray-900">Deep Analytics Dashboard</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
                    Coming Soon
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Interactive charts in development to visualize sales trends, prevented spoilage losses, shelf turnover rates, and ML forecast accuracy.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dual-Backend & Frontend Architecture Strip */}
        <section id="architecture" className="max-w-6xl mx-auto px-6 pt-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Asynchronous Dual-Backend Architecture</h2>
            <p className="text-sm text-gray-600 mt-1">
              Heavy weather and machine learning math runs separately so daily stock operations stay fast.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
              <span className="inline-block text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md mb-3">
                Django REST Framework
              </span>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">Core Engine & Safety Rules</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Manages PostgreSQL records, multi-shelf math, non-blocking async HTTP calls via httpx, Swagger/Redoc docs, and blocks negative margins or expired sales.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
              <span className="inline-block text-[11px] font-semibold text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-md mb-3">
                FastAPI + Scikit-Learn
              </span>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">AI & Weather Inference</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Fetches OpenWeatherMap forecasts in the background and runs trained RandomForestRegressor models inside worker threads without slowing down the main API.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
              <span className="inline-block text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md mb-3">
                React + Tailwind CSS
              </span>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">Role-Based Workspace UI</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Adapts navigation links, dropdowns, and live alert badges dynamically for each user role while keeping auth and recovery flows smooth.
              </p>
            </div>
          </div>
        </section>

        {/* Role Permissions Breakdown */}
        <section id="roles" className="max-w-6xl mx-auto px-6 py-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Strict Role-Based Access Control</h2>
            <p className="text-sm text-gray-600 mt-1">
              Each account only sees and controls the tools permitted for their role level.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
              <span className="inline-block text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md mb-3">
                Manager / Admin
              </span>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">Full System Control</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Access Order Predictions, Spoilage Check, Task Scheduler, Products, Shelves, Sales, and all system notifications.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
              <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mb-3">
                Worker
              </span>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">Floor & Stock Operations</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Manage Products, Shelves, Sales, and view stock notifications while higher-level forecast and scheduler controls stay hidden.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
              <span className="inline-block text-[11px] font-semibold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md mb-3">
                Standard User
              </span>
              <h3 className="text-sm font-bold text-gray-900 mb-1.5">Dashboard & Profile</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                View the main dashboard overview and manage personal account details.
              </p>
            </div>
          </div>

          {/* Grounded Bottom Gate Card */}
          <div className="mt-14 bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                Ready to open your workspace?
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Sign in with your account or register to start managing shelves and forecasts.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/login"
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-gray-200 py-5 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>SmartSense Inventory System</span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}

// selesaikan semua push, non-slopkan semua design
// merge to main
// pikirin cara update readme yg skrg


// # use state instead of refetch api in some cases
// # fix architectural whole 
// # yg paling penting CALMLY pelajari cara kerja alur sistem backend anjg (kyk theo di IG)
