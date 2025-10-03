"use client";
import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok && data.status) {
        setResult(data.data);
      } else {
        setError(data.error || "Gagal memproses link");
      }
    } catch (err) {
      setError("Kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-center mt-12 mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          AIO Downloader
        </h1>
        <p className="text-center text-blue-200 mb-8">
          Tempel link dari TikTok, Instagram, YouTube, dll → Download instan!
        </p>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-5 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-blue-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-xl transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Go!"}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl text-center">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            {result.thumbnail && (
              <img
                src={result.thumbnail}
                alt="Preview"
                className="w-full rounded-xl mb-4 max-h-64 object-cover"
              />
            )}
            <h2 className="text-xl font-bold text-white mb-2">{result.title || "Media"}</h2>
            <p className="text-blue-200 mb-4">{result.platform?.toUpperCase()}</p>
            
            <div className="space-y-3">
              {result.urls?.map((link: string, i: number) => (
                <a
                  key={i}
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full text-center py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition"
                >
                  Download {result.urls.length > 1 ? `Versi ${i + 1}` : ""}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
