'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FloatingLogos } from '@/components/ui/FloatingLogos';
import { FaEnvelope, FaUser, FaLock, FaAt, FaPhone, FaCheck, FaArrowLeft, FaGoogle } from 'react-icons/fa';
import { AuthResponse } from '@/types';

type Stage = 'account' | 'details';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  
  // Stage management
  const [stage, setStage] = useState<Stage>('account');
  
  // Stage 1: Account
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Stage 2: Details (Chat-like)
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Common
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  // Password validation
  const passwordErrors = [];
  if (password.length > 0 && password.length < 8) passwordErrors.push('At least 8 characters');
  if (password.length > 0 && !/[A-Z]/.test(password)) passwordErrors.push('One uppercase letter');
  if (password.length > 0 && !/[0-9]/.test(password)) passwordErrors.push('One number');
  const passwordValid = password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password);

  // Phone validation (India only, 10 digits)
  const phoneValid = /^[6-9]\d{9}$/.test(phoneNumber);

  const handleContinueToDetails = () => {
    setError('');
    
    if (!email || !username || !password) {
      setError('Please fill all required fields');
      return;
    }
    
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    
    if (!passwordValid) {
      setError('Password does not meet requirements');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setStage('details');
  };

  const handleCompleteRegistration = async () => {
    setError('');
    setIsLoading(true);
    
    if (!fullName) {
      setError('Please enter your name');
      setIsLoading(false);
      return;
    }
    
    if (phoneNumber && !phoneValid) {
      setError('Please enter a valid 10-digit Indian phone number');
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await api.register(
        fullName,
        username,
        email,
        password,
        phoneNumber || undefined
      ) as AuthResponse;
      
      login(response.user, response.token);
      router.push('/add');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setIsGoogleLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const response = await api.googleAuth(
        user.uid,
        user.email || '',
        user.displayName || '',
        user.photoURL || undefined
      ) as AuthResponse;
      
      login(response.user, response.token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google signup failed');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const questions = [
    { question: "Tell me your name", field: 'name' },
    { question: "What's your phone number? (optional)", field: 'phone' },
  ];

  const renderStage = () => {
    switch (stage) {
      case 'account':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <FaUser className="text-white text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-white">Create Your Account</h2>
              <p className="text-gray-400 text-sm mt-1">Enter your details to get started</p>
            </div>

            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<FaEnvelope className="text-gray-500" />}
              required
            />

            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              icon={<FaAt className="text-gray-500" />}
              required
            />

            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<FaLock className="text-gray-500" />}
                required
              />
              {passwordErrors.length > 0 && (
                <div className="mt-1 text-xs text-gray-500">
                  {passwordErrors.map((err, i) => (
                    <span key={i} className="mr-2 text-yellow-500">• {err}</span>
                  ))}
                </div>
              )}
              {passwordValid && (
                <div className="mt-1 text-xs text-green-500">✓ Strong password</div>
              )}
            </div>

            <Input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<FaLock className="text-gray-500" />}
              error={confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined}
              required
            />

            <Button
              variant="gradient"
              className="w-full"
              onClick={handleContinueToDetails}
              disabled={!email || !username || !passwordValid || password !== confirmPassword}
            >
              Continue
            </Button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-700" />
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-700" />
            </div>

            {/* Google Signup */}
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleGoogleSignup}
              isLoading={isGoogleLoading}
            >
              <FaGoogle />
              Continue with Google
            </Button>
          </div>
        );

      case 'details':
        return (
          <div className="space-y-4 animate-fadeIn">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center">
                <FaUser className="text-white text-2xl" />
              </div>
              <h2 className="text-xl font-bold text-white">Almost There!</h2>
              <p className="text-gray-400 text-sm mt-1">Just a few more details</p>
            </div>

            {/* Chat-like conversation */}
            <div className="space-y-4">
              {/* Question 1 */}
              <div className="chat-bubble px-4 py-3">
                <p className="text-gray-200">{questions[0].question}</p>
              </div>
              <div className="flex justify-end">
                <div className="w-full">
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    icon={<FaUser className="text-gray-500" />}
                  />
                </div>
              </div>

              {/* Question 2 - Shows after name is entered */}
              {fullName.length >= 2 && (
                <>
                  <div className="chat-bubble px-4 py-3 animate-fadeIn">
                    <p className="text-gray-200">{questions[1].question}</p>
                  </div>
                  <div className="flex justify-end animate-fadeIn">
                    <div className="w-full">
                      <Input
                        type="tel"
                        placeholder="10-digit mobile number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        icon={<FaPhone className="text-gray-500" />}
                        error={phoneNumber.length > 0 && !phoneValid ? 'Enter valid 10-digit Indian number' : undefined}
                      />
                      <p className="text-gray-600 text-xs mt-1">India only • No country code needed</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {fullName.length >= 2 && (
              <Button
                variant="gradient"
                className="w-full mt-6 animate-fadeIn"
                onClick={handleCompleteRegistration}
                isLoading={isLoading}
              >
                Complete Registration
              </Button>
            )}

            <button
              onClick={() => setStage('account')}
              className="w-full text-center text-gray-500 text-sm hover:text-gray-300"
            >
              <FaArrowLeft className="inline mr-2" /> Back
            </button>
          </div>
        );
    }
  };

  // Progress indicator
  const stages: Stage[] = ['account', 'details'];
  const currentStageIndex = stages.indexOf(stage);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <FloatingLogos />
      
      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gradient mb-2">SubTracker</h1>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {stages.map((s, i) => (
            <React.Fragment key={s}>
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i <= currentStageIndex 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                    : 'bg-gray-800 text-gray-500'
                }`}
              >
                {i < currentStageIndex ? <FaCheck size={12} /> : i + 1}
              </div>
              {i < stages.length - 1 && (
                <div className={`w-12 h-1 rounded ${i < currentStageIndex ? 'bg-indigo-500' : 'bg-gray-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Registration Card */}
        <div className="glass-light rounded-2xl p-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {renderStage()}
        </div>

        {/* Login Link */}
        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-gradient font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
