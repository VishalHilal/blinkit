import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import Divider from './Divider'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { logout } from '../store/userSlice'
import toast from 'react-hot-toast'
import AxiosToastError from '../utils/AxiosToastError'
import { HiOutlineExternalLink } from "react-icons/hi"
import isAdmin from '../utils/isAdmin'

const UserMenu = ({ close }) => {
  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      const response = await Axios({ ...SummaryApi.logout })
      if (response.data.success) {
        if (close) close()
        dispatch(logout())
        localStorage.clear()
        toast.success(response.data.message)
        navigate("/")
      }
    } catch (error) {
      console.log(error)
      AxiosToastError(error)
    }
  }

  const handleClose = () => {
    if (close) close()
  }

  return (
    <div className='w-64 text-sm text-gray-800'>
      <div className='font-semibold text-base mb-1'>My Account</div>

      <div className='flex items-center justify-between gap-2 text-gray-600'>
        <span className='max-w-[12rem] truncate'>
          {user.name || user.mobile}
          {user.role === "ADMIN" && (
            <span className='ml-1 text-xs text-red-600 font-medium'>(Admin)</span>
          )}
        </span>
        <Link
          onClick={handleClose}
          to="/dashboard/profile"
          className='text-primary-200 hover:text-primary-100 transition'
        >
          <HiOutlineExternalLink size={16} />
        </Link>
      </div>

      <Divider />

      <div className='grid gap-1'>
        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to="/dashboard/category"
            className='px-3 py-2 rounded-md hover:bg-orange-100 transition'
          >
            Category
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to="/dashboard/subcategory"
            className='px-3 py-2 rounded-md hover:bg-orange-100 transition'
          >
            Sub Category
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to="/dashboard/upload-product"
            className='px-3 py-2 rounded-md hover:bg-orange-100 transition'
          >
            Upload Product
          </Link>
        )}

        {isAdmin(user.role) && (
          <Link
            onClick={handleClose}
            to="/dashboard/product"
            className='px-3 py-2 rounded-md hover:bg-orange-100 transition'
          >
            Product
          </Link>
        )}

        <Link
          onClick={handleClose}
          to="/dashboard/myorders"
          className='px-3 py-2 rounded-md hover:bg-orange-100 transition'
        >
          My Orders
        </Link>

        <Link
          onClick={handleClose}
          to="/dashboard/address"
          className='px-3 py-2 rounded-md hover:bg-orange-100 transition'
        >
          Save Address
        </Link>

        <button
          onClick={handleLogout}
          className='text-left w-full px-3 py-2 rounded-md text-red-600 hover:bg-red-50 transition'
        >
          Log Out
        </button>
      </div>
    </div>
  )
}

export default UserMenu
