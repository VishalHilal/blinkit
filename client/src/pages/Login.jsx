import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import fetchUserDetails from '../utils/fetchUserDetails'
import { useDispatch } from 'react-redux'
import { setUserDetails } from '../store/userSlice'
import { useGlobalContext } from '../provider/GlobalProvider'


const Login = () => {

    const {fetchCartItem} = useGlobalContext();
    const [data, setData] = useState({
        email: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from || "/"
    const dispatch = useDispatch()

    const handleChange = (e) => {
        const { name, value } = e.target
        setData((prev) => ({ ...prev, [name]: value }))
    }

    const valideValue = Object.values(data).every(el => el)

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await Axios({ ...SummaryApi.login, data })

            if (response.data.error) {
                toast.error(response.data.message)
            }

            if (response.data.success) {
                toast.success(response.data.message)
                await fetchCartItem();
                localStorage.setItem('accesstoken', response.data.data.accesstoken)
                localStorage.setItem('refreshToken', response.data.data.refreshToken)

                const userDetails = await fetchUserDetails()
                dispatch(setUserDetails(userDetails.data))

                setData({ email: "", password: "" })
                navigate(from, { replace: true })
            }
        } catch (error) {
            AxiosToastError(error)
        }
    }

    return (
     <section className='w-full min-h-screen flex justify-center px-4 pt-10 md:items-center md:pt-0 bg-gradient-to-br from-green-50 to-white'>
            <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-200'>
                <h2 className='text-3xl font-bold text-center text-green-800 mb-6'>Welcome Back</h2>

                <form className='space-y-6' onSubmit={handleSubmit}>
                    <div className='space-y-1'>
                        <label htmlFor='email' className='text-sm font-medium text-gray-700'>Email</label>
                        <input
                            type='email'
                            id='email'
                            name='email'
                            value={data.email}
                            onChange={handleChange}
                            placeholder='Enter your email'
                            className='w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300'
                        />
                    </div>

                    <div className='space-y-1'>
                        <label htmlFor='password' className='text-sm font-medium text-gray-700'>Password</label>
                        <div className='relative'>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id='password'
                                name='password'
                                value={data.password}
                                onChange={handleChange}
                                placeholder='Enter your password'
                                className='w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300 pr-12'
                            />
                            <div
                                className='absolute right-3 top-2.5 text-gray-600 cursor-pointer'
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </div>
                        </div>
                        <Link to={"/forgot-password"} className='text-sm text-green-600 hover:underline block text-right mt-1'>Forgot password?</Link>
                    </div>

                    <button
                        disabled={!valideValue}
                        className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition duration-200 ${
                            valideValue ? "bg-green-700 hover:bg-green-800" : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                        Login
                    </button>
                </form>

                <p className='text-sm text-center text-gray-600 mt-6'>
                    Don't have an account?{" "}
                    <Link to={"/register"} className='font-semibold text-green-700 hover:text-green-800'>Register</Link>
                </p>
            </div>
        </section>
    )
}

export default Login
