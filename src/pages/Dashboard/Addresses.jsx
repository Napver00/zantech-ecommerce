import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Loader2, AlertCircle, CheckCircle, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Alert, AlertDescription } from '../../components/ui/alert';

const Addresses = () => {
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    f_name: '',
    l_name: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${config.baseURL}/shipping-addresses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAddresses(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setFormData({
      f_name: address.f_name,
      l_name: address.l_name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      zip: address.zip
    });
    setShowForm(true);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) {
      return;
    }

    setIsDeleting(id);
    setError('');

    try {
      const response = await fetch(`${config.baseURL}/shipping-addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Address deleted successfully!');
        fetchAddresses();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete address.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      f_name: '',
      l_name: '',
      phone: '',
      address: '',
      city: '',
      zip: ''
    });
    setShowForm(false);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    // Validation
    if (!formData.f_name.trim() || !formData.l_name.trim()) {
      setError('First name and last name are required.');
      setIsSubmitting(false);
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required.');
      setIsSubmitting(false);
      return;
    }
    if (!formData.address.trim()) {
      setError('Address is required.');
      setIsSubmitting(false);
      return;
    }
    if (!formData.city.trim()) {
      setError('City is required.');
      setIsSubmitting(false);
      return;
    }
    if (!formData.zip.trim()) {
      setError('ZIP code is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const url = editingId 
        ? `${config.baseURL}/shipping-addresses/${editingId}`
        : `${config.baseURL}/shipping-addresses`;
      
      const method = editingId ? 'PUT' : 'POST';

      const body = editingId 
        ? formData 
        : { User_id: user.id, ...formData };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(editingId ? 'Address updated successfully!' : 'Address added successfully!');
        resetForm();
        fetchAddresses();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || `Failed to ${editingId ? 'update' : 'add'} address.`);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-zan-cyan" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <MapPin className="h-6 w-6 text-zan-cyan" />
            Shipping Addresses
          </h2>
          <p className="text-sm text-gray-300 mt-1">Manage your delivery addresses</p>
        </div>
        {!showForm && (
          <Button 
            onClick={() => setShowForm(true)}
            className="bg-zan-cyan hover:bg-cyan-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="mb-6 border-green-400 bg-emerald-500/10">
          <CheckCircle className="h-4 w-4 text-emerald-400" />
          <AlertDescription className="text-emerald-400">{success}</AlertDescription>
        </Alert>
      )}

      {/* Global Error Message */}
      {error && !showForm && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Add/Edit Address Form */}
      {showForm && (
        <div className="bg-background border border-white/10 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={resetForm}
            >
              Cancel
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="f_name">First Name *</Label>
                <Input
                  id="f_name"
                  name="f_name"
                  value={formData.f_name}
                  onChange={handleInputChange}
                  placeholder="John"
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="l_name">Last Name *</Label>
                <Input
                  id="l_name"
                  name="l_name"
                  value={formData.l_name}
                  onChange={handleInputChange}
                  placeholder="Doe"
                  className="mt-1.5"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="01712345678"
                className="mt-1.5"
                required
              />
            </div>

            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Main Street"
                className="mt-1.5"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Dhaka"
                  className="mt-1.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="zip">ZIP Code *</Label>
                <Input
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleInputChange}
                  placeholder="1229"
                  className="mt-1.5"
                  required
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-zan-cyan hover:bg-cyan-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    {editingId ? 'Updating...' : 'Saving...'}
                  </>
                ) : (
                  editingId ? 'Update Address' : 'Save Address'
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-12 bg-background rounded-lg border border-white/10">
          <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white mb-1">No addresses yet</h3>
          <p className="text-gray-300 mb-4">Add your first shipping address to get started</p>
          {!showForm && (
            <Button 
              onClick={() => setShowForm(true)}
              className="bg-zan-cyan hover:bg-cyan-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div 
              key={addr.id} 
              className="bg-card border border-white/10 rounded-lg p-5 hover:border-zan-cyan/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-zan-cyan" />
                  <h4 className="font-semibold text-white">
                    {addr.f_name} {addr.l_name}
                  </h4>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(addr)}
                    className="h-8 w-8 p-0 hover:bg-zan-cyan/10 hover:text-zan-cyan"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(addr.id)}
                    disabled={isDeleting === addr.id}
                    className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-400"
                  >
                    {isDeleting === addr.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-1 text-sm text-gray-300">
                <p>{addr.address}</p>
                <p>{addr.city}, {addr.zip}</p>
                <p className="font-medium text-white">{addr.phone}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;