"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { addresses } from "@/lib/api";
import { toast } from "sonner";

import {
  PageHeader,
  Card,
  Button,
  Modal,
  Input,
  LoadingSpinner
} from "@/components/ui";

import { Plus, Trash2, Star } from "lucide-react";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false
});

const emptyForm = {
  name: "",
  phone: "",
  address: { province: "", city: "", detail: "" },
  coords: null,
  is_default: false
};

export default function AddressesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let active = true;
    addresses
      .list()
      .then(res => {
        if (active) setItems(res.data || []);
      })
      .catch(() => {
        toast.error("Gagal memuat alamat");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  function refresh() {
    setLoading(true);
    setReload(n => n + 1);
  }

  async function save() {
    if (!form.name || !form.phone || !form.address.detail) {
      toast.warning("Nama, nomor HP, dan detail alamat wajib diisi");
      return;
    }

    setSaving(true);
    try {
      await addresses.create(form);
      toast.success("Alamat berhasil ditambahkan");
      setModal(false);
      setForm(emptyForm);
      refresh();
    } catch (e) {
      toast.error(e?.message || "Gagal menambahkan alamat");
    } finally {
      setSaving(false);
    }
  }

  async function setDefault(id) {
    try {
      await addresses.update(id, { is_default: true });
      toast.success("Alamat utama diperbarui");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Gagal mengubah alamat utama");
    }
  }

  async function remove(id) {
    if (!confirm("Hapus alamat ini?")) return;
    try {
      await addresses.delete(id);
      toast.success("Alamat berhasil dihapus");
      refresh();
    } catch (e) {
      toast.error(e?.message || "Gagal menghapus alamat");
    }
  }

  function setField(field, val) {
    setForm(f => ({ ...f, [field]: val }));
  }

  function setAddrField(field, val) {
    setForm(f => ({
      ...f,
      address: { ...f.address, [field]: val }
    }));
  }

  function handleMapSelect(latlng) {
    setForm(f => ({
      ...f,
      coords: latlng,
      address: {
        ...f.address,
        detail: `${latlng.lat}, ${latlng.lng}`
      }
    }));
    toast.info("Lokasi dipilih dari peta");
  }

  return (
    <div>
      <PageHeader
        title='Alamat'
        subtitle='Kelola alamat pengiriman Anda'
        action={
          <Button onClick={() => setModal(true)}>
            <Plus className='w-4 h-4 inline mr-1' />
            Tambah Alamat
          </Button>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <Card>
          <div className='text-center text-gray-400 py-12'>
            Belum ada alamat tersimpan
          </div>
        </Card>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {items.map(item => (
            <Card key={item.id}>
              <div className='flex items-start justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <h3 className='font-semibold text-gray-900'>{item.name}</h3>
                  {item.is_default && (
                    <span className='text-xs bg-black text-white px-2 py-0.5'>
                      Utama
                    </span>
                  )}
                </div>

                <div className='flex gap-2'>
                  {!item.is_default && (
                    <button
                      onClick={() => setDefault(item.id)}
                      className='text-gray-400 hover:text-black'
                    >
                      <Star className='w-4 h-4' />
                    </button>
                  )}

                  <button
                    onClick={() => remove(item.id)}
                    className='text-gray-400 hover:text-red-500'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>

              <p className='text-sm text-gray-600'>{item.address?.detail}</p>
              <p className='text-sm text-gray-500'>
                {item.address?.city}, {item.address?.province}
              </p>

              {item.coords && (
                <p className='text-xs text-gray-400 mt-1'>
                  Lat: {item.coords.lat}, Lng: {item.coords.lng}
                </p>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title='Tambah Alamat'
        footer={
          <>
            <Button variant='secondary' onClick={() => setModal(false)}>
              Batal
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </>
        }
      >
        <div className='space-y-4'>
          <Input
            label='Nama Alamat'
            value={form.name}
            onChange={e => setField("name", e.target.value)}
          />

          <Input
            label='Provinsi'
            value={form.address.province}
            onChange={e => setAddrField("province", e.target.value)}
          />

          <Input
            label='Kota'
            value={form.address.city}
            onChange={e => setAddrField("city", e.target.value)}
          />
          <Input
            label='Nomor HP'
            value={form.phone}
            onChange={e => setField("phone", e.target.value)}
            placeholder='08xxxxxxxxxx'
          />

          <Input
            label='Detail Alamat'
            value={form.address.detail}
            onChange={e => setAddrField("detail", e.target.value)}
          />

          <div>
            <p className='text-xs text-gray-500 mb-2'>
              Klik peta untuk memilih lokasi
            </p>
            <Map onSelect={handleMapSelect} />
          </div>

          <label className='flex items-center gap-2 text-sm text-gray-700 cursor-pointer'>
            <input
              type='checkbox'
              checked={form.is_default}
              onChange={e => setField("is_default", e.target.checked)}
            />
            Jadikan alamat utama
          </label>
        </div>
      </Modal>
    </div>
  );
}
