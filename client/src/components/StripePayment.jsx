import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../provider/GlobalProvider';
import { useDispatch } from 'react-redux';
import { handleAddItemCart } from '../store/cartProduct';
import './StripePayment.css';

const StripePayment = ({ amount, addressId, cartItems, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { fetchCartItem, fetchOrder } = useGlobalContext();
    const dispatch = useDispatch();

    const clearCart = async () => {
        try {
            // Clear cart on the server
            await Axios({
                ...SummaryApi.deleteCartItem,
                data: {
                    clearAll: true // Add this flag to clear all items
                }
            });
            
            // Clear cart in Redux store
            dispatch(handleAddItemCart([]));
            
            // Fetch updated cart and order data
            if (fetchCartItem) {
                await fetchCartItem();
            }
            if (fetchOrder) {
                await fetchOrder();
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error('Error clearing cart. Please try refreshing the page.');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        try {
            // Create payment intent on the server
            const response = await Axios({
                ...SummaryApi.payment_url,
                data: {
                    amount: amount * 100,
                    currency: 'inr',
                    list_items: cartItems,
                    addressId: addressId,
                    subTotalAmt: amount,
                    totalAmt: amount,
                }
            });

            const { clientSecret } = response.data;

            // Confirm the payment with Stripe
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                }
            });

            if (stripeError) {
                setError(stripeError.message);
                toast.error(stripeError.message);
            } else if (paymentIntent.status === 'succeeded') {
                // Clear the cart immediately after successful payment
                await clearCart();

                toast.success('Payment successful!');
                navigate('/success', {
                    state: {
                        text: "Payment"
                    }
                });
                if (onSuccess) {
                    onSuccess();
                }
            }
        } catch (error) {
            setError('An error occurred while processing your payment.');
            toast.error('Payment failed. Please try again.');
        }

        setProcessing(false);
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
                backgroundColor: '#f8fafc',
            },
            invalid: {
                color: '#9e2146',
            },
        },
        hidePostalCode: true,
        supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto px-0 sm:px-3">
            <div className="mb-6">
                <div className="bg-gray-50 rounded-lg border border-gray-200">
                    <div className="p-3 sm:p-4">
                        <div className="mb-2 text-sm text-gray-600">
                            <p>Enter your card details below. The card number will be automatically formatted for security.</p>
                            <p className="mt-1">Supported cards: Visa, Mastercard, American Express, Discover</p>
                        </div>
                        <div className="stripe-card-element">
                            <CardElement 
                                options={{
                                    ...cardElementOptions,
                                    style: {
                                        ...cardElementOptions.style,
                                        base: {
                                            ...cardElementOptions.style.base,
                                            fontSize: '17px',
                                            lineHeight: '30px',
                                            '::placeholder': {
                                                color: '#aab7c4',
                                                fontSize: '17px',
                                            },
                                        },
                                    },
                                }}
                                className="stripe-card-element-input"
                                onChange={(e) => {
                                    if (e.error) {
                                        setError(e.error.message);
                                    } else {
                                        setError(null);
                                    }
                                }}
                            />
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                            <p>• Your card number will be automatically formatted</p>
                            <p>• Only the last 4 digits will be visible after entry</p>
                            <p>• You'll be automatically moved to the next field</p>
                        </div>
                    </div>
                </div>
                {error && (
                    <div className="mt-2 text-red-600 text-sm font-medium" role="alert">
                        {error}
                    </div>
                )}
            </div>
            <button
                type="submit"
                disabled={!stripe || processing}
                className={`w-full py-3 px-4 rounded-md font-bold text-white transition-all transform
                    ${processing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-primary-200 hover:bg-primary-100 hover:scale-[1.02] shadow-md'
                    }`}
                aria-busy={processing}
            >
                {processing ? 'Processing...' : `Pay ₹${amount}`}
            </button>
        </form>
    );
};

export default StripePayment; 