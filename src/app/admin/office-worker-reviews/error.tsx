"use client";

export default function DanismanDegerlendirmeleriHata({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Bir Hata Oluştu</h2>
        <p className="text-gray-600 mb-4">
          Değerlendirmeler yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.
        </p>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  );
}
