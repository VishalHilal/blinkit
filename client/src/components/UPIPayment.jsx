import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import { useNavigate } from 'react-router-dom';

const UPIPayment = ({ amount, addressId, cartItems, onSuccess }) => {
    const navigate = useNavigate();
    const [upiId, setUpiId] = useState('');
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');

    // UPI ID validation regex
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]{3,}$/;

    const validateUPI = (upi) => {
        if (!upi) {
            setError('UPI ID is required');
            return false;
        }
        if (!upiRegex.test(upi)) {
            setError('Please enter a valid UPI ID (e.g., name@bank)');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateUPI(upiId)) {
            return;
        }

        if (!addressId) {
            toast.error('Please select a delivery address');
            return;
        }

        if (!cartItems || cartItems.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setProcessing(true);
        try {
            // Calculate subtotal and total amount
            const subTotalAmt = cartItems.reduce((total, item) => {
                return total + (item.productId.price * item.quantity);
            }, 0);

            // Create payment intent with UPI payment method
            const response = await Axios({
                ...SummaryApi.payment_url,
                data: {
                    list_items: cartItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity
                    })),
                    totalAmt: amount,
                    subTotalAmt: subTotalAmt,
                    addressId: addressId,
                    payment_method: 'upi',
                    upi_id: upiId
                }
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Payment failed');
            }

            // For demo purposes, simulate a successful payment
            toast.success('Payment successful!');
            
            // Create a mock successful payment intent
            const mockPaymentIntent = {
                id: `pi_${Date.now()}`,
                status: 'succeeded',
                amount: amount * 100,
                currency: 'inr',
                payment_method: 'upi',
                payment_method_details: {
                    type: 'upi',
                    upi: {
                        vpa: upiId
                    }
                }
            };

            // Call onSuccess with the mock payment intent
            await onSuccess(mockPaymentIntent);

            // Navigate to success page
            navigate('/success', {
                state: {
                    text: "Order",
                    paymentId: mockPaymentIntent.id
                }
            });

        } catch (error) {
            console.error('UPI Payment Error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Payment failed. Please try again.';
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Pay using UPI</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                        UPI ID
                    </label>
                    <input
                        type="text"
                        id="upiId"
                        value={upiId}
                        onChange={(e) => {
                            setUpiId(e.target.value);
                            validateUPI(e.target.value);
                        }}
                        placeholder="Enter your UPI ID (e.g., name@bank)"
                        className={`w-full p-2 border rounded-md ${
                            error ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        disabled={processing}
                    />
                    {error && (
                        <p className="mt-1 text-sm text-red-600">{error}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                        Example: name@bank, name@upi, name@paytm
                    </p>
                    <p className="mt-2 text-xs text-blue-600">
                        Note: This is a demo mode. Any valid UPI ID will be accepted and payment will be simulated as successful.
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={processing || !upiId || !!error || !addressId}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                        processing || !upiId || !!error || !addressId
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                    {processing ? 'Processing...' : `Pay ₹${amount}`}
                </button>

                <div className="mt-4 text-sm text-gray-600">
                    <p className="font-medium mb-2">Supported UPI Apps:</p>
                    <div className="flex flex-wrap gap-4">
                        <span className="px-2 py-1 bg-gray-100 rounded">Google Pay</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">PhonePe</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">Paytm</span>
                        <span className="px-2 py-1 bg-gray-100 rounded">BHIM</span>
                    </div>
                </div>

                {!addressId && (
                    <p className="text-sm text-red-600 mt-2">
                        Please select a delivery address before proceeding with payment
                    </p>
                )}
            </form>
        </div>
    );
};

export default UPIPayment; 