import { useEffect } from "react";
import supabase from "./supabaseClient";

export default function useTrackVisit() {
  useEffect(() => {
    const track = async () => {
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
    };
    track();
  }, []);
};
