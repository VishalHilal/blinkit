import React, { useState, useEffect, useCallback } from 'react'
import banner from '../assets/banner.jpg'
import banner1 from '../assets/banner1.png'
import banner2 from '../assets/banner2.png'
import banner3 from '../assets/banner3.png'
import banner4 from '../assets/banner4.png'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import {Link, useNavigate} from 'react-router-dom'
import CategoryWiseProductDisplay from '../components/CategoryWiseProductDisplay'
import toast from 'react-hot-toast'

const Home = () => {
  const loadingCategory = useSelector(state => state.product.loadingCategory)
  const categoryData = useSelector(state => state.product.allCategory)
  const subCategoryData = useSelector(state => state.product.allSubCategory)
  const navigate = useNavigate()
  
  // State for mobile banner slideshow
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const mobileBanners = [banner1, banner2, banner3, banner4]

  // Handle manual navigation
  const handleBannerChange = useCallback((index) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setCurrentBannerIndex(index)
    setTimeout(() => setIsTransitioning(false), 500) // Match transition duration
  }, [isTransitioning])

  // Automatic slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setCurrentBannerIndex((prevIndex) => 
          prevIndex === mobileBanners.length - 1 ? 0 : prevIndex + 1
        )
      }
    }, 3000) // Change image every 3 seconds

    return () => clearInterval(interval)
  }, [isTransitioning, mobileBanners.length])

  const handleRedirectProductListpage = (id, cat) => {
    try {
      // Find the first subcategory for this category
      const subcategory = subCategoryData.find(sub => {
        return sub.category.some(c => c._id === id)
      })

      if (!subcategory) {
        toast.error('No subcategories found for this category')
        return
      }

      const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(subcategory.name)}-${subcategory._id}`
      navigate(url)
    } catch (error) {
      console.error('Error redirecting to product list:', error)
      toast.error('Error loading category')
    }
  }

  return (
   <section className='bg-white'>
      <div className='container mx-auto mt-2'>
          <div className={`w-full bg-blue-100 rounded-lg overflow-hidden ${!banner && "animate-pulse"}`}>
              {/* Desktop Banner */}
              <img
                src={banner}
                className='w-full h-[300px] hidden lg:block object-cover'
                alt='banner' 
              />
              
              {/* Mobile Banner Slideshow */}
              <div className='relative w-full aspect-[2/1] lg:hidden overflow-hidden bg-gray-100'>
                {mobileBanners.map((bannerImg, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                      index === currentBannerIndex ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
                    }`}
                    style={{
                      willChange: 'transform, opacity',
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    <img
                      src={bannerImg}
                      className='w-full h-full object-cover object-center'
                      alt={`banner ${index + 1}`}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = 'https://via.placeholder.com/1080x540?text=Banner+Image'
                      }}
                    />
                  </div>
                ))}
                
                {/* Navigation dots */}
                <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10'>
                  {mobileBanners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => handleBannerChange(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        index === currentBannerIndex 
                          ? 'bg-white scale-125 shadow-md' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                      disabled={isTransitioning}
                    />
                  ))}
                </div>

                {/* Touch Navigation Hints */}
                <div className='absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer' 
                     onClick={() => handleBannerChange(Math.max(0, currentBannerIndex - 1))} 
                     aria-label="Previous slide" />
                <div className='absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer' 
                     onClick={() => handleBannerChange(Math.min(mobileBanners.length - 1, currentBannerIndex + 1))} 
                     aria-label="Next slide" />
              </div>
          </div>
      </div>
      
      <div className='container mx-auto px-4 my-2 grid grid-cols-5 md:grid-cols-8 lg:grid-cols-10  gap-2'>
          {
            loadingCategory ? (
              new Array(12).fill(null).map((c,index)=>{
                return(
                  <div key={index+"loadingcategory"} className='bg-white rounded p-4 min-h-36 grid gap-2 shadow animate-pulse'>
                    <div className='bg-blue-100 min-h-24 rounded'></div>
                    <div className='bg-blue-100 h-8 rounded'></div>
                  </div>
                )
              })
            ) : (
              categoryData.map((cat,index)=>{
                // Only show categories that have subcategories
                const hasSubcategories = subCategoryData.some(sub => 
                  sub.category.some(c => c._id === cat._id)
                )

                if (!hasSubcategories) {
                  return null // Don't render categories without subcategories
                }

                return(
                  <div key={cat._id+"displayCategory"} className='w-full h-full cursor-pointer' onClick={()=>handleRedirectProductListpage(cat._id,cat.name)}>
                    <div>
                        <img 
                          src={cat.image}
                          className='w-full h-full object-scale-down'
                          alt={cat.name}
                        />
                    </div>
                  </div>
                )
              })
              
            )
          }
      </div>

      {/***display category product */}
      {
        categoryData?.map((c,index)=>{
          return(
            <CategoryWiseProductDisplay 
              key={c?._id+"CategorywiseProduct"} 
              id={c?._id} 
              name={c?.name}
            />
          )
        })
      }



   </section>
  )
}

export default Home
