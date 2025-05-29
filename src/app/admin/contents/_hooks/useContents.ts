import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useContents = () => {
  const [contents, setContents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const { data, error } = await supabase
          .from("contents")
          .select("*")
          .order("updatedAt", { ascending: false });

        if (error) {
          throw error;
        }

        setContents(data || []);
      } catch (error) {
        console.error("Error fetching contents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContents();
  }, []);

  return { contents, isLoading };
};
