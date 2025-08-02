import React, { useState } from 'react'
import { FaCloudUploadAlt } from "react-icons/fa";
import uploadImage from '../utils/UploadImage';
import Loading from '../components/Loading';
import ViewImage from '../components/ViewImage';
import { MdDelete } from "react-icons/md";
import { useSelector } from 'react-redux'
import { IoClose } from "react-icons/io5";
import AddFieldComponent from '../components/AddFieldComponent';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import AxiosToastError from '../utils/AxiosToastError';
import successAlert from '../utils/SuccessAlert';
import { useEffect } from 'react';

const EditProductAdmin = ({ close ,data : propsData,fetchProductData}) => {
  const [data, setData] = useState({
    _id : propsData._id,
    name: propsData.name,
    image: propsData.image,
    category: propsData.category,
    subCategory: propsData.subCategory,
    unit: propsData.unit,
    stock: propsData.stock,
    price: propsData.price,
    discount: propsData.discount,
    description: propsData.description,
    more_details: propsData.more_details || {},
  })
  const [imageLoading, setImageLoading] = useState(false)
  const [ViewImageURL, setViewImageURL] = useState("")
  const allCategory = useSelector(state => state.product.allCategory)
  const [selectCategory, setSelectCategory] = useState("")
  const [selectSubCategory, setSelectSubCategory] = useState("")
  const allSubCategory = useSelector(state => state.product.allSubCategory)

  const [openAddField, setOpenAddField] = useState(false)
  const [fieldName, setFieldName] = useState("")


  const handleChange = (e) => {
    const { name, value } = e.target

    setData((preve) => {
      return {
        ...preve,
        [name]: value
      }
    })
  }

  const handleUploadImage = async (e) => {
    const file = e.target.files[0]

    if (!file) {
      return
    }
    setImageLoading(true)
    const response = await uploadImage(file)
    const { data: ImageResponse } = response
    const imageUrl = ImageResponse.data.url

    setData((preve) => {
      return {
        ...preve,
        image: [...preve.image, imageUrl]
      }
    })
    setImageLoading(false)

  }

  const handleDeleteImage = async (index) => {
    data.image.splice(index, 1)
    setData((preve) => {
      return {
        ...preve
      }
    })
  }

  const handleRemoveCategory = async (index) => {
    data.category.splice(index, 1)
    setData((preve) => {
      return {
        ...preve
      }
    })
  }
  const handleRemoveSubCategory = async (index) => {
    data.subCategory.splice(index, 1)
    setData((preve) => {
      return {
        ...preve
      }
    })
  }

  const handleAddField = () => {
    setData((preve) => {
      return {
        ...preve,
        more_details: {
          ...preve.more_details,
          [fieldName]: ""
        }
      }
    })
    setFieldName("")
    setOpenAddField(false)
  }

  const handleRemoveField = (fieldName) => {
    setData((preve) => {
      const newMoreDetails = { ...preve.more_details };
      delete newMoreDetails[fieldName];
      return {
        ...preve,
        more_details: newMoreDetails
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log("data", data)

    try {
      const response = await Axios({
        ...SummaryApi.updateProductDetails,
        data: data
      })
      const { data: responseData } = response

      if (responseData.success) {
        successAlert(responseData.message)
        if(close){
          close()
        }
        fetchProductData()
        setData({
          name: "",
          image: [],
          category: [],
          subCategory: [],
          unit: "",
          stock: "",
          price: "",
          discount: "",
          description: "",
          more_details: {},
        })

      }
    } catch (error) {
      AxiosToastError(error)
    }


  }

   return (
    <section className="fixed inset-0 z-50 bg-black bg-opacity-60 p-4">
      <div className="bg-white max-w-3xl w-full mx-auto h-full max-h-[95vh] overflow-y-auto rounded-xl shadow-xl p-6">
        <header className="flex items-center justify-between border-b pb-3 mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Update Product</h2>
          <button onClick={close} className="text-gray-500 hover:text-red-500">
            <IoClose size={24} />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Product Name */}
          <div className="grid gap-1">
            <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={data.name}
              onChange={handleChange}
              required
              className="bg-blue-50 border border-blue-200 p-3 rounded-md outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="Enter product name"
            />
          </div>

          {/* Description */}
          <div className="grid gap-1">
            <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={data.description}
              onChange={handleChange}
              required
              className="bg-blue-50 border border-blue-200 p-3 rounded-md outline-none resize-none focus:ring-2 focus:ring-primary-200"
              placeholder="Enter product description"
            />
          </div>

          {/* Image Upload */}
          <div className="grid gap-2">
            <p className="text-sm font-medium text-gray-700">Image</p>
            <label htmlFor="productImage" className="h-28 border-2 border-dashed rounded-md bg-blue-50 flex flex-col justify-center items-center cursor-pointer hover:border-blue-400 transition">
              {
                imageLoading ? <Loading /> : (
                  <>
                    <FaCloudUploadAlt size={28} />
                    <p className="text-xs mt-1 text-gray-600">Upload Image</p>
                  </>
                )
              }
              <input
                id="productImage"
                type="file"
                accept="image/*"
                onChange={handleUploadImage}
                className="hidden"
              />
            </label>
            <div className="flex flex-wrap gap-3">
              {
                data.image.map((img, index) => (
                  <div key={img + index} className="relative w-20 h-20 border rounded bg-blue-50 overflow-hidden group">
                    <img
                      src={img}
                      alt=""
                      onClick={() => setViewImageURL(img)}
                      className="w-full h-full object-contain cursor-pointer"
                    />
                    <button
                      onClick={() => handleDeleteImage(index)}
                      className="absolute bottom-1 right-1 bg-red-500 text-white p-1 rounded hidden group-hover:block"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Category Selector */}
          <div className="grid gap-1">
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={selectCategory}
              onChange={(e) => {
                const cat = allCategory.find(c => c._id === e.target.value);
                if (cat) {
                  setData(prev => ({
                    ...prev,
                    category: [...prev.category, cat],
                  }));
                }
                setSelectCategory("");
              }}
              className="bg-blue-50 border border-blue-200 p-2 rounded-md"
            >
              <option value="">Select Category</option>
              {allCategory.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.category.map((c, index) => (
                <div key={c._id} className="bg-blue-100 px-3 py-1 rounded-md text-sm flex items-center gap-2">
                  {c.name}
                  <IoClose className="cursor-pointer text-red-600" onClick={() => handleRemoveCategory(index)} />
                </div>
              ))}
            </div>
          </div>

          {/* Sub Category Selector */}
          <div className="grid gap-1">
            <label className="text-sm font-medium text-gray-700">Sub Category</label>
            <select
              value={selectSubCategory}
              onChange={(e) => {
                const sub = allSubCategory.find(s => s._id === e.target.value);
                if (sub) {
                  setData(prev => ({
                    ...prev,
                    subCategory: [...prev.subCategory, sub],
                  }));
                }
                setSelectSubCategory("");
              }}
              className="bg-blue-50 border border-blue-200 p-2 rounded-md"
            >
              <option value="">Select Sub Category</option>
              {allSubCategory.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.subCategory.map((c, index) => (
                <div key={c._id} className="bg-blue-100 px-3 py-1 rounded-md text-sm flex items-center gap-2">
                  {c.name}
                  <IoClose className="cursor-pointer text-red-600" onClick={() => handleRemoveSubCategory(index)} />
                </div>
              ))}
            </div>
          </div>

          {/* Unit, Stock, Price, Discount */}
          {['unit', 'stock', 'price', 'discount'].map((field) => (
            <div key={field} className="grid gap-1">
              <label htmlFor={field} className="text-sm font-medium capitalize text-gray-700">{field}</label>
              <input
                id={field}
                name={field}
                type={field === 'unit' ? 'text' : 'number'}
                value={data[field]}
                onChange={handleChange}
                required
                placeholder={`Enter product ${field}`}
                className="bg-blue-50 border border-blue-200 p-2 rounded-md outline-none focus:ring-2 focus:ring-primary-200"
              />
            </div>
          ))}

          {/* More Details */}
          {Object.keys(data.more_details).map((key) => (
            <div key={key} className="grid gap-1 relative">
              <div className="flex justify-between items-center">
                <label htmlFor={key} className="text-sm font-medium text-gray-700">{key}</label>
                <IoClose className="text-red-500 cursor-pointer" onClick={() => handleRemoveField(key)} />
              </div>
              <input
                id={key}
                type="text"
                value={data.more_details[key]}
                onChange={(e) => setData(prev => ({
                  ...prev,
                  more_details: {
                    ...prev.more_details,
                    [key]: e.target.value,
                  },
                }))}
                className="bg-blue-50 border border-blue-200 p-2 rounded-md"
              />
            </div>
          ))}

          {/* Add Fields Button */}
          <div
            onClick={() => setOpenAddField(true)}
            className="border border-primary-200 px-4 py-2 text-sm font-medium text-center text-primary-700 rounded cursor-pointer hover:bg-primary-100 w-fit"
          >
            Add Fields
          </div>

          {/* Submit Button */}
          <button type="submit" className="bg-primary-100 hover:bg-primary-200 text-white font-semibold py-2 px-4 rounded">
            Update Product
          </button>
        </form>

        {/* View Image Modal */}
        {ViewImageURL && <ViewImage url={ViewImageURL} close={() => setViewImageURL("")} />}

        {/* Add Field Modal */}
        {openAddField && (
          <AddFieldComponent
            value={fieldName}
            onChange={(e) => setFieldName(e.target.value)}
            submit={handleAddField}
            close={() => setOpenAddField(false)}
          />
        )}
      </div>
    </section>
  );
}

export default EditProductAdmin


