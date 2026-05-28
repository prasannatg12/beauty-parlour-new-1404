import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../hooks/supabaseClient";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Calendar,
  Users, 
  Scissors, 
  UserCog, 
  ReceiptIndianRupee, 
  PackageSearch, 
  BarChart3, 
  Gift,
  CheckCircle2,
  AlertCircle,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  Pencil,
  LineChart,
  Settings, 
  LogOut,
  Plus,
  MoreHorizontal,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

type Section = 
  | "Dashboard" | "Appointments" | "Customers" | "Services" 
  | "Staff" | "Billing" | "Inventory" | "Reports" 
  | "Offers" | "Settings";

const ITEMS_PER_PAGE = 10;

type BookingStatus = "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled" | "No Show";

const STATUS_CONFIG: Record<BookingStatus, { color: string, next: BookingStatus[] }> = {
  "Pending": { 
    color: "bg-yellow-100 text-yellow-700", 
    next: ["Confirmed", "Cancelled"] 
  },
  "Confirmed": { 
    color: "bg-blue-100 text-blue-700", 
    next: ["In Progress", "Cancelled", "No Show"] 
  },
  "In Progress": { 
    color: "bg-purple-100 text-purple-700", 
    next: ["Completed"] 
  },
  "Completed": { 
    color: "bg-green-100 text-green-700", 
    next: [] 
  },
  "Cancelled": { 
    color: "bg-red-100 text-red-700", 
    next: [] 
  },
  "No Show": { 
    color: "bg-gray-100 text-gray-700", 
    next: [] 
  }
};

/**
 * Updates a booking status in Supabase
 */
async function updateBookingStatus(bookingId: string, newStatus: BookingStatus) {
  const { data, error } = await supabase
    .from("booking")
    .update({ 
      status: newStatus,
      updated_on: new Date().toISOString()
    })
    .eq("id", bookingId)
    .select();

  if (error) throw error;
  return data;
}

// Helper to format date as DD-MMM-YYYY HH:MM
const formatBookingDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr; // Fallback for old text-based data

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-IN", { month: "short" }).toUpperCase();
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

// Helper to check if a date is in the current week
const isCurrentWeek = (dateString: string) => {
  const bookingDate = new Date(dateString);
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
  
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(diff);
  firstDayOfWeek.setHours(0, 0, 0, 0);

  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Saturday
  lastDayOfWeek.setHours(23, 59, 59, 999);

  return bookingDate >= firstDayOfWeek && bookingDate <= lastDayOfWeek;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgError, setOrgError] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookingView, setBookingView] = useState<"grid" | "date">("date"); // Default to date view
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(null);
  const [upcomingGridSearchTerm, setUpcomingGridSearchTerm] = useState("");
  const [serviceForm, setServiceForm] = useState({ name: "", description: "", price: "", duration: "" });
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: "", role: "", phone: "", email: "" });
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTempStatus, setEditTempStatus] = useState<BookingStatus | null>(null);
  const [editTempStaffId, setEditTempStaffId] = useState<string | null>(null);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddAppointmentFormOpen, setIsAddAppointmentFormOpen] = useState(false);
  const [newAppointmentForm, setNewAppointmentForm] = useState({
    service: "",
    preferred_time: "",
    notes: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedServiceFilter, setSelectedServiceFilter] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [staffSearchTerm, setStaffSearchTerm] = useState("");

  const handleWeekDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedDate = new Date(e.target.value);
    if (isNaN(selectedDate.getTime())) return;

    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const startOfCurrentWeek = new Date(today);
    startOfCurrentWeek.setDate(diff);
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const selDay = selectedDate.getDay();
    const selDiff = selectedDate.getDate() - selDay + (selDay === 0 ? -6 : 1);
    const startOfSelectedWeek = new Date(selectedDate);
    startOfSelectedWeek.setDate(selDiff);
    startOfSelectedWeek.setHours(0, 0, 0, 0);

    const diffInMs = startOfSelectedWeek.getTime() - startOfCurrentWeek.getTime();
    const offset = Math.round(diffInMs / (7 * 24 * 60 * 60 * 1000));
    
    setWeekOffset(offset);
    setSelectedDateIndex(null);
  };

  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [customerForm, setCustomerForm] = useState({
    name: "",
    phone: "",
    email: "",
    service: "",
    preferred_time: "",
    staff_id: ""
  });
  
  const tabDescriptions: Partial<Record<Section, string>> = {
    Dashboard: "Real-time overview of your salon's performance and activity.",
    Appointments: "Organize and track your upcoming client appointments.",
    Customers: "Maintain and view your comprehensive client database.",
    Services: "Manage your parlour's service offerings and pricing structure.",
    Billing: "Track customer payments and financial records.",
    Inventory: "Monitor salon products and stock levels.",
  };

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async (forcedOrgId?: string) => {
    const targetOrgId = forcedOrgId || orgId;
    if (!targetOrgId) return;

    const { data, error } = await supabase
      .from("booking")
      .select(`
        *,
        staff:staff_id (name)
      `)
      .eq("org_id", targetOrgId)
      .order("created_on", { ascending: false });
      
    if (error) {
      console.error("Error fetching bookings:", error);
    } else {
      setBookings(data || []);
    }
  };

  const fetchPayments = async (forcedOrgId?: string) => {
    const targetOrgId = forcedOrgId || orgId;
    if (!targetOrgId) return;

    const { data, error } = await supabase
      .from("payment")
      .select(`
        *,
        booking:booking_id (
          name,
          service,
          preferred_time
        )
      `)
      .eq("org_id", targetOrgId)
      .order("created_at", { ascending: false });
    
    if (data) setPayments(data);
  };

  const fetchServices = async (forcedOrgId?: string) => {
    const targetOrgId = forcedOrgId || orgId;
    if (!targetOrgId) return;

    const { data, error } = await supabase
      .from("service")
      .select("*")
      .eq("org_id", targetOrgId)
      .eq("isdeleted", false)
      .order("id", { ascending: true });
    
    if (data) setServices(data);
    setLoading(false);
  };

  const fetchStaff = async (forcedOrgId?: string) => {
    const targetOrgId = forcedOrgId || orgId;
    if (!targetOrgId) return;

    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("org_id", targetOrgId)
      .eq("isdeleted", false)
      .order("name", { ascending: true });
    
    if (data) setStaff(data);
  };

  useEffect(() => {
    const loadDataForTab = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      } else {
        // The User UID IS the Organization ID
        const userOrgId = session.user.id;
        if (!userOrgId) {
          setOrgError("Your account is not associated with any organization. Data cannot be loaded.");
          setLoading(false);
          return;
        }
        setOrgId(userOrgId);
        setLoading(true);
        try {
          if (activeTab === "Dashboard") {
            await Promise.all([fetchBookings(userOrgId), fetchPayments(userOrgId)]);
          } else if (activeTab === "Appointments") {
            await Promise.all([fetchBookings(userOrgId), fetchServices(userOrgId), fetchPayments(userOrgId), fetchStaff(userOrgId)]);
          } else if (activeTab === "Customers") {
            await Promise.all([fetchBookings(userOrgId), fetchServices(userOrgId), fetchPayments(userOrgId), fetchStaff(userOrgId)]);
          } else if (activeTab === "Services") {
            await fetchServices(userOrgId);
          } else if (activeTab === "Staff") {
            await fetchStaff(userOrgId);
          } else if (activeTab === "Billing") {
            await fetchPayments(userOrgId);
          }
        } catch (error) {
          console.error("Error loading data for tab:", activeTab, error);
        } finally {
          setLoading(false); // End loading once all operations for the tab are done
        }
      }
    };
    loadDataForTab();
  }, [navigate, activeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, customerSearchTerm, staffSearchTerm, selectedServiceFilter, selectedDateFilter, selectedStatusFilter, selectedCustomerPhone]);

  const upcomingBookingsWeekData = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(diff + (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }, (_, i) => {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      const dayBookings = bookings.filter(b => {
        const bDate = new Date(b.preferred_time);
        return !isNaN(bDate.getTime()) && 
               bDate >= dayStart && 
               bDate < dayEnd && 
               ((b.status || "Pending") === "Pending" || b.status === "Confirmed");
      });

      return {
        dayLabel: dayStart.toLocaleDateString('en-IN', { weekday: 'short' }),
        dateLabel: dayStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        isToday: dayStart.toDateString() === new Date().toDateString(),
        bookings: dayBookings
      };
    });
  }, [bookings, weekOffset]);

  const customerData = useMemo(() => {
    const customers: Record<string, any> = {};
    
    // Group bookings by phone number to create customer entries
    bookings.forEach(b => {
      const key = b.phone;
      if (!customers[key]) {
        customers[key] = {
          name: b.name,
          phone: b.phone,
          email: b.email,
          totalBookings: 0,
          lastVisit: b.created_on,
          history: [],
          names: new Set<string>() // Use a Set to store unique names
        };
      }
      customers[key].totalBookings += 1;
      customers[key].history.push(b);
      customers[key].names.add(b.name); // Add current booking's name to the set

      if (new Date(b.created_on) > new Date(customers[key].lastVisit)) {
        customers[key].lastVisit = b.created_on;
        customers[key].name = b.name; // Keep most recent name
      }
    });

    // Convert Set of names to Array and sort customers
    return Object.values(customers).map(customer => ({
      ...customer,
      names: Array.from(customer.names) // Convert Set to Array for display
    })).sort((a, b) => 
      new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
    );
  }, [bookings]);

  // Effect to auto-select today's date in the upcoming appointments date view on Dashboard load
  useEffect(() => {
    if (activeTab === "Dashboard" && bookingView === "date" && bookings.length > 0) {
      const todayIndex = upcomingBookingsWeekData.findIndex(dayData => dayData.isToday && dayData.bookings.length > 0);
      if (todayIndex !== -1) {
        setSelectedDateIndex(todayIndex);
      } else {
        setSelectedDateIndex(0); // Select the first day if today has no appointments or is not in the current week
      }
    } else if (activeTab === "Dashboard" && bookingView === "grid") {
      setSelectedDateIndex(null); // Clear selection if switching to grid view
    }
  }, [activeTab, bookings, bookingView, upcomingBookingsWeekData]);

  // Real-time subscription for booking updates
  useEffect(() => {
    if (!orgId) return;

    const channel = supabase
      .channel('admin-updates')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'booking',
          filter: `org_id=eq.${orgId}`
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    if (!orgId) return;

    try {
      await updateBookingStatus(bookingId, newStatus);
      
      // Update local state for immediate feedback
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      
      // Automation Logic
      if (newStatus === "Completed") {
        const booking = bookings.find(b => b.id === bookingId);
        if (booking) {
          // Fetch the current price from the service table
          const { data: serviceData } = await supabase
            .from("service")
            .select("price")
            .eq("name", booking.service)
            .eq("org_id", orgId)
            .single();

          // Insert the payment record
          await supabase.from("payment").insert([{
            booking_id: bookingId,
            amount: serviceData?.price?.toString().replace(/[₹\s,]|onwards/g, '') || "0",
            status: "pending",
            org_id: orgId
          }]);
          
          console.log("Automation: Payment record created for booking", bookingId);
        }
      }
      
      if (newStatus === "No Show") {
        console.log("Trigger: Log customer analytics for No Show");
      }

      // Trigger Notification (Placeholder for external API like Twilio/Email)
      console.log(`Notification: Status updated to ${newStatus}`);
      setEditingId(null);
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  const handleSaveEdit = async (bookingId: string) => {
    if (!editTempStatus || !orgId) return;
    
    try {
      const booking = bookings.find(b => b.id === bookingId);
      if (!booking) return;

      // Enforce: No appointment can be "In Progress" without an assigned staff member
      if (editTempStatus === "In Progress" && !editTempStaffId) {
        alert("Please assign a staff member before starting the appointment.");
        return;
      }

      const updates: any = {
        updated_on: new Date().toISOString()
      };
      
      let statusChanged = false;
      if (editTempStatus !== (booking.status || "Pending")) {
        updates.status = editTempStatus;
        statusChanged = true;
      }
      
      if (editTempStaffId !== (booking.staff_id || "")) {
        updates.staff_id = editTempStaffId || null;
      }

      if (statusChanged || updates.staff_id !== undefined) {
        const { error } = await supabase
          .from("booking")
          .update(updates)
          .eq("id", bookingId)
          .eq("org_id", orgId);

        if (error) throw error;

        if (statusChanged && editTempStatus === "Completed") {
          const { data: serviceData } = await supabase
            .from("service")
            .select("price")
            .eq("name", booking.service)
            .eq("org_id", orgId)
            .single();

          await supabase.from("payment").insert([{
            booking_id: bookingId,
            amount: serviceData?.price?.toString().replace(/[₹\s,]|onwards/g, '') || "0",
            status: "pending",
            org_id: orgId
          }]);
        }
      }

      setEditingId(null);
      setEditTempStatus(null);
      setEditTempStaffId(null);
      fetchBookings();
    } catch (err: any) {
      alert("Failed to save changes: " + err.message);
    }
  };

  const handleStaffAssign = async (bookingId: string, staffId: string | null) => {
    if (!orgId) return;

    try {
      const { error } = await supabase
        .from("booking")
        .update({ 
          staff_id: staffId || null,
          updated_on: new Date().toISOString()
        })
        .eq("id", bookingId)
        .eq("org_id", orgId);
      
      if (error) throw error;
      fetchBookings(); // Refresh list to update the joined staff name display
    } catch (err: any) {
      alert("Failed to assign staff: " + err.message);
    }
  };

  const handlePaymentStatusChange = async (paymentId: string, newStatus: string) => {
    if (!orgId) return;

    try {
      const { error } = await supabase
        .from("payment")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", paymentId)
        .eq("org_id", orgId);
      
      if (error) throw error;
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, status: newStatus } : p));
    } catch (err: any) {
      alert("Error updating payment: " + err.message);
    }
  };

  const handleServiceSubmit = async (e: React.FormEvent) => {
    if (!orgId) return;

    e.preventDefault();
    try {
      if (editingServiceId) {
        const { error } = await supabase
          .from("service")
          .update(serviceForm)
          .eq("id", editingServiceId)
          .eq("org_id", orgId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("service")
          .insert([{ ...serviceForm, org_id: orgId }]);
        if (error) throw error;
      }
      setIsServiceFormOpen(false);
      setEditingServiceId(null);
      setServiceForm({ name: "", description: "", price: "", duration: "" });
      fetchServices();
    } catch (err: any) {
      alert("Error saving service: " + err.message);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!orgId) return;

    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      const { error } = await supabase
        .from("service")
        .update({ isdeleted: true })
        .eq("id", id)
        .eq("org_id", orgId);
      if (error) throw error;
      fetchServices();
    } catch (err: any) {
      alert("Error deleting service: " + err.message);
    }
  };

  const handleCustomerSubmit = async (e: React.FormEvent) => {
    if (!orgId) return;

    e.preventDefault();
    
    // 1. Check for duplicate phone number
    const exists = customerData.some(c => c.phone === customerForm.phone.trim());
    if (exists) {
      alert("A customer with this phone number already exists in the directory.");
      return;
    }

    try {
      const now = new Date().toISOString();
      const { error } = await supabase.from("booking").insert([
        {
          name: customerForm.name.trim(),
          phone: customerForm.phone.trim(),
          email: customerForm.email.trim() || null,
          service: customerForm.service,
          preferred_time: customerForm.preferred_time || "Walk-in",
          status: "Confirmed",
          staff_id: customerForm.staff_id || null,
          created_by: "Admin",
          created_on: now,
          updated_by: "Admin",
          updated_on: now,
          org_id: orgId,
        },
      ]);

      if (error) throw error;

      setIsCustomerFormOpen(false);
      setCustomerForm({ name: "", phone: "", email: "", service: "", preferred_time: "" });
      // fetchBookings is triggered automatically by the real-time subscription or we can call it
      fetchBookings(); 
    } catch (err: any) {
      alert("Error adding customer: " + err.message);
    }
  };

  const handleAddAppointmentSubmit = async (e: React.FormEvent) => {
    if (!orgId) return;

    e.preventDefault();
    const selected = customerData.find(c => c.phone === selectedCustomerPhone);
    if (!selected) return;

    try {
      const now = new Date().toISOString();
      const { error } = await supabase.from("booking").insert([
        {
          name: selected.name,
          phone: selected.phone,
          email: selected.email || null,
          service: newAppointmentForm.service,
          preferred_time: newAppointmentForm.preferred_time,
          notes: newAppointmentForm.notes.trim() || null,
          status: "Confirmed",
          staff_id: (e.target as any).staff_id.value || null,
          created_by: "Admin",
          created_on: now,
          updated_by: "Admin",
          updated_on: now,
          org_id: orgId,
        },
      ]);

      if (error) throw error;

      setIsAddAppointmentFormOpen(false);
      setNewAppointmentForm({ service: "", preferred_time: "", notes: "" });
      fetchBookings(); 
    } catch (err: any) {
      alert("Error booking appointment: " + err.message);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    if (!orgId) return;

    e.preventDefault();
    try {
      if (editingStaffId) {
        const { error } = await supabase.from("staff").update(staffForm).eq("id", editingStaffId).eq("org_id", orgId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("staff").insert([{
          ...staffForm,
          org_id: orgId
        }]);
        if (error) throw error;
      }
      setIsStaffFormOpen(false);
      setEditingStaffId(null);
      setStaffForm({ name: "", role: "", phone: "", email: "" });
      fetchStaff();
    } catch (err: any) {
      alert("Error saving staff: " + err.message);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!orgId) return;

    if (!window.confirm("Are you sure you want to remove this staff member?")) return;
    try {
      const { error } = await supabase.from("staff").update({ isdeleted: true }).eq("id", id).eq("org_id", orgId);
      if (error) throw error;
      fetchStaff();
    } catch (err: any) {
      alert("Error deleting staff: " + err.message);
    }
  };

  const kpiData = useMemo(() => {
    const totalAppointments = bookings.length;
    const currentWeekAppointments = bookings.filter(b => isCurrentWeek(b.created_on)).length;
    const pendingAppointments = bookings.filter(b => (b.status || "Pending") === "Pending").length;
    const confirmedAppointments = bookings.filter(b => b.status === "Confirmed").length;
    const completedAppointments = bookings.filter(b => b.status === "Completed").length;
    const cancelledNoShowAppointments = bookings.filter(b => b.status === "Cancelled" || b.status === "No Show").length;

    const totalRevenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => {
        const amt = p.amount?.toString().replace(/[^\d.]/g, '') || "0";
        return sum + (parseFloat(amt) || 0);
      }, 0);
      
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);

    const todayRevenue = payments
      .filter(p => p.status === 'paid' && new Date(p.updated_at) >= todayStart)
      .reduce((sum, p) => sum + (parseFloat(p.amount?.toString().replace(/[^\d.]/g, '') || "0") || 0), 0);

    const yesterdayRevenue = payments
      .filter(p => {
        const d = new Date(p.updated_at);
        return p.status === 'paid' && d >= yesterdayStart && d < todayStart;
      })
      .reduce((sum, p) => sum + (parseFloat(p.amount?.toString().replace(/[^\d.]/g, '') || "0") || 0), 0);

    const profitTrend = todayRevenue > yesterdayRevenue ? 'up' : todayRevenue < yesterdayRevenue ? 'down' : 'neutral';

    return {
      totalAppointments, currentWeekAppointments, pendingAppointments,
      confirmedAppointments, completedAppointments, cancelledNoShowAppointments,
      totalRevenue,
      todayRevenue, yesterdayRevenue, profitTrend
    };
  }, [bookings, payments]);

  const performanceData = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    // Adjust to Monday as the start of the week
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(diff + (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const weekData = Array.from({ length: 7 }, (_, i) => {
      const dayStart = new Date(startOfWeek);
      dayStart.setDate(startOfWeek.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayStart.getDate() + 1);

      // Filter bookings for this day
      const dayBookings = bookings.filter(booking => {
        const bDate = new Date(booking.created_on);
        return bDate >= dayStart && bDate < dayEnd;
      });

      // Calculate revenue for this day
      const dayRevenue = payments.reduce((sum, payment) => {
        if (payment.status !== 'paid' || !payment.updated_at) return sum;
        const pDate = new Date(payment.updated_at);
        if (pDate >= dayStart && pDate < dayEnd) {
          // Robust parsing of amount (handles ₹, commas, "onwards" etc)
          const cleanAmount = payment.amount?.toString().replace(/[^\d.]/g, '') || "0";
          return sum + (parseFloat(cleanAmount) || 0);
        }
        return sum;
      }, 0);

      return {
        dateLabel: dayStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        dayLabel: dayStart.toLocaleDateString('en-IN', { weekday: 'short' }),
        count: dayBookings.length,
        revenue: dayRevenue
      };
    });

    // Find max values to scale charts, ensure at least 1 to avoid NaN/Infinity
    const maxCount = Math.max(...weekData.map(d => d.count), 5);
    const maxRevenue = Math.max(...weekData.map(d => d.revenue), 1000);

    return weekData.map(d => ({
      ...d,
      // Scale to 80% to provide vertical padding within SVG viewBox
      countHeight: (d.count / maxCount) * 80,
      revenueHeight: (d.revenue / maxRevenue) * 80
    }));
  }, [bookings, payments, weekOffset]);

  // const upcomingBookingsWeekData = useMemo(() => {
  //   const today = new Date();
  //   const day = today.getDay();
  //   const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    
  //   const startOfWeek = new Date(today);
  //   startOfWeek.setDate(diff + (weekOffset * 7));
  //   startOfWeek.setHours(0, 0, 0, 0);

  //   return Array.from({ length: 7 }, (_, i) => {
  //     const dayStart = new Date(startOfWeek);
  //     dayStart.setDate(startOfWeek.getDate() + i);
  //     const dayEnd = new Date(dayStart);
  //     dayEnd.setDate(dayStart.getDate() + 1);

  //     const dayBookings = bookings.filter(b => {
  //       const bDate = new Date(b.preferred_time);
  //       return !isNaN(bDate.getTime()) && 
  //              bDate >= dayStart && 
  //              bDate < dayEnd && 
  //              ((b.status || "Pending") === "Pending" || b.status === "Confirmed");
  //     });

  //     return {
  //       dayLabel: dayStart.toLocaleDateString('en-IN', { weekday: 'short' }),
  //       dateLabel: dayStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  //       isToday: dayStart.toDateString() === new Date().toDateString(),
  //       bookings: dayBookings
  //     };
  //   });
  // }, [bookings, weekOffset]);

  // const upcomingBookingsWeekData = useMemo(() => {
  //   const today = new Date();
  //   const day = today.getDay();
  //   const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    
  //   const startOfWeek = new Date(today);
  //   startOfWeek.setDate(diff + (weekOffset * 7));
  //   startOfWeek.setHours(0, 0, 0, 0);

  //   return Array.from({ length: 7 }, (_, i) => {
  //     const dayStart = new Date(startOfWeek);
  //     dayStart.setDate(startOfWeek.getDate() + i);
  //     const dayEnd = new Date(dayStart);
  //     dayEnd.setDate(dayStart.getDate() + 1);

  //     const dayBookings = bookings.filter(b => {
  //       const bDate = new Date(b.preferred_time);
  //       return !isNaN(bDate.getTime()) && 
  //              bDate >= dayStart && 
  //              bDate < dayEnd && 
  //              ((b.status || "Pending") === "Pending" || b.status === "Confirmed");
  //     });

  //     return {
  //       dayLabel: dayStart.toLocaleDateString('en-IN', { weekday: 'short' }),
  //       dateLabel: dayStart.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
  //       isToday: dayStart.toDateString() === new Date().toDateString(),
  //       bookings: dayBookings
  //     };
  //   });
  // }, [bookings, weekOffset]);



  // const customerData = useMemo(() => {
  //   const customers: Record<string, any> = {};
    
  //   // Group bookings by phone number to create customer entries
  //   bookings.forEach(b => {
  //     const key = b.phone;
  //     if (!customers[key]) {
  //       customers[key] = {
  //         name: b.name,
  //         phone: b.phone,
  //         email: b.email,
  //         totalBookings: 0,
  //         lastVisit: b.created_on,
  //         history: [],
  //         names: new Set<string>() // Use a Set to store unique names
  //       };
  //     }
  //     customers[key].totalBookings += 1;
  //     customers[key].history.push(b);
  //     customers[key].names.add(b.name); // Add current booking's name to the set

  //     if (new Date(b.created_on) > new Date(customers[key].lastVisit)) {
  //       customers[key].lastVisit = b.created_on;
  //       customers[key].name = b.name; // Keep most recent name
  //     }
  //   });

  //   // Convert Set of names to Array and sort customers
  //   return Object.values(customers).map(customer => ({
  //     ...customer,
  //     names: Array.from(customer.names) // Convert Set to Array for display
  //   })).sort((a, b) => 
  //     new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
  //   );
  // }, [bookings]);

  const filteredCustomers = useMemo(() => {
    if (!customerSearchTerm) return customerData;
    const lower = customerSearchTerm.toLowerCase();
    return customerData.filter((c: any) => 
      c.name.toLowerCase().includes(lower) || 
      c.phone.includes(lower) || 
      (c.email && c.email.toLowerCase().includes(lower))
    );
  }, [customerData, customerSearchTerm]);

  const filteredStaff = useMemo(() => {
    if (!staffSearchTerm) return staff;
    const lower = staffSearchTerm.toLowerCase();
    return staff.filter((s: any) => 
      s.name.toLowerCase().includes(lower) || 
      (s.role && s.role.toLowerCase().includes(lower)) ||
      (s.phone && s.phone.includes(lower)) ||
      (s.email && s.email.toLowerCase().includes(lower))
    );
  }, [staff, staffSearchTerm]);

  const filteredBookings = useMemo(() => {
    let currentBookings = bookings;

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentBookings = currentBookings.filter(
        (booking) =>
          booking.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          booking.phone.includes(lowerCaseSearchTerm) ||
          (booking.email && booking.email.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    if (selectedServiceFilter) {
      currentBookings = currentBookings.filter((booking) => booking.service === selectedServiceFilter);
    }
    if (selectedDateFilter) {
      currentBookings = currentBookings.filter((booking) => booking.preferred_time.startsWith(selectedDateFilter));
    }
    if (selectedStatusFilter) {
      currentBookings = currentBookings.filter((booking) => {
        const status = booking.status || "Pending";
        return status === selectedStatusFilter;
      });
    }
    return currentBookings;
  }, [bookings, searchTerm, selectedServiceFilter, selectedDateFilter, selectedStatusFilter]);

  const PaginationControls = ({ total, totalItems }: { total: number, totalItems: number }) => {
    const from = ((currentPage - 1) * ITEMS_PER_PAGE) + 1;
    const to = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
    
    return (
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Showing <span className="font-bold text-gray-800">{from}</span> to <span className="font-bold text-gray-800">{to}</span> of <span className="font-bold text-gray-800">{totalItems}</span>
        </p>
        {total > 1 && (
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(total, prev + 1))}
              disabled={currentPage === total}
              className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "Appointments", label: "Appointments", icon: CalendarCheck },
    { id: "Customers", label: "Customers", icon: Users },
    { id: "Services", label: "Services", icon: Scissors },
    { id: "Staff", label: "Staff", icon: UserCog },
    { id: "Billing", label: "Billing", icon: ReceiptIndianRupee },
    // { id: "Inventory", label: "Inventory", icon: PackageSearch },
    // { id: "Reports", label: "Reports", icon: BarChart3 },
    // { id: "Offers", label: "Offers", icon: Gift },
    // { id: "Settings", label: "Settings", icon: Settings },
  ];

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout failed:", error.message);
    }
    navigate("/");
  };

  // Sidebar for Desktop
  const Sidebar = () => (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 pt-20">
      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeTab === item.id 
                ? "bg-pink-50 text-pink-600 shadow-sm" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </div>
      <div className="p-4 border-t">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-500 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );

  // Bottom Nav for Mobile
  const MobileNav = () => (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center px-2 py-3 z-50">
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`flex flex-col items-center gap-1 min-w-[60px] ${
            activeTab === item.id ? "text-pink-600" : "text-gray-400"
          }`}
        >
          <item.icon size={20} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 pt-24 pb-24 md:pb-12 px-4 md:px-8">
        {/* Top bar for mobile and general actions */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{activeTab}</h1>
            <p className="text-sm text-gray-500 hidden md:block">
              {tabDescriptions[activeTab as Section] || "Manage your salon's daily operations and growth."}
            </p>
          </div>
        </div>

        {orgError && (
          <div className="mb-6 p-6 bg-amber-50 border border-amber-200 rounded-3xl flex items-center gap-4 text-amber-800 animate-in fade-in slide-in-from-top-2 duration-500">
            <AlertCircle className="shrink-0" size={24} />
            <div>
              <p className="font-bold">Configuration Issue</p>
              <p className="text-sm opacity-90">{orgError} Please run the mapping SQL script in Supabase.</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]">
          {activeTab === "Dashboard" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in duration-500">
              <div className="space-y-10">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Overall Bookings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {[
                      { label: "Total Bookings", value: kpiData.totalAppointments, color: "bg-blue-50 text-blue-600", icon: CalendarCheck },
                      { label: "Current Week", value: kpiData.currentWeekAppointments, color: "bg-purple-50 text-purple-600", icon: CalendarCheck },
                    ].map((stat) => (
                      <div key={stat.label} className={`${stat.color} p-5 rounded-2xl flex flex-col items-center text-center sm:items-start sm:text-left`}>
                        {stat.icon && <stat.icon size={24} className="mb-2 opacity-80" />}
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{stat.label}</p>
                        <p className="text-xl md:text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Status Wise Bookings</h3>
                  <div className="grid grid-cols-2 gap-4 md:gap-6">
                    {[
                      { label: "Pending", value: kpiData.pendingAppointments, color: "bg-yellow-50 text-yellow-600", icon: CalendarCheck },
                      { label: "Confirmed", value: kpiData.confirmedAppointments, color: "bg-blue-50 text-blue-600", icon: CalendarCheck },
                      { label: "Completed", value: kpiData.completedAppointments, color: "bg-teal-50 text-teal-600", icon: CheckCircle2 },
                      { label: "Cancelled/No Show", value: kpiData.cancelledNoShowAppointments, color: "bg-red-50 text-red-600", icon: Trash2 },
                    ].map((stat) => (
                      <div key={stat.label} className={`${stat.color} p-5 rounded-2xl flex flex-col items-center text-center sm:items-start sm:text-left`}>
                        {stat.icon && <stat.icon size={24} className="mb-2 opacity-80" />}
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{stat.label}</p>
                        <p className="text-xl md:text-2xl font-bold mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Financial Summary</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                    {[
                      { label: "Overall Revenue", value: `₹${kpiData.totalRevenue.toLocaleString('en-IN')}`, color: "bg-emerald-50 text-emerald-600", icon: ReceiptIndianRupee },
                      { 
                        label: "Today's Profit", 
                        value: `₹${kpiData.todayRevenue.toLocaleString('en-IN')}`, 
                        subValue: `Yesterday: ₹${kpiData.yesterdayRevenue.toLocaleString('en-IN')}`,
                        color: "bg-pink-50 text-pink-600", 
                        icon: kpiData.profitTrend === 'up' ? TrendingUp : kpiData.profitTrend === 'down' ? TrendingDown : Minus 
                      },
                    ].map((stat) => (
                      <div key={stat.label} className={`${stat.color} p-5 rounded-2xl flex flex-col items-center text-center sm:items-start sm:text-left`}>
                        {stat.icon && <stat.icon size={24} className="mb-2 opacity-80" />}
                        <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{stat.label}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xl md:text-3xl font-black">{stat.value}</p>
                        </div>
                        {stat.subValue && (
                          <p className="text-[11px] font-medium opacity-80 mt-1">{stat.subValue}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                <div className="bg-gray-50 p-6 rounded-2xl border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <CalendarCheck size={18} /> Upcoming appointments
                    </h3>
                    <div className="flex bg-white p-1 rounded-lg border border-gray-100 shadow-sm self-start text-xs" role="tablist">
                      <button 
                        onClick={() => {
                          setBookingView("date");
                          setSelectedDateIndex(null);
                          setUpcomingGridSearchTerm(""); // Clear search term when switching to date view
                        }}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${bookingView === "date" ? "bg-pink-50 text-pink-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        Date View
                      </button>
                      <button 
                        onClick={() => {
                          setBookingView("grid");
                          setSelectedDateIndex(null);
                          setUpcomingGridSearchTerm(""); // Clear search term when switching to grid view
                        }}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all ${bookingView === "grid" ? "bg-pink-50 text-pink-600 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                      >
                        Grid View
                      </button>
                    </div>
                  </div>

                  {bookingView === "grid" ? (
                    <>
                      <input
                        type="text"
                        placeholder="Search by customer name..."
                        value={upcomingGridSearchTerm}
                        onChange={(e) => setUpcomingGridSearchTerm(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white mb-4"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-3 max-h-[28rem] overflow-y-auto pr-2">
                      {bookings
                        .filter(b => (b.status || "Pending") === "Pending" || b.status === "Confirmed")
                        .filter(b => b.name.toLowerCase().includes(upcomingGridSearchTerm.toLowerCase()))
                        .sort((a, b) => new Date(b.created_on).getTime() - new Date(a.created_on).getTime())
                        .map(booking => (
                        <div key={booking.id} className="flex flex-col bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-pink-200 transition-all min-w-0 gap-1">
                          <p className="text-sm font-bold text-gray-800 truncate">{booking.name}</p>
                          <p className="text-[11px] font-medium text-pink-600 truncate">{booking.service}</p>
                          <p className="text-[10px] text-gray-500 mb-1">{formatBookingDate(booking.preferred_time)}</p>
                          <div className="flex">
                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${STATUS_CONFIG[(booking.status as BookingStatus) || 'Pending']?.color || 'bg-gray-100'}`}>
                              {booking.status || 'Pending'}
                            </span>
                          </div>
                        </div>
                      ))}
                      {bookings.filter(b => (b.status || "Pending") === "Pending" || b.status === "Confirmed").filter(b => b.name.toLowerCase().includes(upcomingGridSearchTerm.toLowerCase())).length === 0 && (
                        <p className="col-span-full text-center text-sm text-gray-400 py-10 italic border-2 border-dashed border-gray-100 rounded-2xl">No upcoming appointments found</p>
                      )}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => {
                              setWeekOffset(prev => prev - 1);
                              setSelectedDateIndex(null);
                            }} 
                            className="p-1 hover:bg-white rounded border border-gray-100 shadow-sm transition-all"
                          >
                            <ChevronLeft size={14} />
                          </button>
                          <div className="relative">
                            <button 
                              onClick={() => (document.getElementById('dash-week-picker') as HTMLInputElement)?.showPicker()}
                              className="text-[10px] font-bold text-gray-600 bg-white px-2 py-1 rounded border border-gray-100 min-w-[100px] text-center hover:border-pink-300 hover:text-pink-600 transition-all flex items-center gap-1.5 group"
                            >
                              <Calendar size={12} className="text-gray-400 group-hover:text-pink-500" />
                              {upcomingBookingsWeekData[0].dateLabel} - {upcomingBookingsWeekData[6].dateLabel}
                            </button>
                            <input 
                              id="dash-week-picker"
                              type="date"
                              className="absolute opacity-0 pointer-events-none w-0 h-0"
                              onChange={handleWeekDateSelect}
                            />
                          </div>
                          <button 
                            onClick={() => {
                              setWeekOffset(prev => prev + 1);
                              setSelectedDateIndex(null);
                            }} 
                            className="p-1 hover:bg-white rounded border border-gray-100 shadow-sm transition-all"
                          >
                            <ChevronRight size={14} />
                          </button>
                        </div>
                        {weekOffset !== 0 && (
                          <button 
                            onClick={() => {
                              setWeekOffset(0);
                              setSelectedDateIndex(null);
                            }} 
                            className="text-[10px] font-bold text-pink-600 hover:underline"
                          >
                            Today
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {upcomingBookingsWeekData.map((day, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => setSelectedDateIndex(idx === selectedDateIndex ? null : idx)}
                            className={`flex flex-col items-center p-2 rounded-xl border transition-all cursor-pointer hover:border-pink-300 ${day.isToday ? 'bg-pink-50 border-pink-200 shadow-sm' : 'bg-white border-gray-100'} ${selectedDateIndex === idx ? 'ring-2 ring-pink-500 border-transparent shadow-md' : ''}`}
                          >
                            <span className={`text-[8px] font-bold uppercase tracking-tighter ${day.isToday ? 'text-pink-600' : 'text-gray-400'}`}>{day.dayLabel}</span>
                            <span className={`text-xs font-black my-1 ${day.isToday ? 'text-pink-700' : 'text-gray-700'}`}>{day.dateLabel.split(' ')[0]}</span>
                            <div className="mt-1 flex flex-col gap-1 w-full">
                              {day.bookings.length > 0 ? (
                                <>
                                  {/* {day.bookings.slice(0, 1).map(b => (
                                    <div key={b.id} className="w-full h-1 bg-pink-400 rounded-full" title={`${b.name}: ${b.service}`} />
                                  ))}
                                  {day.bookings.length > 1 && <div className="text-[8px] font-bold text-center text-pink-500">+{day.bookings.length - 1}</div>} */}
                                  <div className="text-[9px] font-bold text-center text-gray-800 mt-1">{day.bookings.length}</div>
                                </>
                              ) : (
                                <div className="text-[9px] text-gray-300 text-center font-medium mt-1">0</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {selectedDateIndex !== null && (
                        <div className="mt-4 p-4 bg-white rounded-2xl border border-pink-100 shadow-sm animate-in fade-in slide-in-from-top-2">
                           <div className="flex justify-between items-center mb-3">
                             <h4 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider">
                               Appointments for {upcomingBookingsWeekData[selectedDateIndex].dayLabel}, {upcomingBookingsWeekData[selectedDateIndex].dateLabel}
                             </h4>
                             <button onClick={() => setSelectedDateIndex(null)} className="text-gray-400 hover:text-gray-600">
                               <X size={14} />
                             </button>
                           </div>
                           <div className="space-y-2">
                             {upcomingBookingsWeekData[selectedDateIndex].bookings.length > 0 ? (
                               upcomingBookingsWeekData[selectedDateIndex].bookings.map(booking => (
                                 <div key={booking.id} className="flex items-center justify-between p-2 rounded-xl border border-gray-50 bg-gray-50/50">
                                   <div>
                                     <p className="text-xs font-bold text-gray-800">{booking.name}</p>
                                     <p className="text-[10px] text-gray-500">{booking.service} • {formatBookingDate(booking.preferred_time)}</p>
                                   </div>
                                   <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase ${STATUS_CONFIG[(booking.status as BookingStatus) || 'Pending']?.color || 'bg-gray-100'}`}>
                                     {booking.status || 'Pending'}
                                   </span>
                                 </div>
                               ))
                             ) : (
                               <p className="text-center text-[10px] text-gray-400 py-4 italic">No appointments scheduled for this day</p>
                             )}
                           </div>
                        </div>
                      )}

                      <p className="text-[10px] text-center text-gray-400 italic">Showing Pending & Confirmed appointments for the week</p>
                    </div>
                  )}
                </div>
                <div className="space-y-8">
                  {/* Week Navigation Controls */}
                  <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <BarChart3 size={18} className="text-pink-600" />
                      <span className="text-sm font-bold text-gray-800">Weekly Performance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setWeekOffset(prev => prev - 1)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        title="Previous Week"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <div className="text-[11px] font-bold text-gray-600 bg-gray-50 px-3 py-1 rounded-lg border min-w-[140px] text-center">
                        {performanceData[0].dateLabel} - {performanceData[6].dateLabel}
                      </div>
                      <button 
                        onClick={() => setWeekOffset(prev => prev + 1)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        title="Next Week"
                      >
                        <ChevronRight size={18} />
                      </button>
                      {weekOffset !== 0 && (
                        <button 
                          onClick={() => setWeekOffset(0)}
                          className="ml-2 text-[10px] font-bold text-pink-600 hover:underline border-l pl-3"
                        >
                          Current Week
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Booking Frequency Chart */}
                  <div className="bg-gray-50 p-6 rounded-2xl border">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      Booking Frequency
                    </h3>
                    <div className="h-32 flex items-end justify-between gap-2 px-2">
                      {performanceData.map((day, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-pink-100 hover:bg-pink-500 transition-all rounded-t-xl group relative cursor-pointer" 
                          style={{ height: `${Math.max(day.countHeight, 8)}%` }}
                        >
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                            {day.count} {day.count === 1 ? 'Booking' : 'Bookings'}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[9px] font-bold text-gray-400 px-1 uppercase tracking-tighter">
                      {performanceData.map((day, i) => (
                        <div key={i} className="flex flex-col items-center w-8 text-center">
                          <span>{day.dayLabel}</span>
                          <span className="text-[8px] opacity-70">{day.dateLabel}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Revenue Trend Chart */}
                  <div className="bg-gray-50 p-6 rounded-2xl border">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <LineChart size={18} /> Revenue Trend
                    </h3>
                    <div className="h-32 flex items-start justify-between relative mt-10">
                      {/* Line connecting points */}
                      <svg className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 700 100">
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d={`${performanceData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * 100 + 50} ${90 - d.revenueHeight}`).join(' ')} L 650 100 L 50 100 Z`}
                          fill="url(#revenueGradient)"
                        />
                        <path
                          d={performanceData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * 100 + 50} ${90 - d.revenueHeight}`).join(' ')}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      
                      {performanceData.map((day, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center group relative cursor-pointer z-10 h-full">
                          <div 
                            className="w-3.5 h-3.5 bg-white border-[3px] border-emerald-500 rounded-full group-hover:bg-emerald-500 transition-colors shadow-sm"
                            style={{ position: 'absolute', top: `${90 - day.revenueHeight}%`, transform: 'translateY(-50%)' }}
                          />
                          <div className="absolute left-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none z-20 shadow-xl"
                               style={{ top: `${90 - day.revenueHeight}%`, transform: 'translate(-50%, -150%)' }}>
                            ₹{day.revenue.toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[9px] font-bold text-gray-400 px-1 uppercase tracking-tighter">
                      {performanceData.map((day, i) => (
                        <div key={i} className="flex flex-col items-center w-8 text-center">
                          <span>{day.dayLabel}</span>
                          <span className="text-[8px] opacity-70">{day.dateLabel}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Appointments" && (
             <div className="animate-in slide-in-from-right-2 duration-300">
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <input
                  type="text"
                  placeholder="Search by name, phone, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-1/3 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                />
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  <select
                    value={selectedServiceFilter}
                    onChange={(e) => setSelectedServiceFilter(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                  >
                    <option value="">All Services</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                  />
                  <select
                    value={selectedStatusFilter}
                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                  >
                    <option value="">All Statuses</option>
                    {Object.keys(STATUS_CONFIG).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  {(searchTerm || selectedServiceFilter || selectedDateFilter || selectedStatusFilter) && (
                    <button onClick={() => { setSearchTerm(""); setSelectedServiceFilter(""); setSelectedDateFilter(""); setSelectedStatusFilter(""); }} className="text-gray-500 hover:text-pink-600 text-sm">
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
              <div className="border border-gray-100 rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-320px)] bg-white shadow-sm">
                <div className="overflow-auto flex-1">
                  <table className="w-full text-left text-sm border-separate border-spacing-0">
                    <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Customer</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 min-w-[180px]">Time</th>
                      <th className="px-4 py-3">Staff</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3 rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredBookings.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 font-medium">
                          <div className="flex items-center gap-2">
                            {booking.name}
                            {booking.status === "Completed" && (() => {
                              const payment = payments.find(p => p.booking_id === booking.id);
                              return payment?.status === "paid" ? (
                                <CheckCircle2 size={16} className="text-green-600" title="Payment Done" />
                              ) : (
                                <AlertCircle size={16} className="text-red-500" title="Payment Pending" />
                              );
                            })()}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-600">{booking.service}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_CONFIG[(booking.status as BookingStatus) || "Pending"]?.color}`}>
                            {booking.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-500">
                          {formatBookingDate(booking.preferred_time)}
                        </td>
                        <td className="px-4 py-4 text-xs font-medium text-gray-600">
                          {booking.staff?.name || <span className="text-gray-300 italic">Unassigned</span>}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-gray-700 font-bold">{booking.phone}</p>
                          <p className="text-[10px] text-gray-400">{booking.email || "N/A"}</p>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {editingId === booking.id ? (
                              <div className="flex flex-col gap-2 animate-in fade-in zoom-in duration-200 bg-gray-50 p-2 rounded-xl border border-gray-200 min-w-[180px]">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[8px] text-gray-400 uppercase font-bold">Status</span>
                                  <select
                                    className="text-[10px] font-bold border rounded-lg px-2 py-1 focus:ring-2 focus:ring-pink-400 outline-none bg-white flex-1"
                                    value={editTempStatus || "Pending"}
                                    onChange={(e) => setEditTempStatus(e.target.value as BookingStatus)}
                                  >
                                    {Object.keys(STATUS_CONFIG).map((status) => (
                                      <option key={status} value={status}>{status}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[8px] text-gray-400 uppercase font-bold">Staff</span>
                                  <select
                                    className="text-[10px] font-bold border rounded-lg px-2 py-1 focus:ring-2 focus:ring-pink-400 outline-none bg-white flex-1"
                                    value={editTempStaffId || ""}
                                    onChange={(e) => setEditTempStaffId(e.target.value)}
                                  >
                                    <option value="">Unassigned</option>
                                    {staff.map((s) => (
                                      <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex gap-2 justify-end mt-1 border-t pt-2">
                                  <button 
                                    onClick={() => {
                                      setEditingId(null);
                                      setEditTempStatus(null);
                                      setEditTempStaffId(null);
                                    }}
                                    className="text-[10px] font-bold text-gray-500 hover:text-gray-700 px-2 py-1"
                                  >
                                    Cancel
                                  </button>
                                  <button 
                                    onClick={() => handleSaveEdit(booking.id)}
                                    className="text-[10px] font-bold bg-pink-600 text-white rounded-lg px-3 py-1 hover:bg-pink-700 transition-colors shadow-sm"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-wrap gap-2">
                                  {STATUS_CONFIG[(booking.status as BookingStatus) || "Pending"]?.next.map(nextStatus => (
                                    <button
                                      key={nextStatus}
                                      onClick={() => {
                                        if (nextStatus === "In Progress" && !booking.staff_id) {
                                          // Trigger edit mode to ask for staff assignment
                                          setEditingId(booking.id);
                                          setEditTempStatus("In Progress");
                                          setEditTempStaffId("");
                                          return;
                                        }
                                        handleStatusChange(booking.id, nextStatus);
                                      }}
                                      className={`px-2 py-1 rounded-md text-[10px] font-bold border transition-all ${
                                        nextStatus === 'Confirmed' ? 'border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white' :
                                        nextStatus === 'In Progress' ? 'border-purple-200 text-purple-600 hover:bg-purple-600 hover:text-white' :
                                        nextStatus === 'Completed' ? 'border-green-200 text-green-600 hover:bg-green-600 hover:text-white' :
                                        'border-red-200 text-red-600 hover:bg-red-600 hover:text-white'
                                      }`}
                                    >
                                      {nextStatus === 'In Progress' ? 'Start' : nextStatus}
                                    </button>
                                  ))}
                                  {(STATUS_CONFIG[(booking.status as BookingStatus) || "Pending"]?.next.length === 0) && (
                                    <span className="text-gray-400 italic text-[10px] flex items-center gap-1">
                                      <CheckCircle2 size={12} /> Finalized
                                    </span>
                                  )}
                                </div>
                                {booking.status !== "Completed" && (
                                  <div className="flex items-center ml-auto border-l pl-2 gap-1">
                                    <button 
                                      onClick={() => {
                                        setEditingId(booking.id);
                                        setEditTempStatus((booking.status as BookingStatus) || "Pending");
                                        setEditTempStaffId(booking.staff_id || "");
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                      title="Edit Status"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 z-20">
                  <PaginationControls total={Math.ceil(filteredBookings.length / ITEMS_PER_PAGE)} totalItems={filteredBookings.length} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Customers" && (
            <div className="animate-in slide-in-from-right-2 duration-300">
              {!selectedCustomerPhone ? (
                <>
                  <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                    <input
                      type="text"
                      placeholder="Search by name, phone, or email..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      className="w-full md:w-1/3 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                    />
                    <button 
                      onClick={() => setIsCustomerFormOpen(true)}
                      className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-pink-700 transition-all ml-auto"
                    >
                      <Plus size={18} />
                      Add Customer
                    </button>
                  </div>

                  {isCustomerFormOpen && (
                    <div className="mb-8 p-6 border border-pink-100 bg-pink-50 rounded-2xl animate-in fade-in duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Register New Customer</h3>
                        <button onClick={() => setIsCustomerFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={20} />
                        </button>
                      </div>
                      <form onSubmit={handleCustomerSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                          placeholder="Full Name *"
                          value={customerForm.name}
                          onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
                          required
                        />
                        <input
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                          placeholder="Phone Number (Unique) *"
                          value={customerForm.phone}
                          onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                          required
                        />
                        <input
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                          placeholder="Email Address"
                          type="email"
                          value={customerForm.email}
                          onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                        />
                        <select
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                          value={customerForm.service}
                          onChange={(e) => setCustomerForm({ ...customerForm, service: e.target.value })}
                          required
                        >
                          <option value="">Select Initial Service *</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                          <select
                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                            value={customerForm.staff_id}
                            onChange={(e) => setCustomerForm({ ...customerForm, staff_id: e.target.value })}
                          >
                            <option value="">Assign Staff (Optional)</option>
                            {staff.map((s) => (
                              <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                            ))}
                          </select>
                        <input
                          type="datetime-local"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white md:col-span-2"
                          value={customerForm.preferred_time}
                          onChange={(e) => setCustomerForm({ ...customerForm, preferred_time: e.target.value })}
                          required
                        />
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => setIsCustomerFormOpen(false)}
                            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-pink-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-pink-700"
                          >
                            Save Customer
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="border border-gray-100 rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-320px)] bg-white shadow-sm">
                    <div className="overflow-auto flex-1">
                      <table className="w-full text-left text-sm border-separate border-spacing-0">
                        <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0 z-10">
                        <tr>
                          <th className="px-4 py-3 rounded-l-xl">Customer Name</th>
                          <th className="px-4 py-3">Contact Info</th>
                          <th className="px-4 py-3 text-center">Visits</th>
                          <th className="px-4 py-3">Last Visit</th>
                          <th className="px-4 py-3 rounded-r-xl">History</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filteredCustomers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((customer: any) => (
                          <tr key={customer.phone} className="hover:bg-gray-50">
                            <td className="px-4 py-4 font-bold text-gray-800">
                              {customer.name}
                              {customer.names.length > 1 && (
                                <span
                                  className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold relative group cursor-help"
                                >
                                  +{customer.names.length - 1}
                                  <div className="absolute hidden group-hover:block bg-gray-800 text-white text-xs p-2 rounded-md shadow-lg z-10 -mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                    {customer.names.map((n: string) => <div key={n}>{n}</div>)}
                                  </div>
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-gray-700">{customer.phone}</p>
                              <p className="text-[10px] text-gray-400">{customer.email || 'No Email'}</p>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded-lg font-bold text-xs">
                                {customer.totalBookings}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-gray-500 text-xs">
                              {new Date(customer.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="px-4 py-4">
                              <button 
                                onClick={() => setSelectedCustomerPhone(customer.phone)}
                                className="text-pink-600 font-bold hover:underline text-xs flex items-center gap-1"
                              >
                                View History
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                    <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 z-20">
                      <PaginationControls total={Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE)} totalItems={filteredCustomers.length} />
                    </div>
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <button 
                      onClick={() => {
                        setSelectedCustomerPhone(null);
                        setIsAddAppointmentFormOpen(false);
                      }}
                      className="text-pink-600 font-bold text-sm flex items-center gap-2 hover:bg-pink-50 px-3 py-2 rounded-xl transition-all"
                    >
                      ← Back to Customers
                    </button>
                    <button 
                      onClick={() => setIsAddAppointmentFormOpen(true)}
                      className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-pink-700 transition-all"
                    >
                      <Plus size={18} />
                      Book Appointment
                    </button>
                  </div>

                  {isAddAppointmentFormOpen && (
                    <div className="mb-8 p-6 border border-pink-100 bg-pink-50 rounded-2xl animate-in fade-in duration-300">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">New Appointment for {customerData.find(c => c.phone === selectedCustomerPhone)?.name}</h3>
                        <button onClick={() => setIsAddAppointmentFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                          <X size={20} />
                        </button>
                      </div>
                      <form onSubmit={handleAddAppointmentSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                          value={newAppointmentForm.service}
                          onChange={(e) => setNewAppointmentForm({ ...newAppointmentForm, service: e.target.value })}
                          required
                        >
                          <option value="">Select Service *</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                          <select
                            name="staff_id"
                            className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                          >
                            <option value="">Assign Staff (Optional)</option>
                            {staff.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        <input
                          type="datetime-local"
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                          value={newAppointmentForm.preferred_time}
                          onChange={(e) => setNewAppointmentForm({ ...newAppointmentForm, preferred_time: e.target.value })}
                          required
                        />
                        <textarea
                          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white md:col-span-2"
                          placeholder="Optional notes"
                          value={newAppointmentForm.notes}
                          onChange={(e) => setNewAppointmentForm({ ...newAppointmentForm, notes: e.target.value })}
                        />
                        <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                          <button
                            type="button"
                            onClick={() => setIsAddAppointmentFormOpen(false)}
                            className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-pink-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-pink-700"
                          >
                            Confirm Booking
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                  
                  {(() => {
                    const selected = customerData.find(c => c.phone === selectedCustomerPhone);
                    return (
                      <div className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                          <h3 className="text-2xl font-bold text-gray-800">{selected?.name}</h3>
                          <p className="text-gray-500">{selected?.phone} • {selected?.email || 'No email provided'}</p>
                        </div>
                        
                        <h4 className="font-bold text-gray-700 uppercase text-xs tracking-widest px-1">Booking History</h4>
                        <div className="border border-gray-100 rounded-2xl overflow-hidden flex flex-col max-h-[450px] bg-white shadow-sm">
                          <div className="overflow-auto flex-1 p-4 space-y-3">
                            {selected?.history.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((booking: any) => (
                            <div key={booking.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-gray-800">{booking.service}</p>
                                  {booking.status === "Completed" && (() => {
                                    const payment = payments.find(p => p.booking_id === booking.id);
                                    return payment?.status === "paid" ? (
                                      <CheckCircle2 size={16} className="text-green-600" title="Payment Done" />
                                    ) : (
                                      <AlertCircle size={16} className="text-red-500" title="Payment Pending" />
                                    );
                                  })()}
                                </div>
                                <p className="text-xs text-gray-400">
                                  {new Date(booking.created_on).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                                {booking.notes && <p className="text-[10px] text-pink-500 mt-1 italic">Note: {booking.notes}</p>}
                              </div>
                              <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider ${STATUS_CONFIG[booking.status as BookingStatus]?.color || 'bg-gray-100'}`}>
                                {booking.status || "Pending"}
                              </span>
                            </div>
                          ))}
                          </div>
                          <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 z-20">
                            <PaginationControls total={Math.ceil((selected?.history?.length || 0) / ITEMS_PER_PAGE)} totalItems={selected?.history?.length || 0} />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
              {filteredCustomers.length === 0 && !loading && (
                <p className="text-center text-gray-400 py-10 italic">
                  {customerSearchTerm ? "No customers match your search." : "No customer data available."}
                </p>
              )}
            </div>
          )}

          {activeTab === "Staff" && (
            <div className="animate-in slide-in-from-right-2 duration-300">
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={staffSearchTerm}
                  onChange={(e) => setStaffSearchTerm(e.target.value)}
                  className="w-full md:w-1/3 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                />
                <button 
                  onClick={() => {
                    setEditingStaffId(null);
                    setStaffForm({ name: "", role: "", phone: "", email: "" });
                    setIsStaffFormOpen(true);
                  }}
                  className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-pink-700 transition-all ml-auto"
                >
                  <Plus size={18} />
                  Add Staff
                </button>
              </div>

              {isStaffFormOpen && (
                <div className="mb-8 p-6 border border-pink-100 bg-pink-50 rounded-2xl animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">{editingStaffId ? 'Edit' : 'Add New'} Staff Member</h3>
                    <button onClick={() => setIsStaffFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                  </div>
                  <form onSubmit={handleStaffSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white" placeholder="Full Name" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} required />
                    <input className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white" placeholder="Role (e.g. Senior Beautician)" value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} required />
                    <input className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white" placeholder="Phone" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} />
                    <input className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white" placeholder="Email" type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} />
                    <div className="md:col-span-2 flex justify-end gap-3">
                      <button type="button" onClick={() => setIsStaffFormOpen(false)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                      <button type="submit" className="bg-pink-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-pink-700">{editingStaffId ? 'Update' : 'Save'} Staff</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="border border-gray-100 rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-320px)] bg-white shadow-sm">
                <div className="overflow-auto flex-1">
                  <table className="w-full text-left text-sm border-separate border-spacing-0">
                    <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Name</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3 rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredStaff.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 font-bold text-gray-800">{member.name}</td>
                        <td className="px-4 py-4">
                          <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase">{member.role}</span>
                        </td>
                        <td className="px-4 py-4 text-xs text-gray-500">
                          <p>{member.phone}</p>
                          <p>{member.email}</p>
                        </td>
                        <td className="px-4 py-4 flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingStaffId(member.id);
                              setStaffForm({ name: member.name, role: member.role || "", phone: member.phone || "", email: member.email || "" });
                              setIsStaffFormOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteStaff(member.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 z-20">
                  <PaginationControls total={Math.ceil(filteredStaff.length / ITEMS_PER_PAGE)} totalItems={filteredStaff.length} />
                </div>
              </div>
              {filteredStaff.length === 0 && !loading && (
                <p className="text-center text-gray-400 py-10 italic">
                  {staffSearchTerm ? "No staff members match your search." : "No staff data available."}
                </p>
              )}
            </div>
          )}

          {activeTab === "Services" && (
             <div className="animate-in slide-in-from-right-2 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Manage Services</h2>
                <button 
                  onClick={() => {
                    setEditingServiceId(null);
                    setServiceForm({ name: "", description: "", price: "", duration: "" });
                    setIsServiceFormOpen(true);
                  }}
                  className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-pink-700 transition-all"
                >
                  <Plus size={18} />
                  Add Service
                </button>
              </div>

              {isServiceFormOpen && (
                <div className="mb-8 p-6 border border-pink-100 bg-pink-50 rounded-2xl animate-in fade-in duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">{editingServiceId ? 'Edit' : 'Add New'} Service</h3>
                    <button onClick={() => setIsServiceFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={handleServiceSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                      placeholder="Service Name"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      required
                    />
                    <input
                      type="number"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                      placeholder="Price (e.g. 500)"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                      required
                    />
                    <input
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white"
                      placeholder="Duration (e.g. 45 mins)"
                      value={serviceForm.duration}
                      onChange={(e) => setServiceForm({ ...serviceForm, duration: e.target.value })}
                      required
                    />
                    <textarea
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white md:col-span-2"
                      placeholder="Description"
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                    />
                    <div className="md:col-span-2 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsServiceFormOpen(false)}
                        className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-pink-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-pink-700"
                      >
                        {editingServiceId ? 'Update' : 'Save'} Service
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="border border-gray-100 rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-320px)] bg-white shadow-sm">
                <div className="overflow-auto flex-1">
                  <table className="w-full text-left text-sm border-separate border-spacing-0">
                    <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Service Name</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Duration</th>
                      <th className="px-4 py-3 rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {services.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 font-bold text-gray-800">{service.name}</td>
                        <td className="px-4 py-4 text-gray-500 text-xs max-w-xs">{service.description}</td>
                        <td className="px-4 py-4 font-semibold text-pink-600">{service.price}</td>
                        <td className="px-4 py-4 text-gray-500">{service.duration}</td>
                        <td className="px-4 py-4 flex gap-2">
                          <button 
                            onClick={() => {
                              setEditingServiceId(service.id);
                              setServiceForm({
                                name: service.name,
                                description: service.description || "",
                                price: service.price || "",
                                duration: service.duration || ""
                              });
                              setIsServiceFormOpen(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteService(service.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 z-20">
                  <PaginationControls total={Math.ceil(services.length / ITEMS_PER_PAGE)} totalItems={services.length} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "Inventory" && (
             <div className="animate-in slide-in-from-right-2 duration-300">
              <h2 className="text-xl font-bold mb-4">Stock Management</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border border-red-100 bg-red-50 rounded-xl">
                  <p className="text-red-800 font-bold text-sm">Low Stock Alert!</p>
                  <p className="text-red-600 text-xs mt-1">L'Oreal Professional Shampoo - Only 2 units left</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Billing" && (
            <div className="animate-in slide-in-from-right-2 duration-300">
              <h2 className="text-xl font-bold mb-6 text-gray-800">Billing & Payments</h2>
              <div className="border border-gray-100 rounded-2xl overflow-hidden flex flex-col max-h-[calc(100vh-320px)] bg-white shadow-sm">
                <div className="overflow-auto flex-1">
                  <table className="w-full text-left text-sm border-separate border-spacing-0">
                    <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Customer</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Payment Done Time</th>
                      <th className="px-4 py-3 rounded-r-xl text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {payments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4">
                          <p className="font-bold text-gray-800">{payment.booking?.name || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-4 text-gray-600">{payment.booking?.service || 'N/A'}</td>
                        <td className="px-4 py-4 font-semibold text-pink-600">
                          {payment.amount?.toString().includes('₹') ? payment.amount.replace(' onwards', '') : `₹${payment.amount}`}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-xs">
                          {payment.booking?.preferred_time ? formatBookingDate(payment.booking.preferred_time) : 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-gray-500 text-xs">
                          {payment.status === 'paid' && payment.updated_at ? formatBookingDate(payment.updated_at) : 'N/A'}
                        </td>
                        <td className="px-4 py-4 text-right">
                          {payment.status === 'pending' && (
                            <button
                              onClick={() => handlePaymentStatusChange(payment.id, 'paid')}
                              className="text-pink-600 font-bold hover:underline text-xs"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 z-20">
                  <PaginationControls total={Math.ceil(payments.length / ITEMS_PER_PAGE)} totalItems={payments.length} />
                </div>
              </div>
              {payments.length === 0 && !loading && (
                <p className="text-center text-gray-400 py-10 italic">No payment records found.</p>
              )}
            </div>
          )}

          {!["Dashboard", "Appointments", "Customers", "Services", "Staff", "Inventory", "Billing"].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-[400px] text-gray-400">
              <Settings size={48} className="mb-4 opacity-20" />
              <p className="font-medium italic">{activeTab} module is coming soon...</p>
            </div>
          )}
        </div>
      </main>

      <MobileNav />
    </div>
  );
}