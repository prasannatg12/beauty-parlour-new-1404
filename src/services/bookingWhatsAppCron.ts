import cron from "node-cron";
import supabase from "../hooks/supabaseClient";
import siteData from "../data/site.json";

// Initialize Twilio (you need to set these environment variables)
// Install: npm install twilio
const twilio = require("twilio");
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const SALON_WHATSAPP = `whatsapp:+${siteData.salon.whatsapp}`;

/**
 * Send WhatsApp message for a booking
 */
const sendWhatsAppMessage = async (booking: any) => {
  try {
    const messageBody = `
Hello ${booking.name},

Thank you for booking with Meena's Beauty Parlour!

📋 Booking Details:
Service: ${booking.service}
Preferred Time: ${booking.preferred_time}
${booking.notes ? `Notes: ${booking.notes}` : ""}

We will confirm your appointment shortly. If you have any questions, feel free to reach out to us.

Best regards,
Meena's Beauty Parlour
    `.trim();

    const message = await twilioClient.messages.create({
      from: SALON_WHATSAPP,
      to: `whatsapp:+${booking.phone}`,
      body: messageBody,
    });

    console.log(`WhatsApp message sent to ${booking.phone}:`, message.sid);
    return true;
  } catch (error) {
    console.error(`Failed to send WhatsApp message to ${booking.phone}:`, error);
    return false;
  }
};

/**
 * Update booking's sent_in_whatsapp status
 */
const updateBookingStatus = async (bookingId: string) => {
  const { error } = await supabase
    .from("booking")
    .update({
      sent_in_whatsapp: true,
      updated_on: new Date().toISOString(),
      updated_by: "System - WhatsApp Cron",
    })
    .eq("id", bookingId);

  if (error) {
    console.error(`Failed to update booking ${bookingId}:`, error);
    return false;
  }
  return true;
};

/**
 * Cron job to send WhatsApp messages for unsent bookings
 * Runs every 5 minutes
 */
export const startBookingWhatsAppCron = () => {
  console.log("Starting Booking WhatsApp Cron Job...");

  // Run every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    try {
      console.log(`[${new Date().toISOString()}] Running WhatsApp booking cron job...`);

      // Fetch bookings where sent_in_whatsapp = false
      const { data: bookings, error } = await supabase
        .from("booking")
        .select("*")
        .eq("sent_in_whatsapp", false)
        .order("created_on", { ascending: true })
        .limit(10); // Process max 10 at a time to avoid rate limits

      if (error) {
        console.error("Error fetching unsent bookings:", error);
        return;
      }

      if (!bookings || bookings.length === 0) {
        console.log("No unsent bookings found.");
        return;
      }

      console.log(`Found ${bookings.length} unsent booking(s). Processing...`);

      // Send WhatsApp message for each booking
      for (const booking of bookings) {
        const messageSent = await sendWhatsAppMessage(booking);

        if (messageSent) {
          // Update booking status to sent
          await updateBookingStatus(booking.id);
          console.log(`Booking ${booking.id} marked as sent.`);
        }

        // Add small delay between messages to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error("Error in WhatsApp cron job:", error);
    }
  });

  console.log("Booking WhatsApp Cron Job started successfully!");
};

/**
 * Stop the cron job (if needed)
 */
export const stopBookingWhatsAppCron = () => {
  console.log("Stopping Booking WhatsApp Cron Job...");
  // Note: cron.schedule returns a task that can be stopped with task.stop()
  // You can keep a reference to tasks if needed
};
