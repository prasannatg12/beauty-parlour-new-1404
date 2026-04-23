import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../hooks/supabaseClient";
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Users, 
  Scissors, 
  UserCog, 
  ReceiptIndianRupee, 
  PackageSearch, 
  BarChart3, 
  Gift,
  CheckCircle2,
  Trash2,
  Pencil,
  Settings, 
  LogOut,
  MoreHorizontal,
  X
} from "lucide-react";

type Section = 
  | "Dashboard" | "Appointments" | "Customers" | "Services" 
  | "Staff" | "Billing" | "Inventory" | "Reports" 
  | "Offers" | "Settings";

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

// Helper to check if a date is in the current week
const isCurrentWeek = (dateString: string) => {
  const bookingDate = new Date(dateString);
  const today = new Date();
  
  const firstDayOfWeek = new Date(today);
  firstDayOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
  firstDayOfWeek.setHours(0, 0, 0, 0);

  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6); // Saturday
  lastDayOfWeek.setHours(23, 59, 59, 999);

  return bookingDate >= firstDayOfWeek && bookingDate <= lastDayOfWeek;
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [bookings, setBookings] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBookings = async () => {
    const { data, error } = await supabase
      .from("booking")
      .select("*")
      .order("created_on", { ascending: false });
      
    if (error) {
      console.error("Error fetching bookings:", error);
    } else {
      setBookings(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
      } else {
        if (activeTab === "Appointments" || activeTab === "Dashboard") {
          fetchBookings();
        } else {
          setLoading(false);
        }
      }
    };

    checkSession();
  }, [navigate, activeTab]);

  // Real-time subscription for booking updates
  useEffect(() => {
    const channel = supabase
      .channel('admin-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'booking' },
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
    try {
      await updateBookingStatus(bookingId, newStatus);
      
      // Update local state for immediate feedback
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      
      // Automation Logic
      if (newStatus === "Completed") {
        console.log("Trigger: Auto-generate bill for booking", bookingId);
        // setActiveTab("Billing"); // Optional: Navigate to billing
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

  const kpiData = useMemo(() => {
    const totalAppointments = bookings.length;
    const currentWeekAppointments = bookings.filter(b => isCurrentWeek(b.created_on)).length;
    const pendingAppointments = bookings.filter(b => (b.status || "Pending") === "Pending").length;
    const confirmedAppointments = bookings.filter(b => b.status === "Confirmed").length;
    const completedAppointments = bookings.filter(b => b.status === "Completed").length;
    const cancelledNoShowAppointments = bookings.filter(b => b.status === "Cancelled" || b.status === "No Show").length;

    return {
      totalAppointments, currentWeekAppointments, pendingAppointments,
      confirmedAppointments, completedAppointments, cancelledNoShowAppointments
    };
  }, [bookings]);

  const performanceData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0]; // Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const today = new Date();
    const firstDayOfWeek = new Date(today);
    // Get start of week (Sunday)
    firstDayOfWeek.setDate(today.getDate() - today.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);

    bookings.forEach((b) => {
      const bDate = new Date(b.created_on);
      if (bDate >= firstDayOfWeek && bDate <= lastDayOfWeek) {
        const dayIndex = bDate.getDay(); // 0 (Sun) to 6 (Sat)
        const uiIndex = dayIndex === 0 ? 6 : dayIndex - 1; // Map to Mon (0) ... Sun (6)
        counts[uiIndex]++;
      }
    });

    const maxVal = Math.max(...counts, 1);
    return counts.map((count) => ({
      count,
      height: (count / maxVal) * 100,
    }));
  }, [bookings]);

  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "Appointments", label: "Appointments", icon: CalendarCheck },
    // { id: "Customers", label: "Customers", icon: Users },
    // { id: "Services", label: "Services", icon: Scissors },
    // { id: "Staff", label: "Staff", icon: UserCog },
    // { id: "Billing", label: "Billing", icon: ReceiptIndianRupee },
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
            <p className="text-sm text-gray-500 hidden md:block">Welcome back to Meena's Admin Panel</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 min-h-[500px]">
          {activeTab === "Dashboard" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: "Total Appointments", value: kpiData.totalAppointments, color: "bg-blue-50 text-blue-600", icon: CalendarCheck },
                  { label: "Current Week", value: kpiData.currentWeekAppointments, color: "bg-purple-50 text-purple-600", icon: CalendarCheck },
                  { label: "Pending", value: kpiData.pendingAppointments, color: "bg-yellow-50 text-yellow-600", icon: CalendarCheck },
                  { label: "Confirmed", value: kpiData.confirmedAppointments, color: "bg-green-50 text-green-600", icon: CalendarCheck },
                  { label: "Completed", value: kpiData.completedAppointments, color: "bg-teal-50 text-teal-600", icon: CheckCircle2 },
                  { label: "Cancelled/No Show", value: kpiData.cancelledNoShowAppointments, color: "bg-red-50 text-red-600", icon: Trash2 },
                  // { label: "Today's Earnings", value: "₹4,250", color: "bg-green-50 text-green-600", icon: ReceiptIndianRupee },
                  // { label: "Staff Ready", value: "5/6", color: "bg-purple-50 text-purple-600", icon: UserCog },
                  // { label: "Stock Alerts", value: "3", color: "bg-red-50 text-red-600", icon: PackageSearch },
                ].map((stat) => (
                  <div key={stat.label} className={`${stat.color} p-5 rounded-2xl flex flex-col items-center text-center sm:items-start sm:text-left`}>
                    {stat.icon && <stat.icon size={24} className="mb-2 opacity-80" />}
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{stat.label}</p>
                    <p className="text-xl md:text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div className="bg-gray-50 p-6 rounded-2xl border">
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <CalendarCheck size={18} /> Recent Bookings
                   </h3>
                   <div className="space-y-3">
                     {bookings.slice(0, 5).map(booking => (
                       <div key={booking.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                         <div>
                           <p className="text-sm font-bold text-gray-800">{booking.name}</p>
                           <p className="text-[10px] text-gray-500">{booking.service} • {booking.preferred_time}</p>
                         </div>
                         <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase ${STATUS_CONFIG[(booking.status as BookingStatus) || 'Pending']?.color || 'bg-gray-100'}`}>
                           {booking.status || 'Pending'}
                         </span>
                       </div>
                     ))}
                     {bookings.length === 0 && (
                       <p className="text-center text-sm text-gray-400 py-4 italic">No recent bookings found</p>
                     )}
                   </div>
                </div>
                <div className="bg-gray-50 p-6 rounded-2xl border">
                   <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <BarChart3 size={18} /> Performance
                   </h3>
                   <div className="h-40 flex items-end justify-between gap-2 px-2">
                     {performanceData.map((day, i) => (
                       <div 
                         key={i} 
                         className="flex-1 bg-pink-200 hover:bg-pink-500 transition-all rounded-t-lg group relative cursor-pointer" 
                         style={{ height: `${Math.max(day.height, 5)}%` }}
                       >
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                           {day.count} {day.count === 1 ? 'Booking' : 'Bookings'}
                         </div>
                       </div>
                     ))}
                   </div>
                   <div className="flex justify-between mt-2 text-[10px] font-medium text-gray-400 px-1 uppercase tracking-tighter">
                     <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Appointments" && (
             <div className="animate-in slide-in-from-right-2 duration-300">
              <h2 className="text-xl font-bold mb-4">Live Appointment Manager</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Customer</th>
                      <th className="px-4 py-3">Service</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Time</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3 rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 font-medium">{booking.name}</td>
                        <td className="px-4 py-4 text-gray-600">{booking.service}</td>
                        <td className="px-4 py-4">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${STATUS_CONFIG[booking.status as BookingStatus]?.color || 'bg-gray-100'}`}>
                            {booking.status || "Pending"}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-gray-500">
                          {booking.preferred_time}
                        </td>
                        <td className="px-4 py-4 text-gray-500">{booking.email || "N/A"}</td>
                        <td className="px-4 py-4 text-gray-500">{booking.phone}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {editingId === booking.id ? (
                              <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
                                <select
                                  className="text-[10px] font-bold border rounded-lg px-2 py-1 focus:ring-2 focus:ring-pink-400 outline-none bg-white"
                                  value={booking.status || "Pending"}
                                  onChange={(e) => handleStatusChange(booking.id, e.target.value as BookingStatus)}
                                >
                                  {Object.keys(STATUS_CONFIG).map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                  ))}
                                </select>
                                <button 
                                  onClick={() => setEditingId(null)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-wrap gap-2">
                                  {STATUS_CONFIG[(booking.status as BookingStatus) || "Pending"]?.next.map(nextStatus => (
                                    <button
                                      key={nextStatus}
                                      onClick={() => handleStatusChange(booking.id, nextStatus)}
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
                                <div className="flex items-center ml-auto border-l pl-2 gap-1">
                                  <button 
                                    onClick={() => setEditingId(booking.id)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                                    title="Edit Status"
                                  >
                                    <Pencil size={16} />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "Services" && (
             <div className="animate-in slide-in-from-right-2 duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Manage Services</h2>
                <div className="flex gap-2">
                   {["Hair", "Skin", "Bridal"].map(cat => (
                     <span key={cat} className="px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600 cursor-pointer hover:bg-pink-100 hover:text-pink-600">{cat}</span>
                   ))}
                </div>
              </div>
              <p className="text-gray-500 italic">Configure pricing and service durations here.</p>
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

          {!["Dashboard", "Appointments", "Services", "Inventory"].includes(activeTab) && (
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