import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Mail, Lock, User, Phone, Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';

export const AuthSheet = () => {
  const [view, setView] = useState('login');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, loading, error, resendVerificationEmail } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    await login(email, password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const phone = e.target.phone.value;
    const password = e.target.password.value;
    const result = await register(name, email, phone, password);
    if (result.success) {
      setRegisteredEmail(email);
      setView('registerSuccess');
      setShowPassword(false);
    }
  };
  
  const handleResend = async () => {
    const result = await resendVerificationEmail(registeredEmail);
    if (result.success) {
      setResendMessage(result.message);
      setTimeout(() => setResendMessage(''), 5000);
    }
  };

  const switchToRegister = () => {
    setView('register');
    setShowPassword(false);
  };

  const switchToLogin = () => {
    setView('login');
    setShowPassword(false);
  };

  const renderContent = () => {
    switch (view) {
      case 'login':
        return (
          <div className="space-y-6 px-1">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
                <p className="text-sm text-gray-600 mt-1">Sign in to access your account</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-sm font-semibold text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input 
                    id="login-email" 
                    name="email" 
                    type="email" 
                    placeholder="you@example.com" 
                    required 
                    className="pl-11 h-12 text-base border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input 
                    id="login-password" 
                    name="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required 
                    className="pl-11 pr-11 h-12 text-base border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">New to ZAN Tech?</span>
                </div>
              </div>

              <button 
                type="button" 
                onClick={switchToRegister} 
                className="w-full h-12 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 text-base hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
              >
                Create New Account
              </button>
            </form>
          </div>
        );

      case 'register':
        return (
          <div className="space-y-6 px-1">
            <button
              type="button"
              onClick={switchToLogin}
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </button>

            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
                <p className="text-sm text-gray-600 mt-1">Get started with us today!</p>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name" className="text-sm font-semibold text-gray-700">
                  Full Name
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input 
                    id="register-name" 
                    name="name" 
                    type="text" 
                    placeholder="Your Name" 
                    required 
                    className="pl-11 h-11 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email" className="text-sm font-semibold text-gray-700">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input 
                    id="register-email" 
                    name="email" 
                    type="email" 
                    placeholder="zantechbd@gmail.com" 
                    required 
                    className="pl-11 h-11 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-phone" className="text-sm font-semibold text-gray-700">
                  Phone
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input 
                    id="register-phone" 
                    name="phone" 
                    type="tel" 
                    placeholder="Your Phone Number" 
                    required 
                    className="pl-11 h-11 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input 
                    id="register-password" 
                    name="password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    required 
                    minLength={8}
                    className="pl-11 pr-11 h-11 text-base border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters required</p>
              </div>

              <Button 
                type="submit" 
                disabled={loading} 
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 rounded-lg mt-6"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>

              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={switchToLogin} 
                  className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
                >
                  Sign In
                </button>
              </p>
            </form>
          </div>
        );

      case 'registerSuccess':
        return (
          <div className="text-center space-y-6 py-8 px-1">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 rounded-full w-24 h-24 flex items-center justify-center shadow-xl">
                <CheckCircle className="w-12 h-12 text-white" />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-900">Registration Successful!</h3>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  A verification link has been sent to:
                </p>
                <p className="font-bold text-blue-700 text-base break-all">{registeredEmail}</p>
              </div>
              <p className="text-sm text-gray-600 px-2 leading-relaxed">
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>

            {resendMessage && (
              <Alert className="bg-green-50 border-2 border-green-300 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="font-medium">{resendMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3 pt-4">
              <Button 
                onClick={switchToLogin} 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-md hover:shadow-lg transition-all duration-200 rounded-lg"
              >
                Back to Login
              </Button>
              
              <Button 
                onClick={handleResend} 
                variant="outline" 
                disabled={loading} 
                className="w-full h-12 border-2 border-gray-300 hover:bg-gray-50 hover:border-blue-400 transition-all duration-200 rounded-lg font-semibold"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>Resend Verification Email</span>
                  </div>
                )}
              </Button>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Didn't receive the email? Check your spam folder or try resending.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
      <SheetHeader className="sr-only">
        <SheetTitle>
          {view === 'login' && 'Welcome Back!'}
          {view === 'register' && 'Create an Account'}
          {view === 'registerSuccess' && 'Registration Successful'}
        </SheetTitle>
        <SheetDescription>
          {view === 'login' && 'Sign in to continue.'}
          {view === 'register' && 'Get started with us today!'}
          {view === 'registerSuccess' && 'Check your email to verify your account'}
        </SheetDescription>
      </SheetHeader>

      <div className="py-6">
        {error && view !== 'registerSuccess' && (
          <Alert variant="destructive" className="mb-6 border-2 border-red-300 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 font-semibold ml-2">{error}</AlertDescription>
          </Alert>
        )}
        
        {renderContent()}
      </div>
    </SheetContent>
  );
};