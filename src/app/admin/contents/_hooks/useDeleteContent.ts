import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const useDeleteContent = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const mutate = async (
    id: string,
    options?: { onSuccess?: () => void; onError?: () => void }
  ) => {
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("Contents").delete().eq("id", id);

      if (error) {
        throw error;
      }

      options?.onSuccess?.();
    } catch (error) {
      console.error("Error deleting content:", error);
      options?.onError?.();
    } finally {
      setIsDeleting(false);
    }
  };

  return { mutate, isDeleting };
};
