import React, { useState } from 'react';
import { User, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription } from '../../components/ui/alert';

const AccountDetails = () => {
    const { user, token } = useAuth();
    
    const [isUpdatingInfo, setIsUpdatingInfo] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [infoError, setInfoError] = useState('');
    const [infoSuccess, setInfoSuccess] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const [userInfo, setUserInfo] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });

    const [passwordData, setPasswordData] = useState({
        current_password: '',
        new_password: '',
        new_password_confirmation: ''
    });

    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateInfo = async (e) => {
        e.preventDefault();
        setInfoError('');
        setInfoSuccess('');
        setIsUpdatingInfo(true);

        // Validation
        if (!userInfo.name.trim()) {
            setInfoError('Name is required.');
            setIsUpdatingInfo(false);
            return;
        }
        if (!userInfo.email.trim()) {
            setInfoError('Email is required.');
            setIsUpdatingInfo(false);
            return;
        }
        if (!userInfo.phone.trim()) {
            setInfoError('Phone number is required.');
            setIsUpdatingInfo(false);
            return;
        }

        try {
            const response = await fetch(`${config.baseURL}/update-user-info`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userInfo)
            });

            const data = await response.json();

            if (data.success) {
                setInfoSuccess('Account details updated successfully!');
                // Update local storage with new user data
                const updatedUser = { ...user, ...userInfo };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setTimeout(() => setInfoSuccess(''), 5000);
            } else {
                setInfoError(data.message || 'Failed to update account details.');
            }
        } catch (err) {
            setInfoError('An error occurred. Please try again.');
        } finally {
            setIsUpdatingInfo(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        // Validation
        if (!passwordData.current_password) {
            setPasswordError('Current password is required.');
            return;
        }
        if (!passwordData.new_password) {
            setPasswordError('New password is required.');
            return;
        }
        if (passwordData.new_password.length < 8) {
            setPasswordError('New password must be at least 8 characters.');
            return;
        }
        if (passwordData.new_password !== passwordData.new_password_confirmation) {
            setPasswordError('New passwords do not match.');
            return;
        }

        setIsChangingPassword(true);

        try {
            const response = await fetch(`${config.baseURL}/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(passwordData)
            });

            const data = await response.json();

            if (data.success) {
                setPasswordSuccess('Password changed successfully!');
                setPasswordData({
                    current_password: '',
                    new_password: '',
                    new_password_confirmation: ''
                });
                setTimeout(() => setPasswordSuccess(''), 5000);
            } else {
                setPasswordError(data.message || 'Failed to change password.');
            }
        } catch (err) {
            setPasswordError('An error occurred. Please try again.');
        } finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6 pb-4 border-b border-white/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <User className="h-6 w-6 text-zan-cyan" />
                    Account Details
                </h2>
                <p className="text-sm text-gray-300 mt-1">Update your personal information and password</p>
            </div>

            <div className="space-y-8">
                {/* Personal Information Form */}
                <div className="bg-card border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                    
                    {infoSuccess && (
                        <Alert className="mb-4 border-green-400 bg-emerald-500/10">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                            <AlertDescription className="text-emerald-400">{infoSuccess}</AlertDescription>
                        </Alert>
                    )}

                    {infoError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{infoError}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleUpdateInfo} className="space-y-4 max-w-lg">
                        <div>
                            <Label htmlFor="name">Full Name *</Label>
                            <Input 
                                id="name" 
                                name="name"
                                value={userInfo.name} 
                                onChange={handleInfoChange}
                                className="mt-1.5" 
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email Address *</Label>
                            <Input 
                                id="email" 
                                name="email"
                                type="email" 
                                value={userInfo.email} 
                                onChange={handleInfoChange}
                                className="mt-1.5" 
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone Number *</Label>
                            <Input 
                                id="phone" 
                                name="phone"
                                type="tel" 
                                value={userInfo.phone} 
                                onChange={handleInfoChange}
                                className="mt-1.5" 
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input 
                                id="address" 
                                name="address"
                                value={userInfo.address} 
                                onChange={handleInfoChange}
                                placeholder="Enter your address"
                                className="mt-1.5"
                            />
                        </div>
                        <div className="pt-2">
                            <Button 
                                type="submit"
                                disabled={isUpdatingInfo}
                                className="bg-zan-cyan hover:bg-cyan-300"
                            >
                                {isUpdatingInfo ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Updating...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Password Change Form */}
                <div className="bg-card border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                    
                    {passwordSuccess && (
                        <Alert className="mb-4 border-green-400 bg-emerald-500/10">
                            <CheckCircle className="h-4 w-4 text-emerald-400" />
                            <AlertDescription className="text-emerald-400">{passwordSuccess}</AlertDescription>
                        </Alert>
                    )}

                    {passwordError && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{passwordError}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
                        <div>
                            <Label htmlFor="current_password">Current Password *</Label>
                            <Input 
                                id="current_password" 
                                name="current_password"
                                type="password" 
                                value={passwordData.current_password}
                                onChange={handlePasswordChange}
                                className="mt-1.5"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <Label htmlFor="new_password">New Password *</Label>
                            <Input 
                                id="new_password" 
                                name="new_password"
                                type="password" 
                                value={passwordData.new_password}
                                onChange={handlePasswordChange}
                                className="mt-1.5"
                                placeholder="Enter new password (min 8 characters)"
                            />
                        </div>
                        <div>
                            <Label htmlFor="new_password_confirmation">Confirm New Password *</Label>
                            <Input 
                                id="new_password_confirmation" 
                                name="new_password_confirmation"
                                type="password" 
                                value={passwordData.new_password_confirmation}
                                onChange={handlePasswordChange}
                                className="mt-1.5"
                                placeholder="Re-enter new password"
                            />
                        </div>
                        <div className="pt-2">
                            <Button 
                                type="submit"
                                disabled={isChangingPassword}
                                className="bg-zan-cyan hover:bg-cyan-300"
                            >
                                {isChangingPassword ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Changing...
                                    </>
                                ) : (
                                    'Change Password'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AccountDetails;