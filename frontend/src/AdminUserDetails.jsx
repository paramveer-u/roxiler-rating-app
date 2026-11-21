

import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  UserRound,
  Mail,
  MapPin,
  ShieldCheck,
  Store,
  Star,
  LoaderCircle,
  AlertCircle
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function AdminUserDetails({ userId, onBack }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUserDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("roxilerToken");

        const response = await axios.get(
          `${API_URL}/admin/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setUser(response.data.user || response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
          "Unable to load user details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (userId !== null && userId !== undefined) {
      loadUserDetails();
    }
  }, [userId]);

  if (loading) {
    return (
      <div style={styles.center}>
        <LoaderCircle size={30} />
        <p>Loading user details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={styles.center}>
        <AlertCircle size={30} color="#b54d39" />
        <p>{error || "User details not found."}</p>

        <button style={styles.backButton} onClick={onBack}>
          <ArrowLeft size={16} />
          Back to users
        </button>
      </div>
    );
  }

  const stores = user.stores || user.ownedStores || [];
  const role = (user.role || "USER").replace("_", " ");

  return (
    <section style={styles.page}>

      <button style={styles.backButton} onClick={onBack}>
        <ArrowLeft size={17} />
        Back to users
      </button>

      <div style={styles.heading}>
        <span style={styles.eyebrow}>
          ACCOUNT MANAGEMENT / PROFILE
        </span>

        <h1 style={styles.pageTitle}>User details</h1>

        <p style={styles.subtitle}>
          Review account information and associated store activity.
        </p>
      </div>

      {/* USER PROFILE CARD */}
      <article style={styles.profileCard}>

        <div style={styles.profileTop}>
          <div style={styles.avatar}>
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div style={styles.profileName}>
            <h2>{user.name}</h2>

            <span style={styles.role}>
              {role}
            </span>
          </div>
        </div>

        {/* USER INFORMATION */}
        <div style={styles.detailsGrid}>

          <Detail
            icon={<UserRound size={19} />}
            label="User ID"
            value={user.user_id ?? user.userId ?? userId}
          />

          <Detail
            icon={<Mail size={19} />}
            label="Email address"
            value={user.email}
          />

          <Detail
            icon={<MapPin size={19} />}
            label="Address"
            value={user.address || "Not provided"}
          />

          <Detail
            icon={<ShieldCheck size={19} />}
            label="Account role"
            value={role}
          />

        </div>
      </article>

      {/* STORE OWNER INFORMATION */}
      {user.role === "STORE_OWNER" && (
        <section style={styles.storesSection}>

          <div style={styles.sectionHeading}>
            <div>
              <span style={styles.eyebrow}>
                BUSINESS INFORMATION
              </span>

              <h2>Owned stores</h2>
            </div>

            <span style={styles.count}>
              {stores.length} STORES
            </span>
          </div>

          {stores.length === 0 ? (
            <div style={styles.empty}>
              This owner has no registered stores yet.
            </div>
          ) : (
            <div style={styles.storeGrid}>
              {stores.map((store, index) => (
                <article
                  key={store.store_id || store.storeId || index}
                  style={styles.storeCard}
                >

                  <div style={styles.storeIcon}>
                    <Store size={22} />
                  </div>

                  <h3 style={styles.storeName}>
                    {store.name}
                  </h3>

                  <div style={styles.storeInfo}>
                    <Mail size={16} />
                    <span>{store.email || "Not available"}</span>
                  </div>

                  <div style={styles.storeInfo}>
                    <MapPin size={16} />
                    <span>{store.address || "Not available"}</span>
                  </div>

                  <div style={styles.rating}>
                    <Star size={18} fill="currentColor" />

                    <strong>
                      {Number(
                        store.averageRating ??
                        store.average_rating ??
                        0
                      ).toFixed(1)}
                    </strong>

                    <span>Average rating</span>
                  </div>

                </article>
              ))}
            </div>
          )}

        </section>
      )}

      {/* NORMAL USER / ADMIN INFORMATION */}
      {user.role !== "STORE_OWNER" && (
        <div style={styles.note}>
          <ShieldCheck size={19} />

          <span>
            This account does not have an associated store-owner profile.
          </span>
        </div>
      )}

    </section>
  );
}

/* REUSABLE USER DETAIL COMPONENT */
function Detail({ icon, label, value }) {
  return (
    <div style={styles.detail}>

      <span style={styles.detailIcon}>
        {icon}
      </span>

      <div style={styles.detailContent}>
        <small>{label}</small>

        <strong>
          {value || "Not available"}
        </strong>
      </div>

    </div>
  );
}

/* PAGE STYLES */
const styles = {
  page: {
    width: "100%",
    maxWidth: 1100,
    margin: "0 auto",
    padding: "10px 0 40px",
    boxSizing: "border-box",
    color: "#252b29",
    fontFamily: "'DM Sans', Arial, sans-serif"
  },

  center: {
    minHeight: 300,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    color: "#69756d"
  },

  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 9,
    background: "#fffdf8",
    border: "1px solid #e3ded3",
    borderRadius: 8,
    padding: "11px 15px",
    color: "#183c35",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600
  },

  heading: {
    margin: "30px 0 23px"
  },

  eyebrow: {
    color: "#d97757",
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 2
  },

  pageTitle: {
    fontSize: 32,
    margin: "8px 0",
    color: "#252b29"
  },

  subtitle: {
    fontSize: 15,
    color: "#68716b",
    marginTop: 12
  },

  profileCard: {
    background: "#fffdf8",
    border: "1px solid #e9e5dc",
    borderRadius: 13,
    padding: "26px",
    width: "100%",
    boxSizing: "border-box"
  },

  profileTop: {
    display: "flex",
    alignItems: "center",
    gap: 18,
    paddingBottom: 25,
    borderBottom: "1px solid #e9e5dc"
  },

  avatar: {
    width: 64,
    height: 64,
    minWidth: 64,
    borderRadius: "50%",
    background: "#183c35",
    color: "#ffffff",
    display: "grid",
    placeItems: "center",
    fontSize: 25,
    fontWeight: 700
  },

  profileName: {
    minWidth: 0
  },

  profileNameHeading: {
    margin: 0
  },

  role: {
    display: "inline-block",
    background: "#e8eee8",
    color: "#183c35",
    borderRadius: 20,
    padding: "6px 12px",
    fontSize: 10,
    fontWeight: 700,
    marginTop: 8
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
    columnGap: 30,
    rowGap: 28,
    paddingTop: 28
  },

  detail: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
    minWidth: 0
  },

  detailIcon: {
    width: 43,
    height: 43,
    minWidth: 43,
    borderRadius: 10,
    background: "#e8eee8",
    color: "#183c35",
    display: "grid",
    placeItems: "center"
  },

  detailContent: {
    display: "flex",
    flexDirection: "column",
    gap: 7,
    minWidth: 0,
    flex: 1
  },

  storesSection: {
    marginTop: 38
  },

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 15,
    marginBottom: 20
  },

  count: {
    fontSize: 10,
    letterSpacing: 1,
    color: "#737c73",
    fontWeight: 700
  },

  storeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
    gap: 18
  },

  storeCard: {
    background: "#fffdf8",
    border: "1px solid #e9e5dc",
    borderRadius: 12,
    padding: 22,
    minWidth: 0,
    boxSizing: "border-box"
  },

  storeIcon: {
    width: 43,
    height: 43,
    display: "grid",
    placeItems: "center",
    background: "#e8eee8",
    color: "#183c35",
    borderRadius: 10
  },

  storeName: {
    fontSize: 18,
    margin: "17px 0"
  },

  storeInfo: {
    display: "flex",
    alignItems: "flex-start",
    gap: 9,
    color: "#777e76",
    fontSize: 12,
    lineHeight: 1.6,
    marginTop: 12,
    minWidth: 0,
    overflowWrap: "anywhere"
  },

  rating: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#c17b43",
    borderTop: "1px solid #e9e5dc",
    paddingTop: 16,
    marginTop: 19
  },

  empty: {
    padding: 25,
    background: "#fffdf8",
    borderRadius: 10,
    color: "#777e76",
    fontSize: 13
  },

  note: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginTop: 28,
    padding: 17,
    borderRadius: 10,
    background: "#e8eee8",
    color: "#355b46",
    fontSize: 13
  }
};
