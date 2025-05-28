import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import SummaryApi from '../common/SummaryApi'
import Axios from '../utils/Axios'
import AxiosToastError from '../utils/AxiosToastError'
import { FaAngleRight,FaAngleLeft } from "react-icons/fa6";
import { DisplayPriceInRupees } from '../utils/DisplayPriceInRupees'
import Divider from '../components/Divider'
import image1 from '../assets/minute_delivery.png'
import image2 from '../assets/Best_Prices_Offers.png'
import image3 from '../assets/Wide_Assortment.png'
import { pricewithDiscount } from '../utils/PriceWithDiscount'
import AddToCartButton from '../components/AddToCartButton'

const ALLOWED_CATEGORIES = [
    'Age Group',
    'Author',
    'Brand',
    'Caffeine Content',
    'Certification',
    'Cooking Instructions',
    'Country of Origin',
    'Cut Type',
    'Description',
    'Dosage Instructions',
    'Edition',
    'Expiry Date',
    'FSSAI License',
    'Flavour',
    'Genre',
    'Ingredients',
    'Key Features',
    'Language',
    'Manufacturer',
    'Material',
    'Name',
    'Number of Pages',
    'Nutritional Information',
    'Packaging Type',
    'Pet Type',
    'Product Name',
    'Publisher',
    'Return Policy',
    'Seller',
    'Shelf Life',
    'Shade',
    'Skin Type',
    'Storage Instructions',
    'Storage Tips',
    'Storage Type',
    'Title',
    'Type',
    'Unit',
    'Usage Instructions',
    'Variety',
    'Weight'
];

const ProductDisplayPage = () => {
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  let productId = params?.product?.split("-")?.slice(-1)[0]
  const [data,setData] = useState({
    name : "",
    image : []
  })
  const [image,setImage] = useState(0)
  const [loading,setLoading] = useState(false)
  const [showMobileDescription, setShowMobileDescription] = useState(false)
  const imageContainer = useRef()

  // Manage history state
  useEffect(() => {
    // Replace the current history entry with a new one that includes state
    window.history.replaceState(
      { ...window.history.state, fromProductList: true },
      '',
      location.pathname
    );

    // Add a listener for popstate to handle back button
    const handlePopState = (event) => {
      if (event.state?.fromProductList) {
        // If coming from product list, go back to home
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname, navigate]);

  const fetchProductDetails = async()=>{
    try {
        const response = await Axios({
          ...SummaryApi.getProductDetails,
          data : {
            productId : productId 
          }
        })

        const { data : responseData } = response

        if(responseData.success){
          setData(responseData.data)
        }
    } catch (error) {
      AxiosToastError(error)
    }finally{
      setLoading(false)
    }
  }

  useEffect(()=>{
    fetchProductDetails()
  },[params])
  
  const handleScrollRight = () => {
    if (imageContainer.current) {
      const scrollAmount = imageContainer.current.offsetWidth * 0.8; // Scroll 80% of container width
      imageContainer.current.scrollTo({
        left: imageContainer.current.scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  const handleScrollLeft = () => {
    if (imageContainer.current) {
      const scrollAmount = imageContainer.current.offsetWidth * 0.8; // Scroll 80% of container width
      imageContainer.current.scrollTo({
        left: imageContainer.current.scrollLeft - scrollAmount,
        behavior: 'smooth'
      });
    }
  }

  // Add scroll event listener to show/hide navigation buttons
  useEffect(() => {
    const container = imageContainer.current;
    if (!container) return;

    const handleScroll = () => {
      const showLeftButton = container.scrollLeft > 0;
      const showRightButton = container.scrollLeft < (container.scrollWidth - container.clientWidth);
      
      const leftButton = container.parentElement.querySelector('.scroll-left-button');
      const rightButton = container.parentElement.querySelector('.scroll-right-button');
      
      if (leftButton) {
        leftButton.style.opacity = showLeftButton ? '1' : '0';
        leftButton.style.pointerEvents = showLeftButton ? 'auto' : 'none';
      }
      if (rightButton) {
        rightButton.style.opacity = showRightButton ? '1' : '0';
        rightButton.style.pointerEvents = showRightButton ? 'auto' : 'none';
      }
    };

    container.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => container.removeEventListener('scroll', handleScroll);
  }, [data.image]); // Re-run when images change

  console.log("product data",data)
  return (
    <section className='container mx-auto p-4 grid lg:grid-cols-2 '>
        <div className=''>
            <div className='bg-white lg:min-h-[65vh] lg:max-h-[65vh] rounded min-h-56 max-h-56 h-full w-full relative'>
                {data.image[image] && (
                    <img
                        src={data.image[image]}
                        className='w-full h-full object-scale-down'
                        alt={data.name}
                    />
                )}
            </div>
            <div className='flex items-center justify-center gap-3 my-2'>
              {data.image.map((img,index)=>{
                return(
                  <button
                    key={img+index+"point"}
                    onClick={()=>setImage(index)}
                    className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-200 ${
                      index === image ? "bg-primary-200 scale-125" : "bg-slate-200 hover:bg-slate-300"
                    }`}
                    aria-label={`View image ${index + 1}`}
                  />
                )
              })}
            </div>
            <div className='grid relative mt-4'>
                <div 
                    ref={imageContainer} 
                    className='flex gap-4 overflow-x-auto scrollbar-none scroll-smooth snap-x snap-mandatory'
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                      {data.image.map((img,index)=>{
                        return(
                          <div 
                            key={img+index}
                            className='w-20 h-20 min-h-20 min-w-20 cursor-pointer shadow-md rounded-lg overflow-hidden snap-start flex-shrink-0 transition-transform duration-200 hover:scale-105'
                            onClick={()=>setImage(index)}
                          >
                            <img
                                src={img}
                                alt={`${data.name} - Image ${index + 1}`}
                                className={`w-full h-full object-scale-down ${
                                    index === image ? 'ring-2 ring-primary-200' : ''
                                }`}
                            />
                          </div>
                        )
                      })}
                </div>
                <div className='absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none'>
                    <button 
                        onClick={handleScrollLeft}
                        className='scroll-left-button bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 pointer-events-none ml-2'
                        aria-label="Scroll left"
                    >
                        <FaAngleLeft className="text-lg" />
                    </button>
                    <button 
                        onClick={handleScrollRight}
                        className='scroll-right-button bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-200 opacity-0 pointer-events-none mr-2'
                        aria-label="Scroll right"
                    >
                        <FaAngleRight className="text-lg" />
                    </button>
                </div>
            </div>
            <div>
            </div>

            <div className='my-4  hidden lg:grid gap-3 '>
                {data.description && (
                    <div>
                        <p className='font-semibold'>Description</p>
                        <p className='text-base'>{data.description}</p>
                    </div>
                )}
                {data.unit && (
                    <div>
                        <p className='font-semibold'>Unit</p>
                        <p className='text-base'>{data.unit}</p>
                    </div>
                )}
                {
                  data?.more_details && Object.keys(data?.more_details)
                    .filter(element => {
                        // Only show fields that have content and are in allowed categories
                        const hasContent = data?.more_details[element] && 
                            (typeof data?.more_details[element] === 'string' ? 
                                data?.more_details[element].trim() !== '' :
                                Array.isArray(data?.more_details[element]) ? 
                                    data?.more_details[element].length > 0 :
                                    Object.keys(data?.more_details[element] || {}).length > 0);
                        return hasContent && ALLOWED_CATEGORIES.includes(element);
                    })
                    .map((element, index) => {
                        return(
                            <div key={`more-details-${element}-${index}`}>
                                <p className='font-semibold'>{element}</p>
                                <p className='text-base'>
                                    {element === 'customerCare' ? 
                                        data?.more_details[element]?.email : 
                                        Array.isArray(data?.more_details[element]) ?
                                            data?.more_details[element].join(', ') :
                                            data?.more_details[element]}
                                </p>
                            </div>
                        )
                    })
                }
            </div>
        </div>


        <div className='p-4 lg:pl-7 text-base lg:text-lg'>
            <p className='bg-green-300 w-fit px-2 rounded-full'>10 Min</p>
            <h2 className='text-lg font-semibold lg:text-3xl'>{data.name}</h2>  
            <p className=''>{data.unit}</p> 
            <Divider/>
            <div>
              <p className=''>Price</p> 
              <div className='flex items-center gap-2 lg:gap-4'>
                <div className='border border-green-600 px-4 py-2 rounded bg-green-50 w-fit'>
                    <p className='font-semibold text-lg lg:text-xl'>{DisplayPriceInRupees(pricewithDiscount(data.price,data.discount))}</p>
                </div>
                {
                  data.discount && (
                    <p className='line-through'>{DisplayPriceInRupees(data.price)}</p>
                  )
                }
                {
                  data.discount && (
                    <p className="font-bold text-green-600 lg:text-2xl">{data.discount}% <span className='text-base text-neutral-500'>Discount</span></p>
                  )
                }
                
              </div>

            </div> 
              
              {
                data.stock === 0 ? (
                  <p className='text-lg text-red-500 my-2'>Out of Stock</p>
                ) 
                : (
                  // <button className='my-4 px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded'>Add</button>
                  <div className='my-4'>
                    <AddToCartButton data={data}/>
                  </div>
                )
              }
           

            <h2 className='font-semibold'>Why shop from binkeyit? </h2>
            <div>
                  <div className='flex  items-center gap-4 my-4'>
                      <img
                        src={image1}
                        alt='superfast delivery'
                        className='w-20 h-20'
                      />
                      <div className='text-sm'>
                        <div className='font-semibold'>Superfast Delivery</div>
                        <p>Get your orer delivered to your doorstep at the earliest from dark stores near you.</p>
                      </div>
                  </div>
                  <div className='flex  items-center gap-4 my-4'>
                      <img
                        src={image2}
                        alt='Best prices offers'
                        className='w-20 h-20'
                      />
                      <div className='text-sm'>
                        <div className='font-semibold'>Best Prices & Offers</div>
                        <p>Best price destination with offers directly from the nanufacturers.</p>
                      </div>
                  </div>
                  <div className='flex  items-center gap-4 my-4'>
                      <img
                        src={image3}
                        alt='Wide Assortment'
                        className='w-20 h-20'
                      />
                      <div className='text-sm'>
                        <div className='font-semibold'>Wide Assortment</div>
                        <p>Choose from 5000+ products across food personal care, household & other categories.</p>
                      </div>
                  </div>
            </div>
 
            {/****only mobile  */}
            <div className='lg:hidden my-4'>
                <button 
                    onClick={() => setShowMobileDescription(!showMobileDescription)}
                    className='w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2'
                >
                    <span className='font-semibold'>View Description</span>
                    <span className='text-gray-500'>
                        {showMobileDescription ? 'Hide' : 'Show'}
                    </span>
                </button>
                
                {showMobileDescription && (
                    <div className='grid gap-3 bg-white p-4 rounded-lg shadow-sm'>
                        {data.description && (
                            <div>
                                <p className='font-semibold'>Description</p>
                                <p className='text-base'>{data.description}</p>
                            </div>
                        )}
                        {data.unit && (
                            <div>
                                <p className='font-semibold'>Unit</p>
                                <p className='text-base'>{data.unit}</p>
                            </div>
                        )}
                        {
                            data?.more_details && Object.keys(data?.more_details)
                                .filter(element => {
                                    // Only show fields that have content and are in allowed categories
                                    const hasContent = data?.more_details[element] && 
                                        (typeof data?.more_details[element] === 'string' ? 
                                            data?.more_details[element].trim() !== '' :
                                            Array.isArray(data?.more_details[element]) ? 
                                                data?.more_details[element].length > 0 :
                                                Object.keys(data?.more_details[element] || {}).length > 0);
                                    return hasContent && ALLOWED_CATEGORIES.includes(element);
                                })
                                .map((element, index) => {
                                    return(
                                        <div key={`more-details-${element}-${index}`}>
                                            <p className='font-semibold'>{element}</p>
                                            <p className='text-base'>
                                                {element === 'customerCare' ? 
                                                    data?.more_details[element]?.email : 
                                                    Array.isArray(data?.more_details[element]) ?
                                                        data?.more_details[element].join(', ') :
                                                        data?.more_details[element]}
                                            </p>
                                        </div>
                                    )
                                })
                        }
                    </div>
                )}
            </div>
        </div>
    </section>
  )
}

export default ProductDisplayPage
