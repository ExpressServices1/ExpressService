import React, { useState, useRef, KeyboardEvent } from 'react';

const AdminLogin: React.FC = () => {
  const [step, setStep] = useState<'password' | 'otp'>('password');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const passwordRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);

  const handlePasswordNext = async () => {
    setError('');
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }
    try {
      const res = await fetch('https://expressback-kylv.onrender.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (res.ok) {
        setStep('otp');
        setTimeout(() => otpRef.current?.focus(), 100);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error');
    }
  };

  const handleOtpConfirm = async () => {
    setError('');
    if (!otp.trim()) {
      setError('Please enter the OTP sent to your email.');
      return;
    }
    try {
      const res = await fetch('https://expressback-kylv.onrender.com/api/admin/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        const expiry = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_token_expiry', expiry.toString());
        window.location.href = '/admindashboard/orders';
      } else {
        setError(data.error || 'OTP failed');
      }
    } catch {
      setError('Network error');
    }
  };

  const onPasswordKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePasswordNext();
    }
  };
  const onOtpKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleOtpConfirm();
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 pt-5 pb-16"></div>
      <div className="flex flex-col items-center justify-center mx-auto h-screen">
        <div className="w-full max-w-md bg-white/30 backdrop-blur-md p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-indigo-900 mb-4 text-center">
            {step === 'password' ? 'Enter Access Password' : 'Enter OTP'}
          </h2>

          {step === 'password' ? (
            <>
              <input
                ref={passwordRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={onPasswordKey}
                placeholder="Enter password"
                className="w-full px-4 py-3 mb-6 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                autoFocus
              />
              <button
                onClick={handlePasswordNext}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Next
              </button>
            </>
          ) : (
            <>
              <input
                ref={otpRef}
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onKeyDown={onOtpKey}
                placeholder="Enter OTP sent to your email"
                className="w-full px-4 py-3 mb-6 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                autoFocus
              />
              <button
                onClick={handleOtpConfirm}
                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Confirm
              </button>
            </>
          )}
          {error && <div className="mt-4 text-red-600 text-center">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
