
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Store, Star, Search, MapPin, LogOut, RefreshCw,
  UserRound, Send, CheckCircle, AlertCircle,
  LockKeyhole, X, Eye, EyeOff
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function UserDashboard({ user, onLogout }) {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState("");
  const [ratings, setRatings] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingStore, setSavingStore] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Change password states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const loadStores = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("roxilerToken");

      const response = await axios.get(
        `${API_URL}/user/stores`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.stores)
        ? data.stores
        : Array.isArray(data.data)
        ? data.data
        : [];

      setStores(list);

      const initialRatings = {};

      list.forEach((store) => {
        const id = store.store_id ?? store.storeId;
        const ownRating = store.myRating ?? store.my_rating;

        if (id != null) {
          initialRatings[id] = ownRating ? String(ownRating) : "";
        }
      });

      setRatings(initialRatings);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load stores. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const submitRating = async (storeId) => {
    const rating = Number(ratings[storeId]);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars.");
      return;
    }

    setSavingStore(storeId);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("roxilerToken");

      await axios.post(
        `${API_URL}/user/ratings/${storeId}`,
        { rating },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage("Your rating has been saved successfully.");
      await loadStores();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save your rating."
      );
    } finally {
      setSavingStore(null);
    }
  };

  // Open password form
  const openPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordMessage("");
    setShowPasswords(false);
    setShowPasswordModal(true);
  };

  // Change password
  const changePassword = async (event) => {
    event.preventDefault();

    setPasswordError("");
    setPasswordMessage("");

    if (newPassword.length < 8 || newPassword.length > 16) {
      setPasswordError("New password must contain 8 to 16 characters.");
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      setPasswordError("New password must contain at least one uppercase letter.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(newPassword)) {
      setPasswordError("New password must contain at least one special character.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("New password must be different from your current password.");
      return;
    }

    setPasswordLoading(true);

    try {
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
        response.data?.message || "Password changed successfully."
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(
        err.response?.data?.message ||
        "Unable to change password. Please check your current password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const filteredStores = stores.filter((store) => {
    const term = search.toLowerCase();

    return (
      (store.name || "").toLowerCase().includes(term) ||
      (store.address || "").toLowerCase().includes(term)
    );
  });

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <div style={styles.brandIcon}>r.</div>
          <span>
            roxiler<span style={{ color: "#d97757" }}>.</span>
          </span>
        </div>

        <div style={styles.headerRight}>
          <span style={styles.userBadge}>CUSTOMER</span>

          <button
            style={styles.passwordHeaderButton}
            onClick={openPasswordModal}
          >
            <LockKeyhole size={15} />
            Change password
          </button>

          <button style={styles.logout} onClick={onLogout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.hero}>
          <div>
            <span style={styles.eyebrow}>YOUR DISCOVERY SPACE</span>
            <h1>
              Find a place.<br />
              Share your <em>experience.</em>
            </h1>
            <p>
              Welcome, {user?.name}. Discover stores and help others
              choose with honest ratings.
            </p>
          </div>

          <div style={styles.heroIcon}>
            <Star size={59} strokeWidth={1.2} />
          </div>
        </section>

        <section style={styles.discoveryHeading}>
          <div>
            <span style={styles.eyebrow}>EXPLORE THE MARKETPLACE</span>
            <h2>Discover stores</h2>
            <p>Find a store and share your experience.</p>
          </div>

          <button style={styles.refresh} onClick={loadStores}>
            <RefreshCw size={15} /> Refresh
          </button>
        </section>

        <div style={styles.searchBox}>
          <Search size={19} color="#82877e" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by store name or address..."
            style={styles.searchInput}
          />
        </div>

        {error && (
          <div style={styles.error}>
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        {message && (
          <div style={styles.success}>
            <CheckCircle size={17} />
            {message}
          </div>
        )}

        <div style={styles.resultsHeading}>
          <h3>Available stores</h3>
          <span>{filteredStores.length} stores found</span>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading stores...</div>
        ) : filteredStores.length === 0 ? (
          <div style={styles.emptyState}>
            <Store size={34} />
            <h3>No stores found</h3>
            <p>Try searching with a different name or address.</p>
          </div>
        ) : (
          <section style={styles.storeGrid}>
            {filteredStores.map((store) => {
              const id = store.store_id ?? store.storeId;

              const average = Number(
                store.averageRating ??
                store.average_rating ??
                0
              );

              const ownRating = store.myRating ?? store.my_rating;

              return (
                <article key={id} style={styles.storeCard}>
                  <div style={styles.storeTop}>
                    <div style={styles.storeIcon}>
                      <Store size={23} />
                    </div>

                    <div style={styles.averageBox}>
                      <Star
                        size={17}
                        fill="#d97757"
                        color="#d97757"
                      />
                      <strong>{average.toFixed(1)}</strong>
                      <span>Overall rating</span>
                    </div>
                  </div>

                  <h3 style={styles.storeName}>{store.name}</h3>

                  <div style={styles.storeAddress}>
                    <MapPin size={15} />
                    <span>{store.address || "Address unavailable"}</span>
                  </div>

                  <div style={styles.ratingSection}>
                    <span style={styles.ratingLabel}>
                      YOUR RATING
                    </span>

                    <div style={styles.stars}>
                      {[1, 2, 3, 4, 5].map((number) => (
                        <button
                          type="button"
                          key={number}
                          aria-label={`Rate ${number} out of 5`}
                          onClick={() =>
                            setRatings((previous) => ({
                              ...previous,
                              [id]: String(number)
                            }))
                          }
                          style={{
                            ...styles.starButton,
                            color:
                              Number(ratings[id]) >= number
                                ? "#d97757"
                                : "#c9c5bb"
                          }}
                        >
                          <Star
                            size={25}
                            fill={
                              Number(ratings[id]) >= number
                                ? "#d97757"
                                : "none"
                            }
                          />
                        </button>
                      ))}
                    </div>

                    <p style={styles.ratingHint}>
                      {ownRating
                        ? `Your previous rating: ${ownRating}/5`
                        : "You haven't rated this store yet."}
                    </p>

                    <button
                      type="button"
                      style={{
                        ...styles.submitButton,
                        opacity: savingStore === id ? 0.6 : 1
                      }}
                      disabled={savingStore === id}
                      onClick={() => submitRating(id)}
                    >
                      <Send size={15} />
                      {savingStore === id
                        ? "Saving..."
                        : ownRating
                        ? "Update rating"
                        : "Submit rating"}
                    </button>
                  </div>
                </article>
              );
            })}
          </section>
        )}

        <footer style={styles.footer}>
          <span>
            <UserRound size={15} />
            Signed in as {user?.name}
          </span>
          <span>ROXILER MARKETPLACE · 2026</span>
        </footer>
      </main>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div style={styles.modalBackdrop}>
          <section style={styles.passwordModal}>
            <div style={styles.modalHeader}>
              <div>
                <span style={styles.eyebrow}>ACCOUNT SECURITY</span>
                <h2 style={styles.modalTitle}>Change password</h2>
                <p style={styles.modalDescription}>
                  Update your account password securely.
                </p>
              </div>

              <button
                type="button"
                style={styles.closeButton}
                onClick={() => setShowPasswordModal(false)}
                aria-label="Close password form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={changePassword}>
              <PasswordField
                label="Current password"
                value={currentPassword}
                onChange={setCurrentPassword}
                visible={showPasswords}
                onToggle={() => setShowPasswords((value) => !value)}
              />

              <PasswordField
                label="New password"
                value={newPassword}
                onChange={setNewPassword}
                visible={showPasswords}
                onToggle={() => setShowPasswords((value) => !value)}
              />

              <PasswordField
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                visible={showPasswords}
                onToggle={() => setShowPasswords((value) => !value)}
              />

              <div style={styles.passwordRules}>
                Password must contain:
                <ul>
                  <li>8 to 16 characters</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one special character</li>
                </ul>
              </div>

              {passwordError && (
                <div style={styles.error}>
                  <AlertCircle size={17} />
                  {passwordError}
                </div>
              )}

              {passwordMessage && (
                <div style={styles.success}>
                  <CheckCircle size={17} />
                  {passwordMessage}
                </div>
              )}

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  style={{
                    ...styles.submitButton,
                    opacity: passwordLoading ? 0.6 : 1
                  }}
                  disabled={passwordLoading}
                >
                  <LockKeyhole size={15} />
                  {passwordLoading ? "Updating..." : "Update password"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

// Reusable password input
function PasswordField({ label, value, onChange, visible, onToggle }) {
  return (
    <label style={styles.passwordField}>
      <span>{label}</span>

      <div style={styles.passwordInputWrap}>
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          autoComplete="current-password"
          placeholder={`Enter ${label.toLowerCase()}`}
          style={styles.passwordInput}
        />

        <button
          type="button"
          onClick={onToggle}
          style={styles.eyeButton}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
    </label>
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
  userBadge: {
    color: "#183c35",
    background: "#e7eee8",
    padding: "7px 11px",
    borderRadius: 20,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1
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
  passwordHeaderButton: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #dedbd2",
    borderRadius: 7,
    padding: "10px 13px",
    background: "white",
    color: "#183c35",
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
    padding: "38px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 235,
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
    padding: 15
  },
  discoveryHeading: {
    display: "flex",
    alignItems: "end",
    justifyContent: "space-between",
    margin: "36px 0 19px",
    gap: 12
  },
  refresh: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    border: "1px solid #dedbd2",
    background: "#fffdf8",
    padding: "10px 13px",
    borderRadius: 7,
    color: "#4b5c50",
    fontSize: 11,
    cursor: "pointer"
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 11,
    background: "#fffdf8",
    border: "1px solid #e9e5dc",
    borderRadius: 9,
    padding: "0 15px",
    minHeight: 48
  },
  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 15,
    color: "#252b29"
  },
  resultsHeading: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "26px 0 15px"
  },
  storeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: 17
  },
  storeCard: {
    background: "#fffdf8",
    border: "1px solid #e9e5dc",
    borderRadius: 12,
    padding: 22
  },
  storeTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  storeIcon: {
    width: 46,
    height: 46,
    display: "grid",
    placeItems: "center",
    borderRadius: 10,
    background: "#e8eee8",
    color: "#183c35"
  },
  averageBox: {
    display: "grid",
    gridTemplateColumns: "20px auto",
    alignItems: "center",
    gap: 4,
    color: "#b86c40"
  },
  storeName: {
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: 22,
    fontWeight: 500,
    margin: "20px 0 10px"
  },
  storeAddress: {
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    color: "#7b817a",
    fontSize: 11,
    lineHeight: 1.6
  },
  ratingSection: {
    borderTop: "1px solid #e9e5dc",
    marginTop: 20,
    paddingTop: 18
  },
  ratingLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: "#737c73"
  },
  stars: {
    display: "flex",
    gap: 7,
    margin: "12px 0"
  },
  starButton: {
    padding: 0,
    border: 0,
    background: "transparent",
    cursor: "pointer"
  },
  ratingHint: {
    color: "#7d827b",
    fontSize: 11
  },
  submitButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    border: 0,
    background: "#183c35",
    color: "white",
    padding: 12,
    borderRadius: 7,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer"
  },
  error: {
    marginTop: 15,
    padding: 13,
    borderRadius: 8,
    background: "#fbe9e5",
    color: "#a33f2b",
    fontSize: 12,
    display: "flex",
    gap: 9,
    alignItems: "center"
  },
  success: {
    marginTop: 15,
    padding: 13,
    borderRadius: 8,
    background: "#e7f2e9",
    color: "#2c7041",
    fontSize: 12,
    display: "flex",
    gap: 9,
    alignItems: "center"
  },
  emptyState: {
    textAlign: "center",
    background: "#fffdf8",
    border: "1px solid #e9e5dc",
    borderRadius: 12,
    padding: 45,
    color: "#7d827b"
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
  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(20, 38, 32, 0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 18,
    zIndex: 1000,
    overflowY: "auto"
  },
  passwordModal: {
    width: "100%",
    maxWidth: 470,
    background: "#fffdf8",
    borderRadius: 13,
    padding: 27,
    boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
    maxHeight: "90vh",
    overflowY: "auto"
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 24
  },
  modalTitle: {
    margin: "9px 0 5px",
    fontSize: 25,
    color: "#183c35"
  },
  modalDescription: {
    fontSize: 12,
    color: "#777e76",
    margin: 0
  },
  closeButton: {
    border: "1px solid #e5e0d6",
    borderRadius: 7,
    background: "white",
    padding: 8,
    cursor: "pointer",
    color: "#183c35"
  },
  passwordField: {
    display: "block",
    marginBottom: 17,
    fontSize: 12,
    fontWeight: 600,
    color: "#39483e"
  },
  passwordInputWrap: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #dedbd2",
    borderRadius: 7,
    marginTop: 7,
    background: "white"
  },
  passwordInput: {
    width: "100%",
    minWidth: 0,
    border: "none",
    outline: "none",
    background: "transparent",
    padding: 12,
    fontSize: 13,
    color: "#252b29"
  },
  eyeButton: {
    border: "none",
    background: "transparent",
    color: "#737c73",
    padding: 10,
    cursor: "pointer"
  },
  passwordRules: {
    background: "#f1f3ed",
    color: "#526456",
    borderRadius: 7,
    padding: 13,
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 15
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
    flexWrap: "wrap"
  },
  cancelButton: {
    border: "1px solid #dedbd2",
    borderRadius: 7,
    background: "white",
    color: "#35443b",
    padding: "11px 16px",
    fontSize: 12,
    cursor: "pointer"
  }
};
