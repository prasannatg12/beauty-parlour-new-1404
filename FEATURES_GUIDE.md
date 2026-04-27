# Meena's Beauty Parlour

This provides a comprehensive overview of the features, functionalities, and workflows implemented in the Meena's Beauty Parlour web application.

---

## 1. Public Website Features
A high-performance digital storefront designed to enhance brand visibility, build customer trust, and drive appointment growth through a seamless user journey.

### Core Functionality
- **Dynamic Service Catalog**: A professional digital menu that ensures all services and pricing tiers are always accurate and synchronized, providing customers with complete transparency and a reliable booking experience.
- **Interactive Booking**: A streamlined booking form allows customers to pick services and preferred times.
- **WhatsApp Integration**: A floating WhatsApp button for direct communication and background cron jobs for automated booking confirmations.
- **Gallery & Reviews**: Visual showcases and social proof sections to build trust.
- **Google Maps Integration**: Embedded interactive map to help customers navigate to the location easily.
- **Direct Contact Links**: Integrated one-click links for Instagram profile, phone calls, and Gmail to facilitate instant communication.
- **Testimonials**: A dedicated section for customer feedback and star-rated reviews to build credibility.
- **Offers Section**: Highlights current packages, seasonal deals, and exclusive discounts for customers.
---

## 2. Admin Portal Features
A secure management environment for booking services and revenue growth.

### Dashboard & Insights
- **KPI Summary**: Real-time tracking of total appointments, pending requests, and weekly volume.
- **Financial Health**: Tracking of overall revenue and "Daily Profit" comparisons with trend indicators.
- **Weekly Performance Charts**:
  - **Booking Frequency**: Bar chart showing appointment volume.
  - **Revenue Trend**: Interactive line chart showing daily earnings.
  - **Navigation**: "Previous" and "Next" week controls to audit historical data.

### Appointment Management
- **Full Lifecycle**: Manage bookings from `Pending` → `Confirmed` → `In Progress` → `Completed`.
- **Start-Action Check**: When clicking "Start", the system validates if a staff member is assigned. If not, it prompts the user to assign one.
- **Auto-Billing**: Transitioning an appointment to "Completed" automatically generates a bill in the Billing module using the service's current price.
- **Advanced Filters**: Search by customer details and filter by service, date, or status.

### Customer CRM
- **Unified Directory**: Centralized list of all clients indexed by phone number.
- **Customer Analytics**: Tracks total visits and the most recent visit date.
- **Alias Tracking**: Recognizes when a customer uses different names across multiple bookings under the same phone number.
- **Detailed History**: View the complete timeline of services and notes for any specific customer.

### Team & Service Management
- **Staff Roster**: Manage beauticians, their roles, and contact info.
- **Service Catalog**: Add, update, or archive services. Changes reflect on the public website instantly.

### Billing & Revenue
- **Payment Tracking**: Ledger of all bills generated via the Appointment flow.
- **Revenue Validation**: Marks payments as "Paid" to update the dashboard financial KPIs.
- **Data Integrity**: Robust parsing ensures that even if prices include symbols (₹) or text ("onwards"), financial calculations remain accurate.

---

## 3. Operational Workflows

### Standard Booking-to-Payment Flow
1. **Customer** looks for a service and submits a booking on the website.
2. **Admin** receives a real-time update in the Appointments tab.
3. **Admin** contacts the customer and updates status to **Confirmed**.
4. **Admin** assigns a **Staff** member and clicks **Start** when the client arrives.
5. Once finished, **Admin** clicks **Completed**.
6. **System** automatically creates a "Pending" record in **Billing**.
7. **Admin** collects payment and clicks **Mark as Paid**, which instantly updates the Dashboard charts.

### Customer Retention Flow
1. **Admin** checks the **Customers** tab to identify frequent visitors or clients who haven't visited in a while (via "Last Visit").
2. **Admin** views the customer's specific service **History** to understand their preferences.
3. **Admin** can then use the contact info to reach out with targeted **Offers**.

---

## 4. Technical Architecture
- **Database**: Supabase (PostgreSQL) with real-time subscriptions for instant UI updates.
- **Authentication**: Secure admin login via Supabase Auth.
- **Automation**: Automated billing generation and background WhatsApp notifications via Vercel Cron.