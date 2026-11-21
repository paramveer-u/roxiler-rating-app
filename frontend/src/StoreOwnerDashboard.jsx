

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Store, Star, Users, MapPin, Mail, LogOut,
  RefreshCw, ShieldCheck, LockKeyhole, X,
  Eye, EyeOff
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function StoreOwnerDashboard({ user, onLogout }) {
  const [stores, setStores] = useState([]);
  const [totalStores, setTotalStores] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Change password states
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

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("roxilerToken");

      const response = await axios.get(
        `${API_URL}/store-owner/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = response.data;
      const storeList = Array.isArray(data.stores) ? data.stores : [];

      setStores(storeList);
      setTotalStores(data.totalStores ?? storeList.length);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load store information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalRatings = stores.reduce(
    (sum, store) => sum + (store.ratings?.length || 0),
    0
  );

  const averageRating =
    totalRatings > 0
      ? stores.reduce((sum, store) => {
          const ratings = store.ratings || [];
          return sum + ratings.reduce(
            (ratingSum, item) => ratingSum + Number(item.rating || 0),
            0
          );
        }, 0) / totalRatings
      : 0;

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();

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
      setPasswordError("New password must contain at least one uppercase letter.");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>_\-+=]/.test(newPassword)) {
      setPasswordError("New password must contain at least one special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from the current password.");
      return;
    }

    try {
      setPasswordLoading(true);

      const token = localStorage.getItem("roxilerToken");

      const response = await axios.put(
        `${API_URL}/auth/change-password`,
        {
          currentPassword,
          newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

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
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>r.</div>
          <span>roxiler<span style={{ color: "#d97757" }}>.</span></span>
        </div>

        <div style={styles.headerRight}>
          <span style={styles.ownerBadge}>STORE OWNER</span>

          <button
            onClick={() => {
              setPasswordMessage("");
              setPasswordError("");
              setShowPasswordModal(true);
            }}
            style={styles.passwordButton}
          >
            <LockKeyhole size={15} /> Change Password
          </button>

          <button onClick={onLogout} style={styles.logout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div>
            <span style={styles.eyebrow}>BUSINESS WORKSPACE</span>
            <h1>
              Welcome back,<br />
              <em>{user?.name || "Store Owner"}</em>
            </h1>
            <p>Track your store performance and customer experiences.</p>
          </div>

          <div style={styles.heroIcon}>
            <Store size={58} strokeWidth={1.2} />
          </div>
        </section>

        {error && (
          <div style={styles.error}>
            {error}
            <button onClick={loadDashboard} style={styles.retry}>
              Try again
            </button>
          </div>
        )}

        <div style={styles.sectionHeading}>
          <div>
            <span style={styles.eyebrow}>YOUR BUSINESS</span>
            <h2>Performance overview</h2>
          </div>

          <button onClick={loadDashboard} style={styles.refresh}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        <section style={styles.stats}>
          <Stat
            icon={<Store size={20} />}
            label="My stores"
            value={totalStores}
            note="Registered locations"
          />

          <Stat
            icon={<Star size={20} />}
            label="Average rating"
            value={averageRating.toFixed(1)}
            note="Across all your stores"
          />

          <Stat
            icon={<Users size={20} />}
            label="Customer ratings"
            value={totalRatings}
            note="Ratings received"
          />
        </section>

        <div style={styles.storeHeading}>
          <div>
            <span style={styles.eyebrow}>STORE PORTFOLIO</span>
            <h2>Your stores</h2>
          </div>

          <span style={styles.storeCount}>
            {stores.length} {stores.length === 1 ? "STORE" : "STORES"}
          </span>
        </div>

        {loading ? (
          <div style={styles.loading}>
            Loading your business information...
          </div>
        ) : stores.length === 0 ? (
          <div style={styles.empty}>
            <Store size={35} />
            <h3>No stores assigned yet</h3>
            <p>
              Contact your administrator to have a store assigned to your account.
            </p>
          </div>
        ) : (
          <div style={styles.storeList}>
            {stores.map((store, index) => {
              const ratings = store.ratings || [];

              const average =
                ratings.length > 0
                  ? ratings.reduce(
                      (sum, item) => sum + Number(item.rating || 0), 0
                    ) / ratings.length
                  : 0;

              return (
                <article
                  key={store.store_id || store.storeId || index}
                  style={styles.storeCard}
                >
                  <div style={styles.storeTop}>
                    <div style={styles.storeIcon}>
                      <Store size={24} />
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3>{store.name}</h3>

                      <div style={styles.storeEmail}>
                        <Mail size={14} /> {store.email}
                      </div>
                    </div>

                    <div style={styles.ratingBox}>
                      <Star size={17} fill="#d97757" color="#d97757" />
                      <strong>{average.toFixed(1)}</strong>
                      <span>Average rating</span>
                    </div>
                  </div>

                  <div style={styles.address}>
                    <MapPin size={16} /> {store.address}
                  </div>

                  <div style={styles.feedbackHeading}>
                    <div>
                      <span style={styles.eyebrow}>CUSTOMER FEEDBACK</span>
                      <h4>People who rated your store</h4>
                    </div>

                    <span style={styles.feedbackCount}>
                      {ratings.length} ratings
                    </span>
                  </div>

                  {ratings.length === 0 ? (
                    <div style={styles.noRatings}>
                      No customer ratings received yet.
                    </div>
                  ) : (
                    <div style={styles.ratingList}>
                      {ratings.map((item, ratingIndex) => (
                        <div
                          key={item.user_id || item.userId || ratingIndex}
                          style={styles.ratingRow}
                        >
                          <div style={styles.customerAvatar}>
                            {item.name?.charAt(0)?.toUpperCase() || "C"}
                          </div>

                          <div style={styles.customerInfo}>
                            <strong>{item.name || "Customer"}</strong>
                            <span>{item.email || "Email unavailable"}</span>
                          </div>

                          <div style={styles.customerRating}>
                            <Star size={15} fill="#d97757" color="#d97757" />
                            <strong>{item.rating}/5</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <footer style={styles.footer}>
          <span><ShieldCheck size={15} /> Secure owner workspace</span>
          <span>ROXILER MARKETPLACE · 2026</span>
        </footer>
      </main>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.eyebrow}>ACCOUNT SECURITY</span>
                <h2>Change password</h2>
                <p>Update your store owner account password.</p>
              </div>

              <button
                onClick={closePasswordModal}
                style={styles.closeButton}
                disabled={passwordLoading}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleChangePassword}>
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

              <div style={styles.passwordHint}>
                Password must be 8–16 characters and contain at least
                one uppercase letter and one special character.
              </div>

              {passwordError && (
                <div style={styles.passwordError}>{passwordError}</div>
              )}

              {passwordMessage && (
                <div style={styles.passwordSuccess}>{passwordMessage}</div>
              )}

              <div style={styles.modalActions}>
                <button
                  type="button"
                  onClick={closePasswordModal}
                  style={styles.cancelButton}
                  disabled={passwordLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={passwordLoading}
                >
                  {passwordLoading ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordField({ label, value, onChange, show, toggle }) {
  return (
    <div style={styles.passwordField}>
      <label>{label}</label>

      <div style={styles.passwordInputWrapper}>
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${label.toLowerCase()}`}
          autoComplete="off"
        />

        <button type="button" onClick={toggle} style={styles.eyeButton}>
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, note }) {
  return (
    <article style={styles.statCard}>
      <div style={styles.statTop}>
        <span>{label}</span>
        <div style={styles.statIcon}>{icon}</div>
      </div>

      <strong style={styles.statValue}>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f2eb",
    color: "#252b29",
    fontFamily: "'DM Sans', Arial, sans-serif"
  },
  header: {
    minHeight: 76,
    background: "#fffdf8",
    borderBottom: "1px solid #e9e5dc",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 6%",
    flexWrap: "wrap",
    gap: 12
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    fontSize: 25,
    fontWeight: 700,
    letterSpacing: "-1px"
  },
  brandIcon: {
    width: 37,
    height: 37,
    borderRadius: 10,
    background: "#183c35",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontSize: 24,
    fontFamily: "Georgia, serif"
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap"
  },
  ownerBadge: {
    color: "#183c35",
    background: "#e7eee8",
    padding: "7px 11px",
    borderRadius: 20,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1
  },
  passwordButton: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    border: "1px solid #dedbd2",
    borderRadius: 7,
    padding: "10px 13px",
    background: "white",
    color: "#35443b",
    fontSize: 12,
    cursor: "pointer"
  },
  logout: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #dedbd2",
    borderRadius: 7,
    padding: "10px 13px",
    background: "white",
    color: "#35443b",
    fontSize: 12,
    cursor: "pointer"
  },
  main: {
    maxWidth: 1200,
    margin: "auto",
    padding: "34px 5%"
  },
  hero: {
    background: "#183c35",
    color: "#f3efe5",
    borderRadius: 14,
    padding: "34px 38px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 210,
    gap: 20
  },
  eyebrow: {
    display: "block",
    color: "#d97757",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2
  },
  heroIcon: {
    color: "#e3a187",
    opacity: .85,
    padding: 15
  },
  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    margin: "36px 0 17px"
  },
  storeHeading: {
    display: "flex",
    alignItems: "end",
    justifyContent: "space-between",
    margin: "37px 0 17px"
  },
  storeCount: {
    fontSize: 10,
    letterSpacing: 1,
    color: "#737c73",
    fontWeight: 700
  },
  refresh: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    border: "1px solid #dedbd2",
    background: "#fffdf8",
    padding: "9px 12px",
    borderRadius: 7,
    color: "#4b5c50",
    fontSize: 11,
    cursor: "pointer"
  },
  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
    gap: 15
  },
  statCard: {
    background: "#fffdf8",
    border: "1px solid #e9e5dc",
    borderRadius: 11,
    padding: 20
  },
  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#737c73",
    fontSize: 11
  },
  statIcon: {
    width: 38,
    height: 38,
    display: "grid",
    placeItems: "center",
    borderRadius: 9,
    background: "#e8eee8",
    color: "#183c35"
  },
  statValue: {
    display: "block",
    fontSize: 32,
    marginTop: 14,
    letterSpacing: -1
  },
  storeList: {
    display: "grid",
    gap: 19
  },
  storeCard: {
    background: "#fffdf8",
    border: "1px solid #e9e5dc",
    borderRadius: 12,
    padding: 23
  },
  storeTop: {
    display: "flex",
    alignItems: "center",
    gap: 14
  },
  storeIcon: {
    width: 48,
    height: 48,
    display: "grid",
    placeItems: "center",
    borderRadius: 11,
    background: "#e8eee8",
    color: "#183c35"
  },
  storeEmail: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#7b817a",
    fontSize: 11,
    marginTop: 6
  },
  ratingBox: {
    display: "grid",
    justifyItems: "center",
    gap: 3,
    minWidth: 95
  },
  address: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    borderTop: "1px solid #e9e5dc",
    padding: "15px 0",
    marginTop: 18,
    color: "#71786f",
    fontSize: 11
  },
  feedbackHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "end",
    borderTop: "1px solid #e9e5dc",
    paddingTop: 19,
    marginTop: 4
  },
  feedbackCount: {
    background: "#f4e9e2",
    color: "#a85a3d",
    borderRadius: 20,
    padding: "6px 10px",
    fontSize: 10
  },
  ratingList: {
    marginTop: 10
  },
  ratingRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "13px 0",
    borderBottom: "1px solid #efede7"
  },
  customerAvatar: {
    width: 35,
    height: 35,
    borderRadius: "50%",
    background: "#e8eee8",
    color: "#183c35",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    fontSize: 13
  },
  customerInfo: {
    flex: 1,
    display: "grid",
    gap: 4,
    minWidth: 0
  },
  customerRating: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    color: "#b86c40",
    fontSize: 12
  },
  noRatings: {
    background: "#f7f5ef",
    borderRadius: 8,
    padding: 20,
    marginTop: 12,
    color: "#7d827b",
    fontSize: 12
  },
  empty: {
    background: "#fffdf8",
    border: "1px solid #e9e5dc",
    borderRadius: 12,
    padding: 45,
    textAlign: "center",
    color: "#7d827b"
  },
  loading: {
    padding: 35,
    textAlign: "center",
    color: "#7d827b",
    background: "#fffdf8",
    borderRadius: 10
  },
  error: {
    marginTop: 18,
    padding: 14,
    background: "#fbe9e5",
    color: "#a33f2b",
    borderRadius: 8,
    fontSize: 12
  },
  retry: {
    marginLeft: 12,
    padding: "6px 10px",
    border: 0,
    borderRadius: 5,
    cursor: "pointer"
  },
  footer: {
    borderTop: "1px solid #e3ded3",
    marginTop: 38,
    paddingTop: 19,
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 10,
    color: "#82877e",
    fontSize: 9,
    letterSpacing: .7
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 30, 25, 0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    zIndex: 1000
  },
  modal: {
    width: "100%",
    maxWidth: 460,
    background: "#fffdf8",
    borderRadius: 14,
    padding: 26,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 15,
    marginBottom: 23
  },
  closeButton: {
    border: 0,
    background: "#f0eee8",
    borderRadius: 7,
    padding: 8,
    cursor: "pointer",
    color: "#35443b"
  },
  passwordField: {
    display: "grid",
    gap: 8,
    marginBottom: 17
  },
  passwordInputWrapper: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #dedbd2",
    borderRadius: 7,
    background: "white",
    paddingRight: 10
  },
  passwordHint: {
    background: "#f2f0e9",
    color: "#6f766e",
    padding: 12,
    borderRadius: 7,
    fontSize: 11,
    lineHeight: 1.6,
    marginTop: 5
  },
  eyeButton: {
    border: 0,
    background: "transparent",
    color: "#737c73",
    cursor: "pointer",
    display: "grid",
    placeItems: "center"
  },
  passwordError: {
    background: "#fbe9e5",
    color: "#a33f2b",
    padding: 11,
    borderRadius: 7,
    fontSize: 12,
    marginTop: 12
  },
  passwordSuccess: {
    background: "#e7eee8",
    color: "#183c35",
    padding: 11,
    borderRadius: 7,
    fontSize: 12,
    marginTop: 12
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 22
  },
  cancelButton: {
    border: "1px solid #dedbd2",
    background: "white",
    color: "#35443b",
    padding: "11px 15px",
    borderRadius: 7,
    cursor: "pointer"
  },
  submitButton: {
    border: 0,
    background: "#183c35",
    color: "white",
    padding: "11px 17px",
    borderRadius: 7,
    cursor: "pointer",
    fontWeight: 600
  }
};
