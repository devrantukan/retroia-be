import { useState } from "react";

interface DeleteContentOptions {
  onSuccess?: () => void;
  onError?: () => void;
}

export function useDeleteContent() {
  const [isLoading, setIsLoading] = useState(false);

  const mutate = async (id: number, options?: DeleteContentOptions) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/contents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete content");

      options?.onSuccess?.();
    } catch (error) {
      console.error("Error deleting content:", error);
      options?.onError?.();
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading };
}
