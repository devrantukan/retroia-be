"use client";

import { ContentForm } from "../../_components/ContentForm";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";

export default function EditContentPage() {
  const params = useParams();
  const id = params.id as string;
  const [content, setContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { data, error } = await supabase
          .from("Contents")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setContent(data);
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [id]);

  if (isLoading) return <div>Yükleniyor...</div>;
  if (!content) return <div>İçerik bulunamadı.</div>;

  return (
    <div className="p-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">İçerik Düzenle</h1>
        <ContentForm initialData={content} />
      </div>
    </div>
  );
}
