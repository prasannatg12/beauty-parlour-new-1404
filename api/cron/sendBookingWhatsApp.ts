import { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";
import siteData from "../../src/data/site.json";

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL || "https://vyllwlydzfgehihtomyg.supabase.co",
  process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5bGx3bHlkemZnZWhpaHRvbXlnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NzczMDEsImV4cCI6MjA4NDE1MzMwMX0.RnhubbS0ttbyeykWfCyaObGMHEptUZN0tU2-wB5hjcw"
);

// Initialize Twilio
const twilio = require("twilio");
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const SALON_WHATSAPP = `whatsapp:+${siteData.salon.whatsapp}`;

/**
 * Send WhatsApp message for a booking
 */
const sendWhatsAppMessage = async (booking: any): Promise<boolean> => {
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
const updateBookingStatus = async (bookingId: string): Promise<boolean> => {
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
 * Vercel Cron Function Handler
 */
export default async (req: VercelRequest, res: VercelResponse) => {
  // Verify the request is from Vercel's cron service
  if (req.headers["x-vercel-cron"] !== process.env.VERCEL_CRON_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log(
      `[${new Date().toISOString()}] Running WhatsApp booking cron job...`
    );

    // Fetch bookings where sent_in_whatsapp = false
    const { data: bookings, error } = await supabase
      .from("booking")
      .select("*")
      .eq("sent_in_whatsapp", false)
      .order("created_on", { ascending: true })
      .limit(10); // Process max 10 at a time to avoid rate limits

    if (error) {
      console.error("Error fetching unsent bookings:", error);
      return res.status(500).json({ error: "Database query failed", details: error });
    }

    if (!bookings || bookings.length === 0) {
      console.log("No unsent bookings found.");
      return res.status(200).json({
        success: true,
        message: "No unsent bookings found",
        processed: 0,
      });
    }

    console.log(`Found ${bookings.length} unsent booking(s). Processing...`);

    let processed = 0;
    const results = [];

    // Send WhatsApp message for each booking
    for (const booking of bookings) {
      const messageSent = await sendWhatsAppMessage(booking);

      if (messageSent) {
        const statusUpdated = await updateBookingStatus(booking.id);
        if (statusUpdated) {
          processed++;
          results.push({
            id: booking.id,
            name: booking.name,
            status: "sent",
          });
        }
      } else {
        results.push({
          id: booking.id,
          name: booking.name,
          status: "failed",
        });
      }

      // Add small delay between messages to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    return res.status(200).json({
      success: true,
      message: `Processed ${processed} out of ${bookings.length} bookings`,
      processed,
      total: bookings.length,
      results,
    });
  } catch (error) {
    console.error("Error in WhatsApp cron job:", error);
    return res.status(500).json({
      error: "Cron job failed",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};
