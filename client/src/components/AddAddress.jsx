import React from 'react'
import { useForm } from "react-hook-form"
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { IoClose } from "react-icons/io5";
import { useGlobalContext } from '../provider/GlobalProvider'

const AddAddress = ({close}) => {
    const { register, handleSubmit, reset, formState: { errors } } = useForm()
    const { fetchAddress } = useGlobalContext()

    const onSubmit = async(data) => {
        try {
            const response = await Axios({
                ...SummaryApi.createAddress,
                data : {
                    address_line: data.addressline,
                    city: data.city,
                    state: data.state,
                    country: data.country,
                    pincode: data.pincode,
                    mobile: data.mobile
                }
            })

            const { data: responseData } = response
            
            if(responseData.success){
                toast.success(responseData.message)
                if(close){
                    close()
                    reset()
                    fetchAddress()
                }
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

    return (
        <section className='bg-black fixed top-0 left-0 right-0 bottom-0 z-50 bg-opacity-70 h-screen overflow-auto font-sans'>
            <div className='bg-white p-6 w-full max-w-lg mt-8 mx-auto rounded shadow-lg'>
                <div className='flex justify-between items-center gap-4 mb-6'>
                    <h2 className='font-bold text-xl text-gray-800'>Add Address</h2>
                    <button onClick={close} className='hover:text-red-500 transition-colors'>
                        <IoClose size={25}/>
                    </button>
                </div>
                <form className='mt-4 grid gap-5' onSubmit={handleSubmit(onSubmit)}>
                    <div className='grid gap-2'>
                        <label htmlFor='addressline' className='font-semibold text-gray-700 text-sm uppercase tracking-wide'>Address Line</label>
                        <input
                            type='text'
                            id='addressline' 
                            className={`border p-3 rounded-md text-gray-800 font-medium ${errors.addressline ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-200 focus:border-primary-200 focus:ring-2 focus:ring-primary-100'} transition-colors`}
                            placeholder='Enter your street address'
                            {...register("addressline", {
                                required: "Address line is required",
                                minLength: {
                                    value: 5,
                                    message: "Address must be at least 5 characters"
                                },
                                maxLength: {
                                    value: 100,
                                    message: "Address cannot exceed 100 characters"
                                }
                            })}
                        />
                        {errors.addressline && (
                            <p className='text-red-600 text-sm font-medium mt-1'>{errors.addressline.message}</p>
                        )}
                    </div>

                    <div className='grid gap-2'>
                        <label htmlFor='city' className='font-semibold text-gray-700 text-sm uppercase tracking-wide'>City</label>
                        <input
                            type='text'
                            id='city' 
                            className={`border p-3 rounded-md text-gray-800 font-medium ${errors.city ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-200 focus:border-primary-200 focus:ring-2 focus:ring-primary-100'} transition-colors`}
                            placeholder='Enter your city'
                            {...register("city", {
                                required: "City is required",
                                pattern: {
                                    value: /^[A-Za-z\s]+$/,
                                    message: "City should only contain letters and spaces"
                                },
                                minLength: {
                                    value: 2,
                                    message: "City must be at least 2 characters"
                                }
                            })}
                        />
                        {errors.city && (
                            <p className='text-red-600 text-sm font-medium mt-1'>{errors.city.message}</p>
                        )}
                    </div>

                    <div className='grid gap-2'>
                        <label htmlFor='state' className='font-semibold text-gray-700 text-sm uppercase tracking-wide'>State</label>
                        <input
                            type='text'
                            id='state' 
                            className={`border p-3 rounded-md text-gray-800 font-medium ${errors.state ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-200 focus:border-primary-200 focus:ring-2 focus:ring-primary-100'} transition-colors`}
                            placeholder='Enter your state'
                            {...register("state", {
                                required: "State is required",
                                pattern: {
                                    value: /^[A-Za-z\s]+$/,
                                    message: "State should only contain letters and spaces"
                                },
                                minLength: {
                                    value: 2,
                                    message: "State must be at least 2 characters"
                                }
                            })}
                        />
                        {errors.state && (
                            <p className='text-red-600 text-sm font-medium mt-1'>{errors.state.message}</p>
                        )}
                    </div>

                    <div className='grid gap-2'>
                        <label htmlFor='pincode' className='font-semibold text-gray-700 text-sm uppercase tracking-wide'>Pincode</label>
                        <input
                            type='text'
                            id='pincode' 
                            className={`border p-3 rounded-md text-gray-800 font-medium ${errors.pincode ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-200 focus:border-primary-200 focus:ring-2 focus:ring-primary-100'} transition-colors`}
                            placeholder='Enter 6-digit pincode'
                            {...register("pincode", {
                                required: "Pincode is required",
                                pattern: {
                                    value: /^[0-9]{6}$/,
                                    message: "Pincode must be exactly 6 digits"
                                }
                            })}
                        />
                        {errors.pincode && (
                            <p className='text-red-600 text-sm font-medium mt-1'>{errors.pincode.message}</p>
                        )}
                    </div>

                    <div className='grid gap-2'>
                        <label htmlFor='country' className='font-semibold text-gray-700 text-sm uppercase tracking-wide'>Country</label>
                        <input
                            type='text'
                            id='country' 
                            className={`border p-3 rounded-md text-gray-800 font-medium ${errors.country ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-200 focus:border-primary-200 focus:ring-2 focus:ring-primary-100'} transition-colors`}
                            placeholder='Enter your country'
                            {...register("country", {
                                required: "Country is required",
                                pattern: {
                                    value: /^[A-Za-z\s]+$/,
                                    message: "Country should only contain letters and spaces"
                                },
                                minLength: {
                                    value: 2,
                                    message: "Country must be at least 2 characters"
                                }
                            })}
                        />
                        {errors.country && (
                            <p className='text-red-600 text-sm font-medium mt-1'>{errors.country.message}</p>
                        )}
                    </div>

                    <div className='grid gap-2'>
                        <label htmlFor='mobile' className='font-semibold text-gray-700 text-sm uppercase tracking-wide'>Mobile Number</label>
                        <input
                            type='tel'
                            id='mobile' 
                            className={`border p-3 rounded-md text-gray-800 font-medium ${errors.mobile ? 'border-red-500 bg-red-50' : 'bg-gray-50 border-gray-200 focus:border-primary-200 focus:ring-2 focus:ring-primary-100'} transition-colors`}
                            placeholder='Enter 10-digit mobile number'
                            {...register("mobile", {
                                required: "Mobile number is required",
                                pattern: {
                                    value: /^[6-9]\d{9}$/,
                                    message: "Please enter a valid 10-digit mobile number starting with 6-9"
                                }
                            })}
                        />
                        {errors.mobile && (
                            <p className='text-red-600 text-sm font-medium mt-1'>{errors.mobile.message}</p>
                        )}
                    </div>

                    <button 
                        type='submit' 
                        className='bg-primary-200 w-full py-3 font-bold text-gray-800 mt-6 hover:bg-primary-100 rounded-md transition-all transform hover:scale-[1.02] shadow-md'
                    >
                        Submit Address
                    </button>
                </form>
            </div>
        </section>
    )
}

export default AddAddress
