import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import AxiosToastError from '../utils/AxiosToastError'
import { Link, useNavigate } from 'react-router-dom'

const Register = () => {
    const [data, setData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setData((prev) => ({ ...prev, [name]: value }))
    }

    const valideValue = Object.values(data).every(el => el)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (data.password !== data.confirmPassword) {
            toast.error("Password and confirm password must be same")
            return
        }

        try {
            const response = await Axios({
                ...SummaryApi.register,
                data: data
            })

            if (response.data.error) {
                toast.error(response.data.message)
            }

            if (response.data.success) {
                toast.success(response.data.message)
                setData({
                    name: "",
                    email: "",
                    password: "",
                    confirmPassword: ""
                })
                navigate("/login")
            }

        } catch (error) {
            AxiosToastError(error)
        }
    }

    return (
      <section className='w-full min-h-screen flex justify-center px-4 pt-10 md:items-center md:pt-0 bg-gradient-to-br from-green-50 to-white'>
            <div className='w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border border-gray-200'>
                <h2 className='text-3xl font-bold text-center text-green-800 mb-6'>Welcome to Binkeet</h2>

                <form className='space-y-5' onSubmit={handleSubmit}>
                    <div className='space-y-1'>
                        <label htmlFor='name' className='text-sm font-medium text-gray-700'>Name</label>
                        <input
                            type='text'
                            id='name'
                            autoFocus
                            name='name'
                            value={data.name}
                            onChange={handleChange}
                            placeholder='Enter your name'
                            className='w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300'
                        />
                    </div>

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
                                type={showPassword ? "text" : "password"}
                                id='password'
                                name='password'
                                value={data.password}
                                onChange={handleChange}
                                placeholder='Enter your password'
                                className='w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300 pr-12'
                            />
                            <div
                                onClick={() => setShowPassword(prev => !prev)}
                                className='absolute right-3 top-2.5 text-gray-600 cursor-pointer'
                            >
                                {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </div>
                        </div>
                    </div>

                    <div className='space-y-1'>
                        <label htmlFor='confirmPassword' className='text-sm font-medium text-gray-700'>Confirm Password</label>
                        <div className='relative'>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                id='confirmPassword'
                                name='confirmPassword'
                                value={data.confirmPassword}
                                onChange={handleChange}
                                placeholder='Enter confirm password'
                                className='w-full px-4 py-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-300 pr-12'
                            />
                            <div
                                onClick={() => setShowConfirmPassword(prev => !prev)}
                                className='absolute right-3 top-2.5 text-gray-600 cursor-pointer'
                            >
                                {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                            </div>
                        </div>
                    </div>

                    <button
                        disabled={!valideValue}
                        className={`w-full py-2 px-4 rounded-lg font-semibold text-white transition duration-200 ${
                            valideValue ? "bg-green-700 hover:bg-green-800" : "bg-gray-400 cursor-not-allowed"
                        }`}
                    >
                        Register
                    </button>
                </form>

                <p className='text-sm text-center text-gray-600 mt-6'>
                    Already have an account?{" "}
                    <Link to={"/login"} className='font-semibold text-green-700 hover:text-green-800'>Login</Link>
                </p>
            </div>
        </section>
    )
}

export default Register
