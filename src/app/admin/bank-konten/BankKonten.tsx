'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Upload, Trash2, Video, X, Loader2 } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { getStoredContent, saveStoredContent } from '@/lib/contentStorage'; 

export default function BankKontenContent() {
  const [videos, setVideos] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const data = await getStoredContent();
      setVideos(data || []);
    };
    loadData();
  }, []);

  // Fungsi hapus satuan
  const removeVideo = async (index: number) => {
    const updatedVideos = videos.filter((_, i) => i !== index);
    await saveStoredContent(updatedVideos); // Simpan state terbaru ke DB
    setVideos(updatedVideos);
    toast.info("Video dihapus dari database");
  };

  // Fungsi hapus semua permanen
  const removeAllVideos = async () => {
    try {
      const res = await fetch('/api/content', { method: 'DELETE' });
      if (res.ok) {
        setVideos([]);
        toast.success("Semua video berhasil dihapus permanen");
      } else {
        throw new Error("Gagal menghapus");
      }
    } catch (error) {
      toast.error("Gagal menghapus video");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/avatar/upload', 
      });

      const updatedVideos = [...videos, newBlob.url];
      await saveStoredContent(updatedVideos);
      setVideos(updatedVideos);
      
      toast.success("Video berhasil diunggah permanen!");
    } catch (error) {
      toast.error("Gagal mengunggah video ke Cloud");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Area Upload */}
      <div className="bg-white border-2 border-dashed border-slate-200 p-10 rounded-3xl text-center hover:border-orange-500 transition-colors cursor-pointer">
        <input type="file" accept="video/mp4" onChange={handleFileUpload} className="hidden" id="videoUpload" disabled={isUploading} />
        <label htmlFor="videoUpload" className="cursor-pointer block">
          {isUploading ? <Loader2 className="mx-auto text-orange-500 mb-4 animate-spin" size={40} /> : <Upload className="mx-auto text-orange-500 mb-4" size={40} />}
          <p className="font-bold text-slate-700">{isUploading ? "Mengunggah..." : "Klik untuk unggah video MP4"}</p>
        </label>
      </div>

      {/* Tombol Hapus Semua */}
      {videos.length > 0 && (
        <div className="flex justify-end">
          <button 
            onClick={removeAllVideos}
            className="flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            <Trash2 size={16} /> Hapus Semua (Permanen)
          </button>
        </div>
      )}

      {/* Grid View Video */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((url, i) => (
          <div key={i} className="bg-slate-900 p-2 rounded-3xl shadow-lg relative group overflow-hidden">
            <video src={url} className="w-full h-64 object-cover rounded-2xl" controls />
            
            {/* Tombol Hapus Satuan */}
            <button 
              onClick={() => removeVideo(i)}
              className="absolute top-4 right-4 bg-red-500/80 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}