
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Activity, ArrowDownUp, ArrowRight, Building2,
  LayoutDashboard, LogOut, Plus, Search, ShieldCheck,
  Star, Store, Users, X, LockKeyhole, Eye, EyeOff
} from "lucide-react";

import StoreOwnerDashboard from "./StoreOwnerDashboard";
import UserDashboard from "./UserDashboard";
import AdminUserDetails from "./AdminUserDetails";
import "./App.css";

const API_URL = "http://localhost:5000/api";

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("roxilerToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function sortRows(rows, key, direction) {
  return [...rows].sort((a, b) => {
    let valueA;
    let valueB;

    if (key === "averageRating") {
      valueA = Number(a.averageRating ?? a.average_rating ?? 0);
      valueB = Number(b.averageRating ?? b.average_rating ?? 0);

      return direction === "asc"
        ? valueA - valueB
        : valueB - valueA;
    }

    valueA = String(a[key] ?? "").toLowerCase();
    valueB = String(b[key] ?? "").toLowerCase();

    const result = valueA.localeCompare(valueB, undefined, {
      numeric: true,
      sensitivity: "base"
    });

    return direction === "asc" ? result : -result;
  });
}

function SortHeading({ label, sortKey, sortConfig, onSort }) {
  const active = sortConfig.key === sortKey;

  return (
    <th>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        style={{
          border: "none",
          background: "transparent",
          color: "inherit",
          font: "inherit",
          fontWeight: 700,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          padding: 0,
          whiteSpace: "nowrap"
        }}
      >
        {label}
        <span style={{
          color: active ? "#d97757" : "#999",
          fontSize: 12
        }}>
          {active
            ? sortConfig.direction === "asc" ? "▲" : "▼"
            : "↕"}
        </span>
      </button>
    </th>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("roxilerUser")) || null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [selectedUserId, setSelectedUserId] = useState(null);

  const [dashboard, setDashboard] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });

  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [showUserForm, setShowUserForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);

  // Admin change password states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [userSort, setUserSort] = useState({
    key: "name",
    direction: "asc"
  });

  const [storeSort, setStoreSort] = useState({
    key: "name",
    direction: "asc"
  });

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    address: "",
    role: "USER"
  });

  const [storeForm, setStoreForm] = useState({
    name: "",
    email: "",
    address: "",
    owner_id: ""
  });

  const logout = () => {
    localStorage.removeItem("roxilerToken");
    localStorage.removeItem("roxilerUser");
    setSelectedUserId(null);
    setUser(null);
  };

  const getArray = (data, key) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.[key])) return data[key];
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const loadDashboard = async () => {
    const response = await api.get("/admin/dashboard");
    const data = response.data;

    setDashboard({
      totalUsers: data.totalUsers ?? data.total_users ?? 0,
      totalStores: data.totalStores ?? data.total_stores ?? 0,
      totalRatings: data.totalRatings ?? data.total_ratings ?? 0
    });
  };

  const loadUsers = async () => {
    const response = await api.get("/admin/users");
    const list = getArray(response.data, "users");

    setUsers(list);
    setOwners(list.filter((item) => item.role === "STORE_OWNER"));
  };

  const loadStores = async () => {
    const response = await api.get("/admin/stores");
    setStores(getArray(response.data, "stores"));
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");

    try {
      await Promise.all([
        loadDashboard(),
        loadUsers(),
        loadStores()
      ]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Could not load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") {
      loadAll();
    }
  }, [user]);

  const handleUserSort = (key) => {
    setUserSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc"
          ? "desc"
          : "asc"
    }));
  };

  const handleStoreSort = (key) => {
    setStoreSort((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc"
          ? "desc"
          : "asc"
    }));
  };

  const submitUser = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/admin/users", userForm);
      setMessage("User account created successfully.");

      setUserForm({
        name: "",
        email: "",
        password: "",
        address: "",
        role: "USER"
      });

      setShowUserForm(false);
      await loadAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to create user."
      );
    }
  };

  const submitStore = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      await api.post("/admin/stores", {
        ...storeForm,
        owner_id: Number(storeForm.owner_id)
      });

      setMessage("Store created successfully.");

      setStoreForm({
        name: "",
        email: "",
        address: "",
        owner_id: ""
      });

      setShowStoreForm(false);
      await loadAll();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to create store."
      );
    }
  };

  // Admin change password
  const handleChangePassword = async (event) => {
    event.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    if (newPassword.length < 8 || newPassword.length > 16) {
      setPasswordError("New password must contain 8 to 16 characters.");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError(
        "New password must contain at least one uppercase letter."
      );
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setPasswordError(
        "New password must contain at least one special character."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError(
        "New password must be different from the current password."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      const response = await api.put("/auth/change-password", {
        currentPassword,
        newPassword
      });

      setPasswordMessage(
        response.data.message || "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordMessage("");
      }, 1800);

    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
        "Unable to change password. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const closePasswordModal = () => {
    if (passwordLoading) return;

    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordMessage("");
    setPasswordError("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const filteredUsers = users.filter((item) => {
    const term = search.toLowerCase();

    const matchesSearch =
      (item.name || "").toLowerCase().includes(term) ||
      (item.email || "").toLowerCase().includes(term) ||
      (item.address || "").toLowerCase().includes(term);

    return matchesSearch &&
      (!roleFilter || item.role === roleFilter);
  });

  const filteredStores = stores.filter((item) => {
    const term = search.toLowerCase();

    return (
      (item.name || "").toLowerCase().includes(term) ||
      (item.email || "").toLowerCase().includes(term) ||
      (item.address || "").toLowerCase().includes(term)
    );
  });

  const sortedUsers = sortRows(
    filteredUsers,
    userSort.key,
    userSort.direction
  );

  const sortedStores = sortRows(
    filteredStores,
    storeSort.key,
    storeSort.direction
  );

  if (user?.role === "STORE_OWNER") {
    return (
      <StoreOwnerDashboard
        user={user}
        onLogout={logout}
      />
    );
  }

  if (user?.role === "USER") {
    return (
      <UserDashboard
        user={user}
        onLogout={logout}
      />
    );
  }

  if (user && user.role !== "ADMIN") {
    return (
      <main className="access-screen">
        <div className="access-card">
          <ShieldCheck size={36} />
          <h1>Welcome, {user.name}</h1>
          <p>Your account role is not recognised.</p>
          <button className="button-primary" onClick={logout}>
            Sign out
          </button>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <LoginScreen
        onLogin={(loggedInUser) => setUser(loggedInUser)}
      />
    );
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-symbol">r.</span>
          <span>roxiler<span className="brand-period">.</span></span>
        </div>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="side-nav">
          <button
            className={activeTab === "overview" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setActiveTab("overview");
              setSelectedUserId(null);
              setSearch("");
            }}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>

          <button
            className={activeTab === "users" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setActiveTab("users");
              setSelectedUserId(null);
              setSearch("");
            }}
          >
            <Users size={18} />
            Users
          </button>

          <button
            className={activeTab === "stores" ? "nav-item active" : "nav-item"}
            onClick={() => {
              setActiveTab("stores");
              setSelectedUserId(null);
              setSearch("");
            }}
          >
            <Store size={18} />
            Stores
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="admin-profile">
            <div className="avatar">
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div className="profile-copy">
              <strong>{user.name}</strong>
              <span>Administrator</span>
            </div>
          </div>

          <button className="logout-button" onClick={logout}>
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <span className="eyebrow">
              ROXILER MARKETPLACE / ADMIN
            </span>
            <h1>
              {selectedUserId !== null
                ? "User details"
                : activeTab === "overview"
                ? "Overview"
                : activeTab === "users"
                ? "User directory"
                : "Store directory"}
            </h1>
          </div>

          <div className="topbar-right">
            <button
              type="button"
              className="button-quiet"
              onClick={() => {
                setPasswordMessage("");
                setPasswordError("");
                setShowPasswordModal(true);
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7
              }}
            >
              <LockKeyhole size={16} />
              Change Password
            </button>

            <span className="status-dot"></span>
            <span>System online</span>
            <div className="top-avatar">
              {user.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          </div>
        </header>

        <section className="content-area">
          {selectedUserId !== null ? (
            <AdminUserDetails
              userId={selectedUserId}
              onBack={() => setSelectedUserId(null)}
            />
          ) : (
            <>
              {error && <div className="alert alert-error">{error}</div>}
              {message && <div className="alert alert-success">{message}</div>}

              {activeTab === "overview" && (
                <>
                  <div className="welcome-strip">
                    <div>
                      <span className="eyebrow light">
                        ADMINISTRATOR WORKSPACE
                      </span>
                      <h2>
                        Good to see you, {user.name?.split(" ")[0]}.
                      </h2>
                      <p>
                        Here is what is happening across your marketplace.
                      </p>
                    </div>
                    <div className="welcome-art">
                      <Activity size={54} strokeWidth={1.2} />
                    </div>
                  </div>

                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">LIVE SNAPSHOT</span>
                      <h2>Platform at a glance</h2>
                    </div>
                    <button className="button-quiet" onClick={loadAll}>
                      Refresh data <ArrowDownUp size={15} />
                    </button>
                  </div>

                  <div className="stats-grid">
                    <StatCard
                      icon={<Users />}
                      label="Registered users"
                      value={dashboard.totalUsers}
                      note="All account roles"
                    />
                    <StatCard
                      icon={<Building2 />}
                      label="Listed stores"
                      value={dashboard.totalStores}
                      note="Marketplace locations"
                    />
                    <StatCard
                      icon={<Star />}
                      label="Ratings received"
                      value={dashboard.totalRatings}
                      note="Community feedback"
                    />
                  </div>

                  <div className="overview-bottom">
                    <div className="panel-card">
                      <div className="panel-title">
                        <div>
                          <span className="eyebrow">QUICK ACCESS</span>
                          <h3>Manage your platform</h3>
                        </div>
                      </div>

                      <button
                        className="quick-link"
                        onClick={() => {
                          setActiveTab("users");
                          setShowUserForm(true);
                        }}
                      >
                        <span className="quick-icon">
                          <Users size={19} />
                        </span>
                        <span>
                          <strong>Create a user</strong>
                          <small>Add an administrator, customer or store owner</small>
                        </span>
                        <ArrowRight size={18} />
                      </button>

                      <button
                        className="quick-link"
                        onClick={() => {
                          setActiveTab("stores");
                          setShowStoreForm(true);
                        }}
                      >
                        <span className="quick-icon peach">
                          <Store size={19} />
                        </span>
                        <span>
                          <strong>Register a store</strong>
                          <small>Add a store and assign its owner</small>
                        </span>
                        <ArrowRight size={18} />
                      </button>
                    </div>

                    <div className="panel-card platform-card">
                      <span className="eyebrow">PLATFORM STATUS</span>
                      <div className="platform-status">
                        <span className="status-dot"></span>
                        All systems operational
                      </div>
                      <p>
                        Your marketplace dashboard is connected to the backend service and database.
                      </p>
                      <div className="platform-foot">
                        <ShieldCheck size={17} />
                        Protected administrator access
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "users" && (
                <>
                  <div className="directory-intro">
                    <div>
                      <span className="eyebrow">ACCOUNT MANAGEMENT</span>
                      <p>Review and manage registered platform accounts.</p>
                    </div>
                    <button
                      className="button-primary"
                      onClick={() => setShowUserForm(true)}
                    >
                      <Plus size={17} /> Add user
                    </button>
                  </div>

                  <div className="filter-bar">
                    <div className="search-box">
                      <Search size={18} />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email or address..."
                      />
                    </div>

                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="">All roles</option>
                      <option value="ADMIN">Administrator</option>
                      <option value="USER">Normal user</option>
                      <option value="STORE_OWNER">Store owner</option>
                    </select>
                  </div>

                  <div className="table-card">
                    <div className="table-heading">
                      <div>
                        <h3>All users</h3>
                        <span>{filteredUsers.length} accounts found</span>
                      </div>
                    </div>

                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <SortHeading label="Name" sortKey="name" sortConfig={userSort} onSort={handleUserSort} />
                            <SortHeading label="Email" sortKey="email" sortConfig={userSort} onSort={handleUserSort} />
                            <SortHeading label="Address" sortKey="address" sortConfig={userSort} onSort={handleUserSort} />
                            <SortHeading label="Role" sortKey="role" sortConfig={userSort} onSort={handleUserSort} />
                          </tr>
                        </thead>

                        <tbody>
                          {sortedUsers.map((item) => (
                            <tr key={item.user_id || item.userId || item.email}>
                              <td>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedUserId(
                                      item.user_id ?? item.userId ?? item.id
                                    )
                                  }
                                  style={{
                                    border: "none",
                                    background: "transparent",
                                    color: "#183c35",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    padding: 0,
                                    textAlign: "left",
                                    font: "inherit",
                                    textDecoration: "underline",
                                    textUnderlineOffset: "3px"
                                  }}
                                >
                                  {item.name}
                                </button>
                              </td>
                              <td>{item.email}</td>
                              <td>{item.address || "—"}</td>
                              <td>
                                <span className={`role-pill ${item.role?.toLowerCase()}`}>
                                  {(item.role || "").replace("_", " ")}
                                </span>
                              </td>
                            </tr>
                          ))}

                          {sortedUsers.length === 0 && (
                            <tr>
                              <td colSpan="4" className="empty-cell">
                                No users match your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {activeTab === "stores" && (
                <>
                  <div className="directory-intro">
                    <div>
                      <span className="eyebrow">MARKETPLACE MANAGEMENT</span>
                      <p>Browse registered stores and their rating performance.</p>
                    </div>
                    <button
                      className="button-primary"
                      onClick={() => setShowStoreForm(true)}
                    >
                      <Plus size={17} /> Add store
                    </button>
                  </div>

                  <div className="filter-bar">
                    <div className="search-box">
                      <Search size={18} />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search store name, email or address..."
                      />
                    </div>
                  </div>

                  <div className="table-card">
                    <div className="table-heading">
                      <div>
                        <h3>All stores</h3>
                        <span>{filteredStores.length} stores found</span>
                      </div>
                    </div>

                    <div className="table-scroll">
                      <table>
                        <thead>
                          <tr>
                            <SortHeading label="Store name" sortKey="name" sortConfig={storeSort} onSort={handleStoreSort} />
                            <SortHeading label="Email" sortKey="email" sortConfig={storeSort} onSort={handleStoreSort} />
                            <SortHeading label="Address" sortKey="address" sortConfig={storeSort} onSort={handleStoreSort} />
                            <SortHeading label="Average rating" sortKey="averageRating" sortConfig={storeSort} onSort={handleStoreSort} />
                          </tr>
                        </thead>

                        <tbody>
                          {sortedStores.map((item) => (
                            <tr key={item.store_id || item.storeId || item.email}>
                              <td><strong>{item.name}</strong></td>
                              <td>{item.email}</td>
                              <td>{item.address}</td>
                              <td>
                                <span className="rating-value">
                                  <Star size={15} fill="currentColor" />
                                  {Number(
                                    item.averageRating ??
                                    item.average_rating ?? 0
                                  ).toFixed(1)}
                                </span>
                              </td>
                            </tr>
                          ))}

                          {sortedStores.length === 0 && (
                            <tr>
                              <td colSpan="4" className="empty-cell">
                                No stores match your search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </section>

        {loading && (
          <div className="loading-note">
            Loading platform data...
          </div>
        )}
      </main>

      {showUserForm && (
        <Modal
          title="Create a user account"
          onClose={() => setShowUserForm(false)}
        >
          <form className="modal-form" onSubmit={submitUser}>
            <Field label="Full name">
              <input
                required
                minLength="20"
                maxLength="60"
                value={userForm.name}
                onChange={(e) =>
                  setUserForm({ ...userForm, name: e.target.value })
                }
                placeholder="Enter full name (20–60 characters)"
              />
            </Field>

            <Field label="Email address">
              <input
                required
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
                placeholder="name@example.com"
              />
            </Field>

            <Field label="Temporary password">
              <input
                required
                type="password"
                minLength="8"
                maxLength="16"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({ ...userForm, password: e.target.value })
                }
                placeholder="8–16 characters, uppercase + special character"
              />
            </Field>

            <Field label="Address">
              <textarea
                maxLength="400"
                value={userForm.address}
                onChange={(e) =>
                  setUserForm({ ...userForm, address: e.target.value })
                }
                placeholder="Enter address (up to 400 characters)"
              />
            </Field>

            <Field label="Account role">
              <select
                value={userForm.role}
                onChange={(e) =>
                  setUserForm({ ...userForm, role: e.target.value })
                }
              >
                <option value="USER">Normal user</option>
                <option value="ADMIN">Administrator</option>
                <option value="STORE_OWNER">Store owner</option>
              </select>
            </Field>

            <div className="modal-actions">
              <button
                type="button"
                className="button-quiet"
                onClick={() => setShowUserForm(false)}
              >
                Cancel
              </button>
              <button className="button-primary" type="submit">
                Create account <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showStoreForm && (
        <Modal
          title="Register a new store"
          onClose={() => setShowStoreForm(false)}
        >
          <form className="modal-form" onSubmit={submitStore}>
            <Field label="Store name">
              <input
                required
                value={storeForm.name}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, name: e.target.value })
                }
                placeholder="Enter store name"
              />
            </Field>

            <Field label="Store email">
              <input
                required
                type="email"
                value={storeForm.email}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, email: e.target.value })
                }
                placeholder="store@example.com"
              />
            </Field>

            <Field label="Store address">
              <textarea
                required
                maxLength="400"
                value={storeForm.address}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, address: e.target.value })
                }
                placeholder="Enter complete store address"
              />
            </Field>

            <Field label="Assign store owner">
              <select
                required
                value={storeForm.owner_id}
                onChange={(e) =>
                  setStoreForm({ ...storeForm, owner_id: e.target.value })
                }
              >
                <option value="">Choose a store owner</option>
                {owners.map((owner) => (
                  <option
                    key={owner.user_id || owner.userId}
                    value={owner.user_id || owner.userId}
                  >
                    {owner.name} — {owner.email}
                  </option>
                ))}
              </select>
            </Field>

            <div className="modal-actions">
              <button
                type="button"
                className="button-quiet"
                onClick={() => setShowStoreForm(false)}
              >
                Cancel
              </button>
              <button className="button-primary" type="submit">
                Create store <ArrowRight size={16} />
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Admin Change Password Modal */}
      {showPasswordModal && (
        <Modal
          title="Change administrator password"
          onClose={closePasswordModal}
        >
          <form className="modal-form" onSubmit={handleChangePassword}>
            <PasswordField
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
              show={showCurrentPassword}
              toggle={() => setShowCurrentPassword(!showCurrentPassword)}
            />

            <PasswordField
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              show={showNewPassword}
              toggle={() => setShowNewPassword(!showNewPassword)}
            />

            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirmPassword}
              toggle={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            <div style={{
              background: "#f2f0e9",
              color: "#6f766e",
              padding: 12,
              borderRadius: 7,
              fontSize: 11,
              lineHeight: 1.6
            }}>
              Password must contain 8–16 characters, at least one uppercase
              letter and one special character.
            </div>

            {passwordError && (
              <div className="alert alert-error">
                {passwordError}
              </div>
            )}

            {passwordMessage && (
              <div className="alert alert-success">
                {passwordMessage}
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="button-quiet"
                onClick={closePasswordModal}
                disabled={passwordLoading}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="button-primary"
                disabled={passwordLoading}
              >
                {passwordLoading ? "Updating..." : "Update password"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// LOGIN AND REGISTRATION
function LoginScreen({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const switchMode = () => {
    setIsRegistering((current) => !current);
    setError("");
    setSuccess("");
    setPassword("");
  };

  const login = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email, password }
      );

      localStorage.setItem("roxilerToken", response.data.token);
      localStorage.setItem(
        "roxilerUser",
        JSON.stringify(response.data.user)
      );

      onLogin(response.data.user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const register = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (name.trim().length < 20 || name.trim().length > 60) {
      setError("Name must contain between 20 and 60 characters.");
      return;
    }

    if (address.length > 400) {
      setError("Address cannot exceed 400 characters.");
      return;
    }

    if (password.length < 8 || password.length > 16) {
      setError("Password must contain 8 to 16 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setError("Password must contain at least one special character.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/auth/register`,
        {
          name: name.trim(),
          email: email.trim(),
          address: address.trim(),
          password
        }
      );

      setSuccess("Account created successfully. You can now sign in.");

      setIsRegistering(false);
      setName("");
      setAddress("");
      setPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Registration failed. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-screen">
      <form
        className="login-card"
        onSubmit={isRegistering ? register : login}
      >
        <div className="brand-symbol login-symbol">r.</div>

        <span className="eyebrow">ROXILER MARKETPLACE</span>

        <h1>
          {isRegistering
            ? <>Create <em>account.</em></>
            : <>Welcome <em>back.</em></>}
        </h1>

        <p>
          {isRegistering
            ? "Join the marketplace and discover registered stores."
            : "Sign in to your account workspace."}
        </p>

        {isRegistering && (
          <>
            <Field label="Full name">
              <input
                required
                type="text"
                minLength="20"
                maxLength="60"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </Field>

            <Field label="Address">
              <textarea
                required
                maxLength="400"
                rows="3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter your complete address"
              />
            </Field>
          </>
        )}

        <Field label="Email address">
          <input
            required
            type="email"
            maxLength="255"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Password">
          <input
            required
            type="password"
            minLength="8"
            maxLength="16"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              isRegistering
                ? "8–16 characters, uppercase + special character"
                : "Enter your password"
            }
          />
        </Field>

        {isRegistering && (
          <p style={{
            fontSize: 11,
            color: "#68716b",
            lineHeight: 1.6,
            marginTop: -5
          }}>
            Password requirements: 8–16 characters, at least one
            uppercase letter and one special character.
          </p>
        )}

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        <button
          className="button-primary login-submit"
          type="submit"
          disabled={loading}
        >
          {loading
            ? isRegistering ? "Creating account..." : "Signing in..."
            : isRegistering ? "Create account" : "Sign in"}

          <ArrowRight size={17} />
        </button>

        <div style={{
          textAlign: "center",
          marginTop: 20,
          fontSize: 13,
          color: "#68716b"
        }}>
          {isRegistering
            ? "Already have an account?"
            : "New to Roxiler?"}

          <button
            type="button"
            onClick={switchMode}
            style={{
              border: "none",
              background: "transparent",
              color: "#183c35",
              fontWeight: 700,
              cursor: "pointer",
              marginLeft: 6,
              textDecoration: "underline"
            }}
          >
            {isRegistering ? "Sign in" : "Create account"}
          </button>
        </div>
      </form>
    </main>
  );
}

function PasswordField({ label, value, onChange, show, toggle }) {
  return (
    <Field label={label}>
      <div style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid #dedbd2",
        borderRadius: 7,
        background: "white",
        paddingRight: 10
      }}>
        <input
          required
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          autoComplete="off"
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            minWidth: 0
          }}
        />

        <button
          type="button"
          onClick={toggle}
          aria-label={show ? "Hide password" : "Show password"}
          style={{
            border: "none",
            background: "transparent",
            color: "#737c73",
            cursor: "pointer",
            display: "grid",
            placeItems: "center"
          }}
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </Field>
  );
}

function StatCard({ icon, label, value, note }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function Field({ label, children }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section className="modal-card">
        <div className="modal-heading">
          <div>
            <span className="eyebrow">MARKETPLACE ADMIN</span>
            <h2>{title}</h2>
          </div>
          <button
            className="close-button"
            onClick={onClose}
            type="button"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export default App;
