"use client";

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  Link2,
  X,
  Star,
  StarOff,
  ImageOff,
  Pencil,
  Check,
  ChevronUp,
  ChevronDown,
  Info
} from "lucide-react";

/**
 * ImageUploader — supports product & variant images
 *
 * Props:
 *  productId  number | null
 *  variantId  number | null
 *  images     { id, url, alt_text, description, is_primary, position }[]
 *  onChange   (images) => void
 */
export default function ImageUploader({
  productId,
  variantId,
  images = [],
  onChange
}) {
  const [inputTab, setInputTab] = useState("url");
  const [urlInput, setUrlInput] = useState("");
  const [newAlt, setNewAlt] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newIsPrimary, setNewIsPrimary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [globalError, setGlobalError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const fileRef = useRef(null);

  const imageType = variantId ? "variant" : "product";
  const targetParam = productId
    ? `product_id=${productId}`
    : `variant_id=${variantId}`;
  const targetBody = productId
    ? { product_id: productId }
    : { variant_id: variantId };

  async function reload() {
    const res = await fetch(`/api/data/images?${targetParam}`);
    const json = await res.json();
    onChange?.(json.data || []);
  }

  async function addByUrl() {
    if (!urlInput.trim()) return;
    setGlobalError("");
    setUploading(true);
    try {
      const res = await fetch("/api/data/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...targetBody,
          url: urlInput.trim(),
          alt_text: newAlt,
          description: newDesc,
          is_primary: newIsPrimary || images.length === 0,
          position: images.length + 1
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menambahkan gambar");
      setUrlInput("");
      setNewAlt("");
      setNewDesc("");
      setNewIsPrimary(false);
      await reload();
    } catch (e) {
      setGlobalError(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function uploadFile(file) {
    if (!file) return;
    setGlobalError("");
    setUploading(true);
    try {
      const fd = new FormData();
      if (productId) fd.append("product_id", String(productId));
      if (variantId) fd.append("variant_id", String(variantId));
      fd.append("file", file);
      fd.append("alt_text", newAlt);
      fd.append("description", newDesc);
      fd.append("is_primary", String(newIsPrimary || images.length === 0));
      fd.append("position", String(images.length + 1));

      const res = await fetch("/api/data/images", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload gagal");
      setNewAlt("");
      setNewDesc("");
      setNewIsPrimary(false);
      await reload();
    } catch (e) {
      setGlobalError(e.message);
    } finally {
      setUploading(false);
    }
  }

  async function setPrimary(imgId) {
    await fetch(`/api/data/images?id=${imgId}&type=${imageType}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_primary: true })
    });
    await reload();
  }

  async function deleteImage(imgId) {
    if (!confirm("Hapus gambar ini?")) return;
    await fetch(`/api/data/images?id=${imgId}&type=${imageType}`, {
      method: "DELETE"
    });
    if (editingId === imgId) setEditingId(null);
    await reload();
  }

  async function movePosition(img, dir) {
    const newPos = img.position + dir;
    const total = images.length;
    if (newPos < 1 || newPos > total) return;

    await fetch(`/api/data/images?id=${img.id}&type=${imageType}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ position: newPos })
    });
    const adjacent = images.find(i => i.position === newPos && i.id !== img.id);
    if (adjacent) {
      await fetch(`/api/data/images?id=${adjacent.id}&type=${imageType}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ position: img.position })
      });
    }
    await reload();
  }

  const sorted = [...images].sort((a, b) => a.position - b.position);

  return (
    <div className='space-y-5'>
      {/*  Input panel  */}
      <div className='border border-gray-200 rounded-xl overflow-hidden'>
        <div className='flex border-b border-gray-200 bg-gray-50'>
          {[
            { key: "url", label: "Via URL", Icon: Link2 },
            { key: "upload", label: "Upload File", Icon: Upload }
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              type='button'
              onClick={() => setInputTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                inputTab === key
                  ? "border-cream-600 text-cream-700 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className='w-3.5 h-3.5' /> {label}
            </button>
          ))}
        </div>

        <div className='p-4 space-y-3'>
          {/* Shared metadata */}
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-medium text-gray-500 mb-1'>
                Alt Text{" "}
                <span className='font-normal text-gray-400'>(SEO)</span>
              </label>
              <input
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cream-400'
                placeholder='Deskripsi singkat gambar'
                value={newAlt}
                onChange={e => setNewAlt(e.target.value)}
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-500 mb-1'>
                Deskripsi{" "}
                <span className='font-normal text-gray-400'>(opsional)</span>
              </label>
              <input
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cream-400'
                placeholder='Keterangan gambar'
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>
          </div>

          <label className='flex items-center gap-2 cursor-pointer w-fit select-none'>
            <button
              type='button'
              onClick={() => setNewIsPrimary(v => !v)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${newIsPrimary ? "bg-cream-600" : "bg-gray-200"}`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${newIsPrimary ? "translate-x-[18px]" : "translate-x-[2px]"}`}
              />
            </button>
            <span className='text-sm text-gray-600'>Jadikan gambar utama</span>
          </label>

          {/* URL mode */}
          {inputTab === "url" && (
            <div className='flex gap-2'>
              <input
                className='flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cream-400'
                placeholder='https://example.com/image.jpg'
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addByUrl()}
              />
              <button
                type='button'
                onClick={addByUrl}
                disabled={uploading || !urlInput.trim()}
                className='px-4 py-2 bg-cream-600 text-white rounded-lg text-sm font-medium hover:bg-cream-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {uploading ? "Menambahkan..." : "Tambah"}
              </button>
            </div>
          )}

          {/* Upload mode */}
          {inputTab === "upload" && (
            <div
              onDrop={e => {
                e.preventDefault();
                setDragOver(false);
                uploadFile(e.dataTransfer.files[0]);
              }}
              onDragOver={e => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-cream-500 bg-cream-50"
                  : "border-gray-200 hover:border-cream-400 hover:bg-gray-50"
              }`}
            >
              <Upload
                className={`w-7 h-7 mx-auto mb-2 transition-colors ${dragOver ? "text-cream-500" : "text-gray-300"}`}
              />
              <p className='text-sm text-gray-500'>
                {uploading
                  ? "Mengupload..."
                  : "Drag & drop atau klik untuk memilih file"}
              </p>
              <p className='text-xs text-gray-400 mt-1'>
                JPG, PNG, WEBP, GIF, AVIF · Maks 5MB
              </p>
              <input
                ref={fileRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={e => uploadFile(e.target.files?.[0])}
              />
            </div>
          )}
        </div>
      </div>

      {globalError && (
        <div className='flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2'>
          <X className='w-4 h-4 flex-shrink-0' /> {globalError}
        </div>
      )}

      {/*  Image list  */}
      {sorted.length === 0 ? (
        <div className='text-center py-10 border-2 border-dashed border-gray-200 rounded-xl text-gray-400'>
          <ImageOff className='w-8 h-8 mx-auto mb-2 opacity-40' />
          <p className='text-sm'>Belum ada gambar ditambahkan</p>
        </div>
      ) : (
        <div className='space-y-2'>
          <div className='flex items-center justify-between mb-1'>
            <p className='text-xs font-medium text-gray-400 uppercase tracking-wide'>
              {sorted.length} Gambar
            </p>
            <p className='text-xs text-gray-400 italic'>
              Klik ✎ untuk edit metadata
            </p>
          </div>
          {sorted.map((img, idx) => (
            <ImageCard
              key={img.id}
              img={img}
              isFirst={idx === 0}
              isLast={idx === sorted.length - 1}
              imageType={imageType}
              isEditing={editingId === img.id}
              onEditToggle={() =>
                setEditingId(prev => (prev === img.id ? null : img.id))
              }
              onSetPrimary={() => setPrimary(img.id)}
              onDelete={() => deleteImage(img.id)}
              onMove={dir => movePosition(img, dir)}
              onSaved={reload}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ImageCard({
  img,
  isFirst,
  isLast,
  imageType,
  isEditing,
  onEditToggle,
  onSetPrimary,
  onDelete,
  onMove,
  onSaved
}) {
  function toForm(i) {
    return {
      alt_text: i.alt_text || "",
      description: i.description || "",
      is_primary: i.is_primary ?? false,
      position: String(i.position ?? 1)
    };
  }

  const [form, setForm] = useState(toForm(img));
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const [imgErr, setImgErr] = useState(false);
  const prevImg = useRef(img);

  // Sync when parent reloads - moved to useEffect to avoid accessing refs during render
  useEffect(() => {
    if (prevImg.current !== img) {
      prevImg.current = img;
      setForm(toForm(img));
    }
  }, [img]);

  function setF(k, v) {
    setForm(p => ({ ...p, [k]: v }));
  }

  async function save() {
    setSaveErr("");
    setSaving(true);
    try {
      const res = await fetch(
        `/api/data/images?id=${img.id}&type=${imageType}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            alt_text: form.alt_text,
            description: form.description,
            is_primary: form.is_primary,
            position: parseInt(form.position) || img.position
          })
        }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Gagal menyimpan");
      await onSaved();
      onEditToggle();
    } catch (e) {
      setSaveErr(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-colors ${isEditing ? "border-cream-300" : "border-gray-200 bg-white"}`}
    >
      {/* Row */}
      <div className='flex items-center gap-3 p-3'>
        {/* Thumb */}
        <div className='w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 bg-gray-50'>
          {!imgErr ? (
            <img
              src={img.url}
              alt={img.alt_text || ""}
              className='w-full h-full object-cover'
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className='w-full h-full flex items-center justify-center text-gray-300'>
              <ImageOff className='w-5 h-5' />
            </div>
          )}
        </div>

        {/* Summary */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-center gap-1.5 flex-wrap mb-0.5'>
            {img.is_primary && (
              <span className='inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-cream-100 text-cream-700 rounded-full uppercase'>
                <Star className='w-2.5 h-2.5' /> Utama
              </span>
            )}
            <span className='text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded'>
              #{img.position}
            </span>
          </div>
          <p className='text-sm text-gray-700 truncate'>
            {img.alt_text || (
              <span className='italic text-gray-400 text-xs'>
                Tanpa alt text
              </span>
            )}
          </p>
          {img.description && (
            <p className='text-xs text-gray-400 truncate'>{img.description}</p>
          )}
          <p className='text-[10px] text-gray-300 font-mono truncate mt-0.5'>
            {img.url}
          </p>
        </div>

        {/* Actions */}
        <div className='flex items-center gap-1 flex-shrink-0'>
          <div className='flex flex-col'>
            <button
              type='button'
              onClick={() => onMove(-1)}
              disabled={isFirst}
              className='p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors'
              title='Naikan urutan'
            >
              <ChevronUp className='w-3.5 h-3.5' />
            </button>
            <button
              type='button'
              onClick={() => onMove(1)}
              disabled={isLast}
              className='p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors'
              title='Turunkan urutan'
            >
              <ChevronDown className='w-3.5 h-3.5' />
            </button>
          </div>

          <button
            type='button'
            onClick={onSetPrimary}
            disabled={img.is_primary}
            className={`p-2 rounded-lg transition-colors ${img.is_primary ? "text-cream-400 cursor-default" : "text-gray-300 hover:text-cream-500 hover:bg-cream-50"}`}
            title={
              img.is_primary ? "Sudah gambar utama" : "Jadikan gambar utama"
            }
          >
            {img.is_primary ? (
              <Star className='w-4 h-4' />
            ) : (
              <StarOff className='w-4 h-4' />
            )}
          </button>

          <button
            type='button'
            onClick={onEditToggle}
            className={`p-2 rounded-lg transition-colors ${isEditing ? "bg-cream-100 text-cream-700" : "text-gray-300 hover:text-cream-600 hover:bg-cream-50"}`}
            title='Edit metadata'
          >
            <Pencil className='w-4 h-4' />
          </button>

          <button
            type='button'
            onClick={onDelete}
            className='p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors'
            title='Hapus gambar'
          >
            <X className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Edit panel */}
      {isEditing && (
        <div className='border-t border-cream-200 bg-cream-50/40 px-4 py-4 space-y-3'>
          <p className='flex items-center gap-1.5 text-xs font-semibold text-cream-700 uppercase tracking-wide'>
            <Info className='w-3.5 h-3.5' /> Edit Metadata Gambar
          </p>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-medium text-gray-500 mb-1'>
                Alt Text{" "}
                <span className='font-normal text-gray-400'>(SEO)</span>
              </label>
              <input
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cream-400'
                placeholder='Deskripsi singkat gambar'
                value={form.alt_text}
                onChange={e => setF("alt_text", e.target.value)}
              />
            </div>
            <div>
              <label className='block text-xs font-medium text-gray-500 mb-1'>
                Posisi (urutan tampil)
              </label>
              <input
                type='number'
                min={1}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cream-400'
                value={form.position}
                onChange={e => setF("position", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className='block text-xs font-medium text-gray-500 mb-1'>
              Deskripsi
            </label>
            <textarea
              rows={2}
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cream-400 resize-none'
              placeholder='Keterangan tambahan untuk gambar ini'
              value={form.description}
              onChange={e => setF("description", e.target.value)}
            />
          </div>

          <label className='flex items-center gap-2 cursor-pointer w-fit select-none'>
            <button
              type='button'
              onClick={() => setF("is_primary", !form.is_primary)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${form.is_primary ? "bg-cream-600" : "bg-gray-200"}`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transform transition-transform ${form.is_primary ? "translate-x-[18px]" : "translate-x-[2px]"}`}
              />
            </button>
            <span className='text-sm text-gray-600'>Gambar utama</span>
          </label>

          {saveErr && (
            <p className='text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1.5'>
              {saveErr}
            </p>
          )}

          <div className='flex gap-2 pt-1'>
            <button
              type='button'
              onClick={onEditToggle}
              className='px-4 py-2 text-sm border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 transition-colors'
            >
              Batal
            </button>
            <button
              type='button'
              onClick={save}
              disabled={saving}
              className='flex items-center gap-1.5 px-4 py-2 text-sm bg-cream-600 text-white rounded-lg font-medium hover:bg-cream-700 disabled:opacity-50 transition-colors'
            >
              <Check className='w-3.5 h-3.5' />
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
