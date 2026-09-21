import React, { createContext, useContext, useState, useEffect } from "react";
import { Language, translations, TranslationDict } from "../i18n/translations";
import { NotificationItem, ServiceCategory, Booking } from "../types";
import { useAuth } from "./AuthContext";

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDict;
  notifications: NotificationItem[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  
  // Modals
  isAuthModalOpen: boolean;
  authModalMode: "login" | "register";
  authModalRole: "customer" | "worker" | "admin";
  openAuthModal: (mode?: "login" | "register", role?: "customer" | "worker" | "admin") => void;
  closeAuthModal: () => void;

  isEmergencyModalOpen: boolean;
  openEmergencyModal: () => void;
  closeEmergencyModal: () => void;

  // Booking & Matching flows
  selectedCategoryForBooking: ServiceCategory | null;
  setSelectedCategoryForBooking: (cat: ServiceCategory | null) => void;
  categories: ServiceCategory[];
  
  selectedBookingForDetail: Booking | null;
  setSelectedBookingForDetail: (booking: Booking | null) => void;
  
  // Refresh triggers
  bookingRefreshKey: number;
  triggerBookingRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_CATEGORIES: ServiceCategory[] = [
  { id: "cat-plumbing", name: "Plumbing", slug: "plumbing", icon: "Wrench", description: "Leak repairs, pipe installations, sanitary ware & fittings", baseRatePerHour: 350, emergencyMultiplier: 1.5, avgDurationHours: 1.5 },
  { id: "cat-electrical", name: "Electrical", slug: "electrical", icon: "Zap", description: "Wiring, switchboard fixes, short-circuits, appliance setup", baseRatePerHour: 400, emergencyMultiplier: 1.5, avgDurationHours: 1.5 },
  { id: "cat-carpentry", name: "Carpentry", slug: "carpentry", icon: "Hammer", description: "Furniture repair, lock replacements, modular fittings", baseRatePerHour: 450, emergencyMultiplier: 1.3, avgDurationHours: 2 },
  { id: "cat-painting", name: "Painting", slug: "painting", icon: "Paintbrush", description: "Wall touch-ups, waterproof coatings, interior repaint", baseRatePerHour: 500, emergencyMultiplier: 1.2, avgDurationHours: 4 },
  { id: "cat-cleaning", name: "Cleaning", slug: "cleaning", icon: "Sparkles", description: "Deep kitchen sanitization, water tank cleaning, floor buffing", baseRatePerHour: 300, emergencyMultiplier: 1.3, avgDurationHours: 2.5 },
  { id: "cat-caregiving", name: "Caregiving", slug: "caregiving", icon: "HeartHandshake", description: "Elder assistance, mobility support, patient aid", baseRatePerHour: 350, emergencyMultiplier: 1.4, avgDurationHours: 4 },
  { id: "cat-driving", name: "Driving", slug: "driving", icon: "Car", description: "Verified cooperative drivers for local & outstation trips", baseRatePerHour: 300, emergencyMultiplier: 1.3, avgDurationHours: 3 },
  { id: "cat-gardening", name: "Gardening", slug: "gardening", icon: "Flower2", description: "Lawn pruning, balcony garden care, organic pest treatment", baseRatePerHour: 280, emergencyMultiplier: 1.2, avgDurationHours: 2 },
  { id: "cat-technician", name: "Technician Services", slug: "technician", icon: "Cpu", description: "RO water purifier, inverter repair, washing machine servicing", baseRatePerHour: 450, emergencyMultiplier: 1.4, avgDurationHours: 1.5 }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("sc_lang") as Language) || "en";
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>(DEFAULT_CATEGORIES);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const [authModalRole, setAuthModalRole] = useState<"customer" | "worker" | "admin">("customer");

  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [selectedCategoryForBooking, setSelectedCategoryForBooking] = useState<ServiceCategory | null>(null);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
  const [bookingRefreshKey, setBookingRefreshKey] = useState<number>(0);

  const { token, user } = useAuth();

  const setLanguage = (lang: Language) => {
    localStorage.setItem("sc_lang", lang);
    setLanguageState(lang);
  };

  const t = translations[language] || translations.en;

  const fetchNotifications = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("/api/notifications", { headers });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 4000);
    return () => clearInterval(interval);
  }, [token, user]);

  // Real-time synchronization across all devices via Server-Sent Events
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource("/api/realtime/stream");

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.type) {
              // Trigger instant data sync across devices
              setBookingRefreshKey(prev => prev + 1);
              fetchNotifications();
            }
          } catch {
            // Heartbeat or parse error
          }
        };

        eventSource.onerror = () => {
          eventSource?.close();
          reconnectTimeout = setTimeout(connectSSE, 3000);
        };
      } catch {
        reconnectTimeout = setTimeout(connectSSE, 3000);
      }
    };

    connectSSE();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, []);

  useEffect(() => {
    fetch("/api/categories")
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d && Array.isArray(d.categories) && d.categories.length > 0) {
          setCategories(d.categories);
        }
      })
      .catch(() => {});
  }, []);

  const markNotificationRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (e) {
      // ignore
    }
  };

  const openAuthModal = (mode: "login" | "register" = "login", role: "customer" | "worker" | "admin" = "customer") => {
    setAuthModalMode(mode);
    setAuthModalRole(role);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openEmergencyModal = () => {
    setIsEmergencyModalOpen(true);
  };

  const closeEmergencyModal = () => {
    setIsEmergencyModalOpen(false);
  };

  const triggerBookingRefresh = () => {
    setBookingRefreshKey(prev => prev + 1);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        notifications,
        unreadCount,
        fetchNotifications,
        markNotificationRead,
        isAuthModalOpen,
        authModalMode,
        authModalRole,
        openAuthModal,
        closeAuthModal,
        isEmergencyModalOpen,
        openEmergencyModal,
        closeEmergencyModal,
        categories,
        selectedCategoryForBooking,
        setSelectedCategoryForBooking,
        selectedBookingForDetail,
        setSelectedBookingForDetail,
        bookingRefreshKey,
        triggerBookingRefresh
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
