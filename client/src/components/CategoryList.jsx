import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { setAllCategory, setAllSubCategory } from '../store/productSlice'
import { valideURLConvert } from '../utils/valideURLConvert'

const CategoryList = () => {
    const dispatch = useDispatch()
    const { allCategory, allSubCategory } = useSelector(state => state.product)

    const fetchCategories = async () => {
        try {
            const [categoryResponse, subCategoryResponse] = await Promise.all([
                Axios(SummaryApi.getCategory),
                Axios(SummaryApi.getSubCategory)
            ])

            if (categoryResponse.data.success) {
                dispatch(setAllCategory(categoryResponse.data.data))
            }
            if (subCategoryResponse.data.success) {
                dispatch(setAllSubCategory(subCategoryResponse.data.data))
            }
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">All Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allCategory.map((category) => (
                    <div key={category._id} className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex items-center gap-4 mb-4">
                            <img 
                                src={category.image} 
                                alt={category.name}
                                className="w-16 h-16 object-contain"
                            />
                            <h3 className="text-xl font-semibold">{category.name}</h3>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-600">Subcategories:</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {allSubCategory
                                    .filter(sub => sub.category.some(cat => cat._id === category._id))
                                    .map(sub => (
                                        <Link
                                            key={sub._id}
                                            to={`/${valideURLConvert(category.name)}-${category._id}/${valideURLConvert(sub.name)}-${sub._id}`}
                                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                                        >
                                            <img 
                                                src={sub.image} 
                                                alt={sub.name}
                                                className="w-8 h-8 object-contain"
                                            />
                                            <span className="text-sm">{sub.name}</span>
                                        </Link>
                                    ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default CategoryList 