import React, { useEffect, useState } from 'react'
import { useGlobalContext } from '../provider/GlobalProvider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from './Loading'
import { useSelector, useDispatch } from 'react-redux'
import { FaMinus, FaPlus } from "react-icons/fa6";
import {
  addGuestCartItem,
  removeGuestCartItem,
  updateGuestCartItemQty
} from '../store/cartProduct'

const AddToCartButton = ({ data }) => {
    const { fetchCartItem, updateCartItem, deleteCartItem , cartLoading} = useGlobalContext()
    const [loading, setLoading] = useState(false)
    const cartItem = useSelector(state => state.cartItem.cart) || []
    const guestCart = useSelector(state => state.cartItem.guestCart) || []
    const user = useSelector(state => state.user)
    const dispatch = useDispatch()
    const [isAvailableCart, setIsAvailableCart] = useState(false)
    const [qty, setQty] = useState(0)
    const [cartItemDetails, setCartItemsDetails] = useState()

    const isLoggedIn = !!user._id
    const currentCart = isLoggedIn ? cartItem : guestCart

    //checking this item in cart or not
    useEffect(() => {
        if(cartLoading) return;
        
        if (!data || !data._id) {
            console.error("AddToCartButton: data or data._id is undefined", data);
            return;
        }
        
        const checkingitem = isLoggedIn
            ? cartItem.some(item => item.productId?._id === data._id)
            : guestCart.some(item => item._id === data._id)
        setIsAvailableCart(checkingitem)

        const product = isLoggedIn
            ? cartItem.find(item => item.productId?._id === data._id)
            : guestCart.find(item => item._id === data._id)
        setQty(product?.quantity || 0)
        setCartItemsDetails(product)
    }, [data, cartItem, guestCart, isLoggedIn, cartLoading])

    const handleADDTocart = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (!data || !data._id) {
            toast.error("Invalid product data");
            return;
        }
        
        if (!isLoggedIn) {
            dispatch(addGuestCartItem(data))
            toast.success("Added to cart!")
            return
        }
        try {
            setLoading(true)
            const response = await Axios({
                ...SummaryApi.addTocart,
                data: {
                    productId: data._id
                }
            })
            const { data: responseData } = response
            if (responseData.success) {
                toast.success(responseData.message)
                if (fetchCartItem) {
                   await fetchCartItem()
                }
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            AxiosToastError(error)
        } finally {
            setLoading(false)
        }
    }

    const increaseQty = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (!data || !data._id) {
            toast.error("Invalid product data");
            return;
        }
        
        if (!isLoggedIn) {
            dispatch(updateGuestCartItemQty({ _id: data._id, quantity: qty + 1 }))           
            return
        }
        try {
            const response = await updateCartItem(cartItemDetails?._id, qty + 1)
            if (response?.success) {
                toast.success("Quantity updated!")
            }
        } catch (error) {
            console.error("Error updating quantity:", error)
            toast.error("Failed to update quantity")
        }
    }

    const decreaseQty = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (!data || !data._id) {
            toast.error("Invalid product data");
            return;
        }
        
        if (!isLoggedIn) {
            if (qty === 1) {
                dispatch(removeGuestCartItem(data._id))
                toast.success("Item removed from cart!")
            } else {
                dispatch(updateGuestCartItemQty({ _id: data._id, quantity: qty - 1 }))
                toast.success("Quantity updated!")
            }
            
            return
        }
        try {
            if (qty === 1) {
                await deleteCartItem(cartItemDetails?._id)
            } else {
                const response = await updateCartItem(cartItemDetails?._id, qty - 1)
                if (response?.success) {
                    toast.success("Quantity updated!")
                }
            }
        } catch (error) {
            console.error("Error updating quantity:", error)
            toast.error("Failed to update quantity")
        }
    }

    return (
        <div className='w-full max-w-[150px] add-to-cart-button'>
            {
                isAvailableCart ? (
                    <div className='flex w-full h-full'>
                        <button onClick={decreaseQty} className='bg-green-600 hover:bg-green-700 text-white flex-1 w-full p-1 rounded flex items-center justify-center'><FaMinus /></button>
                        <p className='flex-1 w-full font-semibold px-1 flex items-center justify-center'>{qty}</p>
                        <button onClick={increaseQty} className='bg-green-600 hover:bg-green-700 text-white flex-1 w-full p-1 rounded flex items-center justify-center'><FaPlus /></button>
                    </div>
                ) : (
                    <button onClick={handleADDTocart} className='bg-green-600 hover:bg-green-700 text-white px-2 lg:px-4 py-1 rounded'>
                        {loading ? <Loading /> : "Add"}
                    </button>
                )
            }
        </div>
    )
}

export default AddToCartButton
