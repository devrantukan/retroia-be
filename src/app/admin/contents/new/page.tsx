"use client";

import { ContentForm } from "../_components/ContentForm";

export default function NewContentPage() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Yeni İçerik</h1>
        <ContentForm />
      </div>
    </div>
  );
}
