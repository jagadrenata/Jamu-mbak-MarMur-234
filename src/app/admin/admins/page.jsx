"use client";

import { useState, useEffect, useRef } from "react";
import { admins, adminUsers } from "@/lib/api";
import {
  PageHeader,
  Card,
  Table,
  Tr,
  Td,
  Button,
  Modal,
  Input,
  Select,
  LoadingSpinner,
  Badge
} from "@/components/ui";
import { Plus, Pencil, Trash2, Search, UserCheck } from "lucide-react";

const emptyForm = { name: "", email: "", password: "", role: "staff" };
const ROLES = ["staff", "manager", "superadmin"];

export default function AdminsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [reload, setReload] = useState(0);

  const [mode, setMode] = useState("new"); // 'new' | 'existing'
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const searchTimeout = useRef(null);

  useEffect(() => {
    let active = true;
    admins
      .list()
      .then(res => {
        if (active) setData(res.data || []);
      })
      .catch(() => {})
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

  function openCreate() {
    setEditItem(null);
    setForm(emptyForm);
    setMode("new");
    setUserSearch("");
    setUserResults([]);
    setSelectedUser(null);
    setModal(true);
  }

  function openEdit(item) {
    setEditItem(item);
    setForm({
      name: item.name,
      email: item.email,
      password: "",
      role: item.role
    });
    setModal(true);
  }

  // Search user 
  function handleUserSearch(val) {
    setUserSearch(val);
    setSelectedUser(null);
    clearTimeout(searchTimeout.current);
    if (!val.trim()) {
      setUserResults([]);
      return;
    }
    setUserLoading(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await adminUsers.list({ search: val, limit: 10 });
        setUserResults(res.data || []);
      } catch {
        setUserResults([]);
      } finally {
        setUserLoading(false);
      }
    }, 350);
  }

  function selectUser(user) {
    setSelectedUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: "staff"
    });
    setUserResults([]);
    setUserSearch(`${user.name} (${user.email})`);
  }

  async function save() {
    setSaving(true);
    try {
      if (editItem) {
        const body = { name: form.name, role: form.role };
        if (form.password) body.password = form.password;
        await admins.update(editItem.id, body);
      } else {
        // Sertakan user_id jika dipilih dari user yang ada
        const body = { ...form };
        if (mode === "existing" && selectedUser) {
          body.user_id = selectedUser.id;
        }
        await admins.create(body);
      }
      setModal(false);
      refresh();
    } catch {}
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Hapus admin ini?")) return;
    await admins.delete(id);
    refresh();
  }

  function setField(f, v) {
    setForm(p => ({ ...p, [f]: v }));
  }

  return (
    <div>
      <PageHeader
        title='Admin'
        subtitle='Kelola akun admin'
        action={
          <Button onClick={openCreate}>
            <Plus className='w-4 h-4 inline mr-1' />
            Tambah Admin
          </Button>
        }
      />
      <Card>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <Table headers={["Nama", "Email", "Role", "Login Terakhir", ""]}>
            {data.map(admin => (
              <Tr key={admin.id}>
                <Td>
                  <span className='font-medium'>{admin.name}</span>
                </Td>
                <Td>{admin.email}</Td>
                <Td>
                  <Badge
                    variant={
                      admin.role === "manager"
                        ? "info"
                        : admin.role === "superadmin"
                          ? "success"
                          : "default"
                    }
                  >
                    {admin.role}
                  </Badge>
                </Td>
                <Td>
                  {admin.last_login
                    ? new Date(admin.last_login).toLocaleDateString("id-ID")
                    : "-"}
                </Td>
                <Td>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => openEdit(admin)}
                      className='text-gray-400 hover:text-cream-700'
                    >
                      <Pencil className='w-4 h-4' />
                    </button>
                    <button
                      onClick={() => remove(admin.id)}
                      className='text-gray-400 hover:text-red-500'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </Td>
              </Tr>
            ))}
          </Table>
        )}
      </Card>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editItem ? "Edit Admin" : "Tambah Admin"}
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
          {/* Toggle mode hanya saat create */}
          {!editItem && (
            <div className='flex gap-2 p-1 bg-gray-100 rounded-lg'>
              <button
                onClick={() => {
                  setMode("new");
                  setSelectedUser(null);
                  setForm(emptyForm);
                  setUserSearch("");
                  setUserResults([]);
                }}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${mode === "new" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                <Plus className='w-3.5 h-3.5 inline mr-1' />
                Buat Baru
              </button>
              <button
                onClick={() => {
                  setMode("existing");
                  setForm(emptyForm);
                }}
                className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${mode === "existing" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
              >
                <UserCheck className='w-3.5 h-3.5 inline mr-1' />
                Dari User
              </button>
            </div>
          )}

          {/* Mode: pilih dari user existing */}
          {!editItem && mode === "existing" && (
            <div className='relative'>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Cari User
              </label>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                  type='text'
                  value={userSearch}
                  onChange={e => handleUserSearch(e.target.value)}
                  placeholder='Cari nama, email, atau nomor HP...'
                  className='w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cream-500'
                />
                {userLoading && (
                  <div className='absolute right-3 top-1/2 -translate-y-1/2'>
                    <LoadingSpinner size='sm' />
                  </div>
                )}
              </div>

              {/* Dropdown hasil pencarian */}
              {userResults.length > 0 && (
                <div className='absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto'>
                  {userResults.map(user => (
                    <button
                      key={user.id}
                      onClick={() => selectUser(user)}
                      className='w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors'
                    >
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt=''
                          className='w-8 h-8 rounded-full object-cover'
                        />
                      ) : (
                        <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500'>
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div className='flex-1 min-w-0'>
                        <div className='text-sm font-medium text-gray-900 truncate'>
                          {user.name}
                        </div>
                        <div className='text-xs text-gray-500 truncate'>
                          {user.email}
                          {user.phone ? ` · ${user.phone}` : ""}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* User terpilih */}
              {selectedUser && (
                <div className='mt-2 flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg'>
                  <UserCheck className='w-4 h-4 text-green-600 shrink-0' />
                  <span className='text-sm text-green-700 font-medium truncate'>
                    {selectedUser.name} — {selectedUser.email}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Form fields */}
          {(mode === "new" || editItem) && (
            <>
              <Input
                label='Nama'
                value={form.name}
                onChange={e => setField("name", e.target.value)}
              />
              <Input
                label='Email'
                type='email'
                value={form.email}
                onChange={e => setField("email", e.target.value)}
                disabled={!!editItem}
              />
            </>
          )}

          {/* Tampilkan nama & email read-only jika user sudah dipilih dari existing */}
          {!editItem && mode === "existing" && selectedUser && (
            <>
              <Input label='Nama' value={form.name} disabled />
              <Input label='Email' value={form.email} disabled />
              {form.phone && (
                <Input label='Nomor HP' value={form.phone} disabled />
              )}
            </>
          )}

          {/* Password: selalu muncul di mode new/edit, muncul setelah user dipilih di mode existing */}
          {(mode === "new" ||
            editItem ||
            (mode === "existing" && selectedUser)) && (
            <Input
              label={
                editItem
                  ? "Password Baru (kosongkan jika tidak diubah)"
                  : mode === "existing"
                    ? "Set Password Admin (untuk login ke dashboard)"
                    : "Password"
              }
              type='password'
              value={form.password}
              onChange={e => setField("password", e.target.value)}
              placeholder={
                mode === "existing"
                  ? "Buat password baru untuk akun admin ini"
                  : ""
              }
            />
          )}
          <Select
            label='Role'
            value={form.role}
            onChange={e => setField("role", e.target.value)}
          >
            {ROLES.map(r => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
}
