import React, { useEffect, useState } from 'react';
import { Loader2, MapPin, Pencil, Phone, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { Skeleton } from '../../components/ui/skeleton';
import AddressForm from '../../components/AddressForm';

const Addresses = () => {
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | address object
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = () =>
    fetch(`${config.baseURL}/shipping-addresses`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setAddresses(d.success && Array.isArray(d.data) ? d.data : []))
      .catch((e) => console.error('Failed to fetch addresses:', e))
      .finally(() => setLoading(false));

  useEffect(() => {
    if (token) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const save = async (values) => {
    const isNew = editing === 'new';
    setSaving(true);
    try {
      const res = await fetch(`${config.baseURL}/shipping-addresses${isNew ? '' : `/${editing.id}`}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(isNew ? { User_id: user.id, ...values } : values),
      });
      const data = await res.json();
      if (!data.success) return data.message || "Couldn't save this address.";
      toast.success(isNew ? 'Address added' : 'Address updated');
      setEditing(null);
      await load();
      return null;
    } catch {
      return "Couldn't save this address. Please try again.";
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    setDeleting(id);
    try {
      const res = await fetch(`${config.baseURL}/shipping-addresses/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Couldn't delete this address.");
      setAddresses((list) => list.filter((a) => a.id !== id));
      toast.success('Address removed');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  const formFor = (initial) => (
    <div className="rounded-2xl border border-zan-cyan/30 bg-card p-5 md:p-6">
      <h2 className="mb-4 text-lg font-bold text-white">{editing === 'new' ? 'New address' : 'Edit address'}</h2>
      <AddressForm
        key={editing === 'new' ? 'new' : editing.id}
        idPrefix="dash-addr"
        initial={initial}
        onSubmit={save}
        onCancel={() => setEditing(null)}
        submitting={saving}
        submitLabel={editing === 'new' ? 'Save address' : 'Save changes'}
      />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">Delivery addresses</h1>
          <p className="mt-1 text-sm text-gray-400">Saved addresses appear at checkout so you don't have to type them again.</p>
        </div>
        {editing !== 'new' && addresses.length > 0 && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-zan-cyan px-5 text-sm font-bold text-zan-dark hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add address
          </button>
        )}
      </div>

      {editing === 'new' && formFor({ f_name: user?.name?.split(' ')[0] || '', l_name: user?.name?.split(' ').slice(1).join(' ') || '', phone: user?.phone || '' })}

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
      ) : addresses.length === 0 && editing !== 'new' ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-card p-12 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-gray-500"><MapPin className="h-8 w-8" /></span>
          <p className="mt-4 text-lg font-bold text-white">No saved addresses</p>
          <p className="mt-1 text-gray-400">Add one now and checkout takes seconds.</p>
          <button type="button" onClick={() => setEditing('new')} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-zan-cyan px-6 font-bold text-zan-dark hover:opacity-90">
            <Plus className="h-4 w-4" /> Add address
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((a, i) =>
            editing && editing !== 'new' && editing.id === a.id ? (
              <div key={a.id} className="md:col-span-2">{formFor(a)}</div>
            ) : (
              <div key={a.id} className="flex flex-col rounded-2xl border border-white/10 bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-white">{a.f_name} {a.l_name}</p>
                    {i === 0 && <span className="mt-1 inline-block rounded-full bg-zan-cyan/10 px-2 py-0.5 text-[11px] font-bold text-zan-cyan">Used first at checkout</span>}
                  </div>
                  <MapPin className="h-5 w-5 flex-shrink-0 text-gray-500" />
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-400">{a.address}<br />{a.city} {a.zip}</p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-300"><Phone className="h-3.5 w-3.5" /> {a.phone}</p>
                <div className="mt-4 flex gap-2 border-t border-white/10 pt-4">
                  <button type="button" onClick={() => setEditing(a)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/15 px-3 text-sm font-semibold text-white hover:border-zan-cyan/40">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  {confirmDelete === a.id ? (
                    <>
                      <button type="button" onClick={() => remove(a.id)} disabled={deleting === a.id} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-red-500 px-3 text-sm font-bold text-[#fff] disabled:opacity-60">
                        {deleting === a.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />} Delete
                      </button>
                      <button type="button" onClick={() => setConfirmDelete(null)} className="h-9 px-2 text-sm text-gray-400 hover:text-white">Keep</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setConfirmDelete(a.id)} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-gray-400 hover:bg-red-500/10 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default Addresses;
