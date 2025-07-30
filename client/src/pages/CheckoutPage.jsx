import React, { useState, useEffect } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import AddAddress from '../components/AddAddress'
import { useSelector } from 'react-redux'
import AxiosToastError from '../utils/AxiosToastError'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import { useNavigate, useLocation } from 'react-router-dom'
import StripePayment from '../components/StripePayment'
import UPIPayment from '../components/UPIPayment'

const CheckoutPage = () => {
  const { notDiscountTotalPrice, totalPrice, totalQty, fetchCartItem, fetchOrder } = useGlobalContext()
  const [openAddress, setOpenAddress] = useState(false)
  const addressList = useSelector(state => state.addresses.addressList)
  const [selectAddress, setSelectAddress] = useState(0)
  const cartItemsList = useSelector(state => state.cartItem.cart)
  const navigate = useNavigate()
  const location = useLocation();
  const [paymentMethod, setPaymentMethod] = useState('card') // 'cod' or 'card' or 'upi'
  const user = useSelector(state => state.user);

  useEffect(() => {
    if (!user._id) {
      navigate('/login', { state: { from: location.pathname } });
    }
  }, [user, navigate, location]);

  const handleCashOnDelivery = async() => {
      if (!addressList[selectAddress]?._id) {
          toast.error('Please add and select a delivery address first')
          return
      }

      try {
          const response = await Axios({
            ...SummaryApi.CashOnDeliveryOrder,
            data : {
              list_items : cartItemsList,
              addressId : addressList[selectAddress]?._id,
              subTotalAmt : totalPrice,
              totalAmt :  totalPrice,
            }
          })

          const { data : responseData } = response

          if(responseData.success){
              toast.success(responseData.message)
              if(fetchCartItem){
                fetchCartItem()
              }
              if(fetchOrder){
                fetchOrder()
              }
              navigate('/success',{
                state : {
                  text : "Order"
                }
              })
          }

      } catch (error) {
        AxiosToastError(error)
      }
  }

  return (
    <section className='bg-blue-50'>
      <div className='container mx-auto p-4 flex flex-col lg:flex-row w-full gap-5 justify-between'>
        <div className='w-full'>
          {/***address***/}
          <h3 className='text-lg font-semibold mb-4'>Choose your address</h3>
          <div className='bg-white p-4 rounded-lg shadow-sm'>
            {addressList.length === 0 ? (
                <div className='text-center p-4 text-gray-600'>
                    No delivery addresses found. Please add an address to continue.
                </div>
            ) : (
                addressList.map((address, index) => {
                    return (
                        <label key={address._id} htmlFor={"address" + index} className={address.status ? undefined : "hidden"}>
                            <div className='border rounded p-3 flex gap-3 hover:bg-blue-50 mb-3'>
                                <div>
                                    <input 
                                        id={"address" + index} 
                                        type='radio' 
                                        value={index} 
                                        onChange={(e) => setSelectAddress(e.target.value)} 
                                        name='address'
                                        checked={Number(selectAddress) === index}
                                        className="w-4 h-4"
                                    />
                                </div>
                                <div className="text-gray-700">
                                    <p className="font-medium">{address.address_line}</p>
                                    <p>{address.city}</p>
                                    <p>{address.state}</p>
                                    <p>{address.country} - {address.pincode}</p>
                                    <p className="font-medium">{address.mobile}</p>
                                </div>
                            </div>
                        </label>
                    )
                })
            )}
            <div 
                onClick={() => setOpenAddress(true)} 
                className='h-16 bg-blue-50 border-2 border-dashed flex justify-center items-center cursor-pointer hover:bg-blue-100 transition-colors rounded-lg'
            >
                {addressList.length === 0 ? 'Add your first address' : 'Add another address'}
            </div>
          </div>
        </div>

        <div className='w-full max-w-md'>
          {/**summary**/}
          <div className='bg-white rounded-lg shadow-sm p-4 mb-4'>
            <h3 className='text-lg font-semibold mb-4'>Summary</h3>
            <div className='space-y-3'>
              <div className='flex justify-between text-gray-700'>
                <p>Items total</p>
                <p className='flex items-center gap-2'>
                  <span className='line-through text-neutral-400'>{DisplayPriceInRupees(notDiscountTotalPrice)}</span>
                  <span className="font-medium">{DisplayPriceInRupees(totalPrice)}</span>
                </p>
              </div>
              <div className='flex justify-between text-gray-700'>
                <p>Quantity total</p>
                <p className='font-medium'>{totalQty} items</p>
              </div>
              <div className='flex justify-between text-gray-700'>
                <p>Delivery Charge</p>
                <p className='font-medium'>Free</p>
              </div>
              <div className='border-t pt-3 flex justify-between items-center'>
                <p className='font-bold text-gray-800'>Grand total</p>
                <p className='font-bold text-lg text-gray-800'>{DisplayPriceInRupees(totalPrice)}</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          {/* card payment method  */}
          <div className='bg-white rounded-lg shadow-sm p-4'>
            <h3 className='text-lg font-semibold mb-4'>Payment Method</h3>
            <div className='space-y-4'>
              <div className='flex items-center gap-3'>
                <input
                  type="radio"
                  id="card"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <label htmlFor="card" className='font-medium text-gray-700'>Credit/Debit Card</label>
              </div>

              {/* upi payment method */}
              <div className='flex items-center gap-3'>
                <input
                  type="radio"
                  id="upi"
                  name="payment"
                  value="upi"
                  checked={paymentMethod === 'upi'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <label htmlFor="upi" className='font-medium text-gray-700'>UPI Payment</label>
              </div>

              {/* cash on delivery  method */}
              <div className='flex items-center gap-3'>
                <input
                  type="radio"
                  id="cod"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-4 h-4"
                />
                <label htmlFor="cod" className='font-medium text-gray-700'>Cash on Delivery</label>
              </div>

              {paymentMethod === 'cod' ? (
                <button 
                  onClick={handleCashOnDelivery}
                  className='w-full py-3 px-4 border-2 border-green-600 font-bold text-green-600 hover:bg-green-600 hover:text-white rounded-md transition-all transform hover:scale-[1.02] shadow-sm'
                >
                  Pay on Delivery
                </button>
              ) : (
                <div className='mt-4'>
                  {!addressList[selectAddress]?._id ? (
                    <div className='text-center p-4 bg-red-50 text-red-600 rounded-md'>
                      Please add and select a delivery address first
                    </div>
                  ) : (
                    <>
                      {paymentMethod === 'card' && (
                        <StripePayment
                          amount={totalPrice}
                          addressId={addressList[selectAddress]?._id}
                          cartItems={cartItemsList}
                          user={user}
                          address={addressList[selectAddress]}
                          onSuccess={() => {
                            if (fetchCartItem) fetchCartItem();
                            if (fetchOrder) fetchOrder();
                          }}
                        />
                      )}

                      {paymentMethod === 'upi' && (
                        <UPIPayment
                          amount={totalPrice}
                          addressId={addressList[selectAddress]?._id}
                          cartItems={cartItemsList}
                          onSuccess={() => {
                            if (fetchCartItem) fetchCartItem();
                            if (fetchOrder) fetchOrder();
                          }}
                        />
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {openAddress && (
        <AddAddress close={() => setOpenAddress(false)} />
      )}
    </section>
  )
}

export default CheckoutPage
