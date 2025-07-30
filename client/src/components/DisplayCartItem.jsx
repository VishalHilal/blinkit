import React, { useState } from 'react'
import { IoClose } from 'react-icons/io5'
import { Link, useNavigate } from 'react-router-dom'
import { useGlobalContext } from '../provider/GlobalProvider'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { FaCaretRight } from "react-icons/fa";
import { useSelector } from 'react-redux'
import AddToCartButton from './AddToCartButton'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import imageEmpty from '../assets/empty_cart.webp'

const DisplayCartItem = ({close}) => {
    const { notDiscountTotalPrice, totalPrice ,totalQty} = useGlobalContext()
    const cartItem  = useSelector(state => state.cartItem.cart)
    const guestCart = useSelector(state => state.cartItem.guestCart)
    const user = useSelector(state => state.user)
    const [isLoggedInUser,setIsLoggedInUser] = useState(false)
    const navigate = useNavigate()

    // Calculate guest cart totals
    let guestTotalPrice = 0;
    let guestNotDiscountTotalPrice = 0;
    let guestTotalQty = 0;
    if (!user._id) {
        guestTotalQty = guestCart.reduce((sum, item) => sum + item.quantity, 0);
        guestTotalPrice = guestCart.reduce((sum, item) => sum + pricewithDiscount(item.price, item.discount) * item.quantity, 0);
        guestNotDiscountTotalPrice = guestCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    const redirectToCheckoutPage = ()=>{
        if(user?._id){
           setIsLoggedInUser(true)
            navigate("/checkout")
            if(close){
                close()
            }
            return
        }
        setIsLoggedInUser(false)  
        navigate("/login") ;
        close();

       
    }

    // Use correct cart and totals
    const isLoggedIn = !!user._id;
    const displayCart = isLoggedIn ? cartItem : guestCart;
    const displayTotalPrice = isLoggedIn ? totalPrice : guestTotalPrice;
    const displayNotDiscountTotalPrice = isLoggedIn ? notDiscountTotalPrice : guestNotDiscountTotalPrice;
    const displayTotalQty = isLoggedIn ? totalQty : guestTotalQty;

    return (
    <section className='bg-neutral-900 fixed top-0 bottom-0 right-0 left-0 bg-opacity-70 z-50'>
        <div className='bg-white w-full max-w-sm min-h-screen max-h-screen ml-auto'>
            <div className='flex items-center p-4 shadow-md gap-3 justify-between'>
                <h2 className='font-semibold'>Cart</h2>


                {/* this code is used when we want to close the cart  */}
            
                <button  onClick={() => {
                     if (close) close(); 
                          // Close the cart  and then navigate to the home page "/"
                          navigate("/");  }}    // Navigate to home  
                  >
                     <IoClose size={25} />
                </button>              
            </div>

            <div className='min-h-[75vh] lg:min-h-[80vh] h-full max-h-[calc(100vh-150px)] bg-blue-50 p-2 flex flex-col gap-4'>
                {/***display items */}
                {
                    displayCart[0] ? (
                        <>
                            <div className='flex items-center justify-between px-4 py-2 bg-blue-100 text-blue-500 rounded-full'>
                                    <p>Your total savings</p>
                                    <p>{DisplayPriceInRupees(displayNotDiscountTotalPrice - displayTotalPrice )}</p>
                            </div>
                            <div className='bg-white rounded-lg p-4 grid gap-5 overflow-auto'>
                                    {
                                        displayCart[0] && (
                                            displayCart.map((item,index)=>{
                                                // For guest cart, item is the product; for logged-in, item.productId is the product
                                                const product = isLoggedIn ? item.productId : item;
                                                return(
                                                    <div key={(product?._id || index)+"cartItemDisplay"} className='flex  w-full gap-4'>
                                                        <div className='w-16 h-16 min-h-16 min-w-16 bg-red-500 border rounded'>
                                                            <img
                                                                src={product?.image?.[0]}
                                                                className='object-scale-down'
                                                            />
                                                        </div>
                                                        <div className='w-full max-w-sm text-xs'>
                                                            <p className='text-xs text-ellipsis line-clamp-2'>{product?.name}</p>
                                                            <p className='text-neutral-400'>{product?.unit}</p>
                                                            <p className='font-semibold'>{DisplayPriceInRupees(pricewithDiscount(product?.price,product?.discount))}</p>
                                                        </div>
                                                        <div>
                                                            <AddToCartButton data={product}/>
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        )
                                    }
                            </div>
                            <div className='bg-white p-4'>
                                <h3 className='font-semibold'>Bill details</h3>
                                <div className='flex gap-4 justify-between ml-1'>
                                    <p>Items total</p>
                                    <p className='flex items-center gap-2'><span className='line-through text-neutral-400'>{DisplayPriceInRupees(displayNotDiscountTotalPrice)}</span><span>{DisplayPriceInRupees(displayTotalPrice)}</span></p>
                                </div>
                                <div className='flex gap-4 justify-between ml-1'>
                                    <p>Quntity total</p>
                                    <p className='flex items-center gap-2'>{displayTotalQty} item</p>
                                </div>
                                <div className='flex gap-4 justify-between ml-1'>
                                    <p>Delivery Charge</p>
                                    <p className='flex items-center gap-2'>Free</p>
                                </div>
                                <div className='font-semibold flex items-center justify-between gap-4'>
                                    <p >Grand total</p>
                                    <p>{DisplayPriceInRupees(displayTotalPrice)}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className='bg-white flex flex-col justify-center items-center'>
                            <img
                                src={imageEmpty}
                                className='w-full h-full object-scale-down' 
                            />
                            <Link onClick={close} to={"/"} className='block bg-green-600 px-4 py-2 text-white rounded'>Shop Now</Link>
                        </div>
                    )
                }
                
            </div>

            {
               displayCart[0] && (
                <div className='p-2'>
                  <div className='bg-green-700 text-neutral-100 px-4 font-bold text-base py-4 static bottom-3 rounded flex items-center gap-4 justify-between'>
                    <div>
                      {DisplayPriceInRupees(displayTotalPrice)}
                    </div>
                    {
                      isLoggedIn ? (
                        <button onClick={redirectToCheckoutPage} className='flex items-center gap-1'>
                          Proceed
                          <span><FaCaretRight/></span>
                        </button>
                      ) : (
                        <button onClick={redirectToCheckoutPage} className='flex items-center gap-1'>
                         Login to Proceed 
                          <span><FaCaretRight/></span>
                        </button>
                      )
                    }
                  </div>
                </div>
              )
            }
            
        </div>
    </section>
  )
}

export default DisplayCartItem
