"use client";

import { useState } from "react";
import { toast } from "sonner";

// ── Mock user data — replace with fetch("/api/user/profile") ──────────────
const mockUser = {
  name: "Jean Mamy",
  email: "jean.mamy@gmail.com",
  avatar: "JP",
  peakStudyStart: "19:00",
  peakStudyEnd:   "21:00",
  timezone: "Asia/Jakarta",
  weeklyGoalHours: 20,
  subjects: ["Math", "English", "Physics", "Computer Science"],
};

const TIMEZONES = [
  "Asia/Jakarta", "Asia/Singapore", "Asia/Tokyo",
  "America/New_York", "America/Los_Angeles", "Europe/London", "UTC",
];

const SUBJECT_OPTIONS = [
  "Math", "English", "Physics", "Chemistry", "Biology",
  "Computer Science", "History", "Economics", "Art", "Music",
];

const SUBJECT_COLORS: Record<string, string> = {
  Math: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
  English: "bg-violet-50 text-violet-600 ring-1 ring-violet-200",
  Physics: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  "Computer Science": "bg-teal-50 text-teal-600 ring-1 ring-teal-200",
  Chemistry: "bg-orange-50 text-orange-600 ring-1 ring-orange-200",
  Biology: "bg-green-50 text-green-600 ring-1 ring-green-200",
  History: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
  Economics: "bg-cyan-50 text-cyan-600 ring-1 ring-cyan-200",
  Art: "bg-pink-50 text-pink-600 ring-1 ring-pink-200",
  Music: "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200",
};

type Tab = "profile" | "study" | "notifications" | "account";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "profile",       label: "Profile",        icon: "👤" },
  { id: "account",       label: "Account",        icon: "⚙️"  },
];

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        value ? "bg-teal-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block w-5 h-5 mt-0.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
          value ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function SectionCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 text-base">{title}</h3>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

const inputCls = "h-11 w-full border border-gray-200 rounded-2xl px-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all";
const selectCls = "h-11 w-full border border-gray-200 rounded-2xl px-4 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all appearance-none";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Profile state — source: User table
  const [name,     setName]     = useState(mockUser.name);
  const [email,    setEmail]    = useState(mockUser.email);
  const [timezone, setTimezone] = useState(mockUser.timezone);



  // Notifications
  const [notifDeadline,   setNotifDeadline]   = useState(true);
  const [notifSession,    setNotifSession]    = useState(true);
  const [notifAI,         setNotifAI]         = useState(true);
  const [notifStreak,     setNotifStreak]     = useState(false);
  const [notifEmail,      setNotifEmail]      = useState(false);
  const [deadlineHours,   setDeadlineHours]   = useState("24");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput,       setDeleteInput]       = useState("");



  const handleSaveProfile = () => {
    // PUT /api/user/profile { name, email, timezone }
    toast.success("Profile updated successfully");
  };

  const handleSaveStudy = () => {
    // PUT /api/user/study-prefs { peakStart, peakEnd, weeklyGoal, subjects, pomodoroWork, pomodoroBreak }
    toast.success("Study preferences saved");
  };

  const handleSaveNotifications = () => {
    // PUT /api/user/notifications { notifDeadline, notifSession, notifAI, notifStreak, notifEmail, deadlineHours }
    toast.success("Notification settings saved");
  };

  const handleChangePassword = () => {
    // POST /api/auth/send-reset-email
    toast.success("Password reset email sent — check your inbox 📬");
  };

  const handleDeleteAccount = () => {
    if (deleteInput !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }
    // DELETE /api/user
    toast.error("Account deletion requested");
    setShowDeleteConfirm(false);
    setDeleteInput("");
  };

  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-7">

        {/* ── Header ── */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-400 mt-1.5 text-sm">Manage your profile, study preferences, and account</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">

          {/* ── Sidebar tabs ── */}
          <div className="w-full lg:w-56 flex-shrink-0">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-2 flex flex-row lg:flex-col gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all text-left w-full ${
                    activeTab === tab.id
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                  }`}
                >
                  <span className="text-base flex-shrink-0">{tab.icon}</span>
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Tab content ── */}
          <div className="flex-1 flex flex-col gap-5 min-w-0">

            {/* ─── PROFILE TAB ─── */}
            {activeTab === "profile" && (
              <>
                <SectionCard title="Your Profile" sub="User · name, email, timezone">

                  {/* Avatar */}
                  <div className="flex items-center gap-5 mb-7 pb-7 border-b border-gray-100">
                    <div className="w-20 h-20 bg-gray-900 rounded-3xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-2xl font-bold">{initials}</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{name}</p>
                      <p className="text-gray-400 text-sm mt-0.5">{email}</p>
                      <p className="text-xs text-teal-600 font-medium mt-2 bg-teal-50 px-2.5 py-1 rounded-lg inline-block">
                        Free plan
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    <Field label="Full Name">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Email Address" hint="Used for login and notifications">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputCls}
                      />
                    </Field>

                    <Field label="Timezone" hint="Used to schedule study sessions at the right local time">
                      <div className="relative">
                        <select
                          value={timezone}
                          onChange={(e) => setTimezone(e.target.value)}
                          className={selectCls}
                        >
                          {TIMEZONES.map((tz) => (
                            <option key={tz} value={tz}>{tz}</option>
                          ))}
                        </select>
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
                      </div>
                    </Field>
                  </div>

                  <div className="mt-7 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      className="bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-sm shadow-teal-200"
                    >
                      Save Profile
                    </button>
                  </div>
                </SectionCard>
              </>
            )}

            {/* ─── ACCOUNT TAB ─── */}
            {activeTab === "account" && (
              <>
                {/* Session info */}
                <SectionCard title="Account Info" sub="User · firebase_uid, created_at">
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Account created",  value: "January 15, 2025" },
                      { label: "Firebase UID",     value: "uid_••••••••••••" },
                      { label: "Auth provider",    value: "Email / Password" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                        <span className="text-sm text-gray-500">{row.label}</span>
                        <span className="text-sm font-semibold text-gray-800">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Change password */}
                <SectionCard title="Password" sub="Sends a reset link to your email via Firebase">
                  <p className="text-sm text-gray-500 mb-5">
                    For security, we send a password reset link to <span className="font-semibold text-gray-800">{email}</span> rather than changing it here directly.
                  </p>
                  <button
                    onClick={handleChangePassword}
                    className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 active:scale-95 text-white px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                  >
                    <span>🔑</span>
                    Send Password Reset Email
                  </button>
                </SectionCard>

                {/* Data export */}
                <SectionCard title="Export Your Data" sub="Download all your tasks, sessions, and analytics as JSON">
                  <p className="text-sm text-gray-500 mb-5">
                    Exports all data linked to your account from the Task, StudySession, and AISuggestion tables.
                  </p>
                  <button
                    onClick={() => toast.success("Export started — we'll email you a link shortly")}
                    className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 active:scale-95 text-gray-700 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                  >
                    <span>📦</span>
                    Export Data
                  </button>
                </SectionCard>

                {/* Danger zone */}
                <div className="bg-red-50 rounded-3xl border border-red-100 p-7">
                  <div className="mb-5">
                    <h3 className="font-bold text-red-700 text-base">Danger Zone</h3>
                    <p className="text-xs text-red-400 mt-0.5">Irreversible actions — proceed with caution</p>
                  </div>

                  {!showDeleteConfirm ? (
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-red-700">Delete account</p>
                        <p className="text-xs text-red-400 mt-0.5">
                          Permanently deletes your account, all tasks, sessions, and AI suggestions. Cannot be undone.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex-shrink-0 bg-red-600 hover:bg-red-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      <p className="text-sm text-red-700 font-medium">
                        Type <span className="font-bold bg-red-100 px-1.5 py-0.5 rounded-lg">DELETE</span> to confirm account deletion:
                      </p>
                      <input
                        type="text"
                        value={deleteInput}
                        onChange={(e) => setDeleteInput(e.target.value)}
                        placeholder="Type DELETE"
                        className="h-11 w-full border border-red-200 rounded-2xl px-4 text-sm text-red-900 placeholder:text-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent bg-white"
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => { setShowDeleteConfirm(false); setDeleteInput(""); }}
                          className="flex-1 border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteInput !== "DELETE"}
                          className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 text-white px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}