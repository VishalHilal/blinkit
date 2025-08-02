import React, { useEffect, useState } from 'react'
import logo from '../assets/logo.png'
import Search from './Search'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, UserRound } from 'lucide-react'
import useMobile from '../hooks/useMobile'
import { BsCart4 } from "react-icons/bs"
import { useSelector } from 'react-redux'
import { GoTriangleDown, GoTriangleUp } from "react-icons/go"
import UserMenu from './UserMenu'
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import { useGlobalContext } from '../provider/GlobalProvider'

const Header = ({ openCartSection }) => {
  const [isMobile] = useMobile()
  const location = useLocation()
  const isSearchPage = location.pathname === "/search"
  const navigate = useNavigate()
  const user = useSelector((state) => state?.user)
  const [openUserMenu, setOpenUserMenu] = useState(false)
  const cartItem = useSelector(state => state.cartItem.cart)
  const { totalPrice, totalQty } = useGlobalContext()

  const redirectToLoginPage = () => navigate("/login")
  const handleCloseUserMenu = () => setOpenUserMenu(false)

  const handleMobileUser = () => {
    if (!user._id) return navigate("/login")
    navigate("/user")
  }

  const handleHomeClick = () => navigate('/', { replace: true })

  return (
    <header className="h-16 lg:h-20 sticky flex items-top justify-top top-0 z-50 bg-white border-b shadow-sm">
      {
        !(isSearchPage && isMobile) && (
         <div className="container mx-auto flex items-center justify-between lg:items-center lg:justify-evenly">
            {/* Logo + Home */}
            <div className=" flex items-center gap-6">
              <Link to="/" className="flex items-center">
                <img
                  src={logo}
                  alt="logo"
                  className="hidden lg:block w-[250px] h-auto"
                />
              </Link>
              <button
                onClick={handleHomeClick}
                className="flex items-center gap-2 text-green-800 hover:text-green-700 px-3 py-2 rounded-md hover:bg-green-100 transition"
              > 
              {/* <div className='hidden lg:block'> */}
                <Home size={22} />

              {/* </div> */}
                <span className="hidden lg:inline text-sm font-medium">Home</span>
              </button>
            </div>
               
          <div className='lg:hidden bg-blue=500 flex conatainer mx-auto items-center justify-between w-screen w'>
            {/* <div className='lg:hidden '>
                <Home size={22} />
            </div> */}
               <Search className /> 
                  <button className="text-neutral-600 lg:hidden flex items-center" onClick={handleMobileUser}>
                  <div className='pl-2'>
                   <UserRound size={26} />
                </div>
              </button>
          </div>
            {/* Search (Desktop) */}
            <div className="hidden lg:block w-full max-w-xl">
              <Search />
            </div>
            {/* Search  Mobile */}
            <div className="lg:hidden w-full max-w-md">
            </div>

            {/* User + Cart */}
            <div className="flex items-center gap-4">
              {/* Mobile User Icon */}
          

              {/* Desktop User + Cart */}
              <div className="hidden lg:flex items-center gap-5">
                {
                  user?._id ? (
                    <div className="relative">
                      <div
                        onClick={() => setOpenUserMenu(prev => !prev)}
                        className="flex items-center gap-1 cursor-pointer select-none text-sm font-medium"
                      >
                        <span>Account</span>
                        {openUserMenu ? <GoTriangleUp size={20} /> : <GoTriangleDown size={20} />}
                      </div>

                      {openUserMenu && (
                        <div className="absolute right-0 top-10 z-10">
                          <div className="bg-white rounded-xl p-4 min-w-52 shadow-lg border border-gray-200">
                            <UserMenu close={handleCloseUserMenu} />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={redirectToLoginPage}
                      className="text-sm font-medium px-3 py-1 rounded-md hover:text-green-800 transition"
                    >
                      Login
                    </button>
                  )
                }

                {/* Cart Button */}
                <button
                  onClick={() => openCartSection(true)}
                  className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-xl transition shadow-sm"
                >
                  <BsCart4 size={24} className="animate-bounce" />
                  <div className="text-left text-sm font-medium leading-tight">
                    {totalQty > 0 ? (
                      <>
                        <p>{totalQty} Item{totalQty > 1 && 's'}</p>
                        <p>{DisplayPriceInRupees(totalPrice)}</p>
                      </>
                    ) : (
                      <p>My Cart</p>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        )
      }

    </header>
  )
}

export default Header
