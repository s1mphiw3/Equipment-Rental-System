import React, { useState, useEffect } from 'react';
import { penaltiesAPI } from '../../services/api';

const PenaltyDisplay = ({ rentalId, onSuccess }) => {
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentConfirm, setShowPaymentConfirm] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');

  useEffect(() => {
    loadPenalties();
  }, [rentalId]);

  const loadPenalties = async () => {
    try {
      setLoading(true);
      const response = await penaltiesAPI.getByRental(rentalId);
      setPenalties(response.data);
    } catch {
      setPenalties([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPenalty) {
      setError('No penalty selected');
      return;
    }

    try {
      setPaying(true);
      setError('');

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Process payment using the selected method
      await penaltiesAPI.payPenalty(selectedPenalty.id, {
        payment_method: selectedPaymentMethod
      });

      setShowPaymentConfirm(false);
      setSelectedPenalty(null);
      setSelectedPaymentMethod('card');
      await loadPenalties(); // Reload penalties
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.error || 'Failed to process payment');
    } finally {
      setPaying(false);
    }
  };

  const getPenaltyTypeBadgeColor = (type) => {
    switch (type) {
      case 'late_return': return 'bg-yellow-100 text-yellow-800';
      case 'damage': return 'bg-red-100 text-red-800';
      case 'lost_item': return 'bg-gray-100 text-gray-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (paidAt) => {
    return paidAt ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const unpaidPenalties = penalties.filter(p => !p.paid_at);
  const totalUnpaid = unpaidPenalties.reduce((sum, p) => sum + parseFloat(p.amount), 0);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Penalties & Fees</h2>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading penalties...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Penalties & Fees</h2>
        </div>
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {unpaidPenalties.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <strong className="text-yellow-800">Unpaid Penalties:</strong> ${totalUnpaid.toFixed(2)}
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {unpaidPenalties.length} pending
                </span>
              </div>
            </div>
          )}

          {penalties.length === 0 ? (
            <p className="text-gray-500 text-center">No penalties found for this rental.</p>
          ) : (
            <div className="space-y-4">
              {penalties.map((penalty) => (
                <div key={penalty.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPenaltyTypeBadgeColor(penalty.penalty_type)}`}>
                          {penalty.penalty_type.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(penalty.paid_at)}`}>
                          {penalty.paid_at ? 'Paid' : 'Unpaid'}
                        </span>
                        <small className="text-gray-500">
                          Applied: {new Date(penalty.applied_at).toLocaleString()}
                        </small>
                      </div>
                      <p className="mb-2 text-gray-700">{penalty.reason}</p>
                      <div className="flex items-center gap-3">
                        <strong className="text-red-600">${parseFloat(penalty.amount).toFixed(2)}</strong>
                        {penalty.paid_at && (
                          <small className="text-gray-500">
                            Paid: {new Date(penalty.paid_at).toLocaleString()}
                          </small>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-1 flex justify-end items-start">
                      {!penalty.paid_at && (
                        <button
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200"
                          onClick={() => {
                            setSelectedPenalty(penalty);
                            setShowPaymentConfirm(true);
                          }}
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Pay Penalty</h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setShowPaymentConfirm(false);
                  setSelectedPenalty(null);
                  setSelectedPaymentMethod('card');
                }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              {selectedPenalty && (
                <div className="max-w-md mx-auto">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Penalty Payment</h3>
                    <p className="text-gray-600 mt-1">Complete your penalty payment</p>
                  </div>

                  {/* Penalty Summary */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Penalty Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{selectedPenalty.penalty_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Reason:</span>
                        <span className="font-medium">{selectedPenalty.reason}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-2">
                        <span className="text-gray-900 font-semibold">Amount:</span>
                        <span className="text-lg font-bold text-red-600">${parseFloat(selectedPenalty.amount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Select Payment Method</h4>
                    <div className="grid grid-cols-1 gap-3">
                      {/* Card Payment */}
                      <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                        selectedPaymentMethod === 'card' ? 'border-primary-600 ring-2 ring-primary-600' : 'border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="payment-method"
                          value="card"
                          className="sr-only"
                          checked={selectedPaymentMethod === 'card'}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        />
                        <span className="flex flex-1">
                          <span className="flex flex-col">
                            <span className="flex items-center text-sm font-medium text-gray-900">
                              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Credit/Debit Card
                            </span>
                            <span className="mt-1 text-sm text-gray-500">Pay securely with your card</span>
                          </span>
                        </span>
                        <span className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                          selectedPaymentMethod === 'card' ? 'border-primary-600' : 'border-transparent'
                        }`} />
                      </label>

                      {/* Mobile Money */}
                      <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                        selectedPaymentMethod === 'mobile_money' ? 'border-primary-600 ring-2 ring-primary-600' : 'border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="payment-method"
                          value="mobile_money"
                          className="sr-only"
                          checked={selectedPaymentMethod === 'mobile_money'}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        />
                        <span className="flex flex-1">
                          <span className="flex flex-col">
                            <span className="flex items-center text-sm font-medium text-gray-900">
                              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              Mobile Money
                            </span>
                            <span className="mt-1 text-sm text-gray-500">Pay with your mobile wallet</span>
                          </span>
                        </span>
                        <span className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                          selectedPaymentMethod === 'mobile_money' ? 'border-primary-600' : 'border-transparent'
                        }`} />
                      </label>

                      {/* E-Wallet */}
                      <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${
                        selectedPaymentMethod === 'ewallet' ? 'border-primary-600 ring-2 ring-primary-600' : 'border-gray-300'
                      }`}>
                        <input
                          type="radio"
                          name="payment-method"
                          value="ewallet"
                          className="sr-only"
                          checked={selectedPaymentMethod === 'ewallet'}
                          onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                        />
                        <span className="flex flex-1">
                          <span className="flex flex-col">
                            <span className="flex items-center text-sm font-medium text-gray-900">
                              <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                              E-Wallet
                            </span>
                            <span className="mt-1 text-sm text-gray-500">Pay with digital wallet</span>
                          </span>
                        </span>
                        <span className={`pointer-events-none absolute -inset-px rounded-lg border-2 ${
                          selectedPaymentMethod === 'ewallet' ? 'border-primary-600' : 'border-transparent'
                        }`} />
                      </label>
                    </div>
                  </div>

                  {/* Demo Payment Notice */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-blue-800">Demo Payment System</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          This is a demonstration. No real payment will be processed.
                          Click "Complete Payment" to simulate a successful transaction.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        setShowPaymentConfirm(false);
                        setSelectedPenalty(null);
                        setSelectedPaymentMethod('card');
                      }}
                      className="btn-secondary"
                      disabled={paying}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePayment}
                      disabled={paying}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {paying ? (
                        <div className="flex items-center">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        'Complete Payment'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PenaltyDisplay;
