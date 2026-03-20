import React, { useState, useEffect } from 'react';
import { rentalAgreementsAPI } from '../../services/api';

const RentalAgreement = ({ rentalId }) => {
  const [agreement, setAgreement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [signing, setSigning] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmSign, setShowConfirmSign] = useState(false);

  useEffect(() => {
    loadAgreement();
  }, [rentalId]);

  const loadAgreement = async () => {
    try {
      setLoading(true);
      const response = await rentalAgreementsAPI.getByRental(rentalId);
      setAgreement(response.data);
    } catch {
      // Agreement not found - that's okay, user can generate one
      setAgreement(null);
    } finally {
      setLoading(false);
    }
  };

  const generateAgreement = async () => {
    try {
      setGenerating(true);
      setError('');
      await rentalAgreementsAPI.generate(rentalId);
      await loadAgreement(); // Reload to get the generated agreement
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate agreement');
    } finally {
      setGenerating(false);
    }
  };

  const downloadAgreement = async () => {
    try {
      setDownloading(true);
      setError('');
      const response = await rentalAgreementsAPI.download(rentalId);

      // Create blob and download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rental_agreement_${rentalId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to download agreement');
    } finally {
      setDownloading(false);
    }
  };

  const signAgreement = async () => {
    try {
      setSigning(true);
      setError('');
      await rentalAgreementsAPI.sign(rentalId);
      setShowConfirmSign(false);
      await loadAgreement(); // Reload to update signed status
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sign agreement');
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Rental Agreement</h2>
        </div>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading agreement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Rental Agreement</h2>
        </div>
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {!agreement ? (
            <div className="text-center">
              <p className="text-gray-500 mb-4">
                No rental agreement has been generated yet for this rental.
              </p>
              <button
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={generateAgreement}
                disabled={generating}
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                    Generating...
                  </>
                ) : (
                  'Generate Agreement'
                )}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <strong className="text-gray-700">Status:</strong>{' '}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  agreement.signed_at ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {agreement.signed_at ? 'Signed' : 'Pending Signature'}
                </span>
              </div>

              <div className="mb-4">
                <strong className="text-gray-700">Generated:</strong> {new Date(agreement.generated_at).toLocaleString()}
              </div>

              {agreement.signed_at && (
                <div className="mb-4">
                  <strong className="text-gray-700">Signed:</strong> {new Date(agreement.signed_at).toLocaleString()}
                </div>
              )}

              <div className="flex flex-wrap gap-3 mb-4">
                <button
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={downloadAgreement}
                  disabled={downloading}
                >
                  {downloading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2 inline-block"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download PDF
                    </>
                  )}
                </button>

                {!agreement.signed_at && (
                  <button
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => setShowConfirmSign(true)}
                    disabled={signing}
                  >
                    {signing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                        Signing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Sign Agreement
                      </>
                    )}
                  </button>
                )}
              </div>

              {agreement.agreement_text && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Agreement Preview:</h3>
                  <div className="border border-gray-200 p-4 bg-gray-50 rounded-lg max-h-80 overflow-y-auto text-sm whitespace-pre-wrap">
                    {agreement.agreement_text}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Sign Confirmation Modal */}
      {showConfirmSign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Confirm Agreement Signature</h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowConfirmSign(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">Are you sure you want to sign this rental agreement?</p>
              <p className="text-gray-500 text-sm">
                By signing, you agree to the terms and conditions outlined in the rental agreement.
                This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition duration-200"
                onClick={() => setShowConfirmSign(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 border border-transparent rounded-lg text-white bg-green-600 hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={signAgreement}
                disabled={signing}
              >
                {signing ? 'Signing...' : 'Sign Agreement'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RentalAgreement;
