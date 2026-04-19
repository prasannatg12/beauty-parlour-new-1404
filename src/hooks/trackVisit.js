import { useEffect } from "react";
import supabase from "./supabaseClient";

export default function useTrackVisit() {
  useEffect(async () => {
    // const params = new URLSearchParams(window.location.search);
    // const client = params.get("client");

    // if (client) {
            // console.log("Tracking visit for client:", client);

      const { data, error } = await supabase
    .from("visits")
    .insert([
      {
        client_id: crypto.randomUUID(),
        user_agent: navigator.userAgent,
      },
    ]);

  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Insert success:", data);
  }
    // }
  }, []);
};

