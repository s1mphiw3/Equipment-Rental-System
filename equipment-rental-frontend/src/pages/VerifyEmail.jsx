import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success', 'error', or null

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setVerificationStatus('error');
        setLoading(false);
        toast.error('Verification token is missing');
        return;
      }

      try {
        const response = await authAPI.verifyEmail(token);
        setVerificationStatus('success');
        toast.success(response.message || 'Email verified successfully!');
      } catch (error) {
        setVerificationStatus('error');
        toast.error(error.response?.data?.error || 'Verification failed');
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">ER</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Verifying Your Email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please wait while we verify your email address...
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="mt-4 text-center text-sm text-gray-600">
              Verifying...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            verificationStatus === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}>
            <span className="text-white font-bold text-lg">
              {verificationStatus === 'success' ? '✓' : '✕'}
            </span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          {verificationStatus === 'success' ? 'Email Verified!' : 'Verification Failed'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {verificationStatus === 'success'
            ? 'Your email has been successfully verified. You can now log in to your account.'
            : 'We could not verify your email. The link may be expired or invalid.'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {verificationStatus === 'success' ? (
              <>
                <p className="text-sm text-gray-600 mb-6">
                  Welcome to Equipment Rental System! You can now access all features of your account.
                </p>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Go to Login
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600 mb-6">
                  If you need a new verification link, you can request one from the login page.
                </p>
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="w-full flex justify-center py-2 px-4 border border-primary-600 rounded-md shadow-sm text-sm font-medium text-primary-600 bg-white hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Go to Login
                  </Link>
                  <Link
                    to="/register"
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Create New Account
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
