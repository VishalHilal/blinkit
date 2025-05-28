import React, { useEffect, useState } from 'react'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import AxiosToastError from '../utils/AxiosToastError'
import Loading from '../components/Loading'
import CardProduct from '../components/CardProduct'
import { useSelector } from 'react-redux'
import { valideURLConvert } from '../utils/valideURLConvert'
import toast from 'react-hot-toast'

const ProductListPage = () => {
  const [data, setData] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalPage, setTotalPage] = useState(1)
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const AllSubCategory = useSelector(state => state.product.allSubCategory)
  const [DisplaySubCatory, setDisplaySubCategory] = useState([])
  const [shouldRedirect, setShouldRedirect] = useState(false)

  // Manage history state
  useEffect(() => {
    // Replace the current history entry with a new one that includes state
    window.history.replaceState(
      { ...window.history.state, fromHome: true },
      '',
      location.pathname
    );

    // Add a listener for popstate to handle back button
    const handlePopState = (event) => {
      if (event.state?.fromHome) {
        // If coming from home, go back to home
        navigate('/', { replace: true });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [location.pathname, navigate]);

  // Safely extract category and subcategory IDs from URL
  const getCategoryAndSubCategoryIds = () => {
    try {
      if (!params.category || !params.subCategory) {
        throw new Error('Missing category or subcategory in URL')
      }

      const categoryParts = params.category.split("-")
      const subCategoryParts = params.subCategory.split("-")

      if (categoryParts.length < 2 || subCategoryParts.length < 2) {
        throw new Error('Invalid URL format')
      }

      const categoryId = categoryParts[categoryParts.length - 1]
      const subCategoryId = subCategoryParts[subCategoryParts.length - 1]

      // Validate that the IDs exist in our data
      const categoryExists = AllSubCategory.some(sub => 
        sub.category.some(cat => cat._id === categoryId)
      )
      const subCategoryExists = AllSubCategory.some(sub => 
        sub._id === subCategoryId && sub.category.some(cat => cat._id === categoryId)
      )

      if (!categoryExists || !subCategoryExists) {
        throw new Error('Category or subcategory not found')
      }

      return { categoryId, subCategoryId }
    } catch (error) {
      console.error('Error parsing URL parameters:', error)
      toast.error(error.message || 'Invalid category or subcategory')
      setShouldRedirect(true) // Set flag to trigger navigation in useEffect
      return { categoryId: null, subCategoryId: null }
    }
  }

  const { categoryId, subCategoryId } = getCategoryAndSubCategoryIds()
  const subCategory = params?.subCategory?.split("-")
  const subCategoryName = subCategory?.slice(0, subCategory?.length - 1)?.join(" ")

  const fetchProductdata = async () => {
    if (!categoryId || !subCategoryId) {
      return // Don't fetch if IDs are invalid
    }

    try {
      setLoading(true)
      const response = await Axios({
        ...SummaryApi.getProductByCategoryAndSubCategory,
        data: {
          categoryId: [categoryId], // Send as array since backend expects array
          subCategoryId: [subCategoryId], // Send as array since backend expects array
          page: page,
          limit: 8,
        }
      })

      const { data: responseData } = response

      if (responseData.success) {
        if (responseData.page == 1) {
          setData(responseData.data)
        } else {
          setData([...data, ...responseData.data])
        }
        setTotalPage(responseData.totalCount)
      } else {
        toast.error(responseData.message || 'Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch products'
      toast.error(errorMessage)
      setData([]) // Clear data on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (categoryId && subCategoryId) {
      fetchProductdata()
    }
  }, [params, page])

  useEffect(() => {
    if (categoryId) {
      const sub = AllSubCategory.filter(s => {
        return s.category.some(el => el._id === categoryId)
      })
      setDisplaySubCategory(sub)
    }
  }, [params, AllSubCategory, categoryId])

  return (
    <section className='sticky top-24 lg:top-20'>
      <div className='container sticky top-24 mx-auto grid grid-cols-[90px,1fr] md:grid-cols-[200px,1fr] lg:grid-cols-[280px,1fr]'>
        {/**sub category **/}
        <div className='min-h-[88vh] max-h-[88vh] overflow-y-scroll grid gap-1 shadow-md scrollbarCustom bg-white py-2'>
          {
            DisplaySubCatory.map((subCategory) => {
              const link = `/${valideURLConvert(subCategory?.category[0]?.name)}-${subCategory?.category[0]?._id}/${valideURLConvert(subCategory.name)}-${subCategory._id}`
              return (
                <Link 
                  key={`subcategory-${subCategory._id}`}
                  to={link} 
                  className={`w-full p-2 lg:flex items-center lg:w-full lg:h-16 box-border lg:gap-4 border-b 
                    hover:bg-green-100 cursor-pointer
                    ${subCategoryId === subCategory._id ? "bg-green-100" : ""}
                  `}
                >
                  <div className='w-fit max-w-28 mx-auto lg:mx-0 bg-white rounded box-border'>
                    <img
                      src={subCategory.image}
                      alt={`${subCategory.name} subcategory`}
                      className='w-14 lg:h-14 lg:w-12 h-full object-scale-down'
                    />
                  </div>
                  <p className='-mt-6 lg:mt-0 text-xs text-center lg:text-left lg:text-base'>{subCategory.name}</p>
                </Link>
              )
            })
          }
        </div>

        {/**Product **/}
        <div className='sticky top-20'>
          <div className='bg-white shadow-md p-4 z-10'>
            <h3 className='font-semibold'>{subCategoryName}</h3>
          </div>
          <div>
            <div className='min-h-[80vh] max-h-[80vh] overflow-y-auto relative'>
              <div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 p-4 gap-4'>
                {
                  data.map((product) => (
                    <CardProduct
                      key={`product-${product._id}`}
                      data={product}
                    />
                  ))
                }
              </div>
            </div>

            {loading && <Loading />}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductListPage
