import React, { useState } from 'react'
import { FaCloudUploadAlt, FaFileAlt } from "react-icons/fa";
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
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import BulkUploadProducts from '../components/BulkUploadProducts';



const UploadProduct = () => {
  const [data,setData] = useState({
      name : "",
      image : [],
      category : [],
      subCategory : [],
      unit : "",
      stock : "",
      price : "",
      discount : "",
      description : "",
      more_details : {},
  })
  const [imageLoading,setImageLoading] = useState(false)
  const [ViewImageURL,setViewImageURL] = useState("")
  const allCategory = useSelector(state => state.product.allCategory)
  const [selectCategory,setSelectCategory] = useState("")
  const [selectSubCategory,setSelectSubCategory] = useState("")
  const allSubCategory = useSelector(state => state.product.allSubCategory)

  const [openAddField,setOpenAddField] = useState(false)
  const [fieldName,setFieldName] = useState("")
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [rtfFile, setRtfFile] = useState(null)
  const [status, setStatus] = useState('')
  const [foundFields, setFoundFields] = useState(new Set(['name', 'description', 'unit', 'stock', 'price', 'discount']))

  const handleChange = (e)=>{
    const { name, value} = e.target 

    setData((preve)=>{
      return{
          ...preve,
          [name]  : value
      }
    })
  }

  const handleUploadImage = async(e)=>{
    const file = e.target.files[0]

    if(!file){
      return 
    }
    setImageLoading(true)
    const response = await uploadImage(file)
    console.log('Full upload response:', response)
    console.log('Response data:', response.data)
    console.log('Response data.data:', response.data?.data)
    let imageUrl = null
    if (response.data?.data?.url) {
        imageUrl = response.data.data.url
    } else if (response.data?.data?.secure_url) {
        imageUrl = response.data.data.secure_url
    } else if (response.data?.url) {
        imageUrl = response.data.url
    } else if (response.data?.data?.image?.url) {
        imageUrl = response.data.data.image.url
    }

    setData((preve)=>{
      return{
        ...preve,
        image : [...preve.image,imageUrl]
      }
    })
    setImageLoading(false)

  }

  const handleDeleteImage = async(index)=>{
      data.image.splice(index,1)
      setData((preve)=>{
        return{
            ...preve
        }
      })
  }

  const handleRemoveCategory = async(index)=>{
    data.category.splice(index,1)
    setData((preve)=>{
      return{
        ...preve
      }
    })
  }
  const handleRemoveSubCategory = async(index)=>{
      data.subCategory.splice(index,1)
      setData((preve)=>{
        return{
          ...preve
        }
      })
  }

  const handleAddField = () => {
    const normalizedFieldName = fieldName.toLowerCase().replace(/\s+/g, '')
    setData((preve) => {
        return {
            ...preve,
            more_details: {
                ...preve.more_details,
                [fieldName]: ""
            }
        }
    })
    setFoundFields(prev => new Set([...prev, normalizedFieldName]))
    setFieldName("")
    setOpenAddField(false)
  }

  const handleSubmit = async(e)=>{
    e.preventDefault()
    console.log("data",data)

    try {
      const response = await Axios({
          ...SummaryApi.createProduct,
          data : data
      })
      const { data : responseData} = response

      if(responseData.success){
          successAlert(responseData.message)
          setData({
            name : "",
            image : [],
            category : [],
            subCategory : [],
            unit : "",
            stock : "",
            price : "",
            discount : "",
            description : "",
            more_details : {},
          })

      }
    } catch (error) {
        let errorMessage = 'Failed to upload image'
        if (error.response?.data?.message) {
            errorMessage = error.response.data.message
        } else if (error.message) {
            errorMessage = error.message
        }
        AxiosToastError(error)
    }


  }

  const handleProductSelect = (productData) => {
    // Reset select states
    setSelectCategory("")
    setSelectSubCategory("")

    // Update the form data with RTF data
    setData({
        name: productData.name || '',
        description: productData.description || '',
        unit: productData.unit || '',
        stock: productData.stock?.toString() || '', // Convert to string for input value
        price: productData.price?.toString() || '', // Convert to string for input value
        discount: productData.discount?.toString() || '', // Convert to string for input value
        category: productData.category || [],
        subCategory: productData.subCategory || [],
        image: productData.image || [],
        more_details: productData.more_details || {}
    })

    // Log the data to verify it's being set correctly
    console.log('Setting form data from RTF:', {
        name: productData.name,
        description: productData.description,
        unit: productData.unit,
        stock: productData.stock,
        price: productData.price,
        discount: productData.discount,
        category: productData.category,
        subCategory: productData.subCategory,
        image: productData.image,
        more_details: productData.more_details
    })
  }

  // Function to parse RTF content
  const parseRtfContent = async (rtfContent) => {
    try {
        console.log('Raw RTF content:', rtfContent)

        // Remove RTF control characters and get plain text
        const plainText = rtfContent.replace(/\\[a-z0-9]+/g, '')
            .replace(/[{}]/g, '')
            .replace(/\\par/g, '\n')
            .replace(/\\tab/g, '\t')
            .trim()

        console.log('Cleaned plain text:', plainText)

        // Define section names and their corresponding form field mappings
        const sectionMappings = {
            'Product Details': {
                type: 'header',
                fields: ['name', 'description'],
                descriptionOnly: false
            },
            'Description': {
                type: 'field',
                field: 'description',
                descriptionOnly: true
            },
            'Key Features': {
                type: 'array',
                field: 'keyFeatures'
            },
            'Atta Type': {
                type: 'field',
                field: 'type'
            },
            'Shelf Life': {
                type: 'field',
                field: 'shelfLife'
            },
            'Manufacturer Details': {
                type: 'field',
                field: 'manufacturerDetails'
            },
            'Marketed By': {
                type: 'field',
                field: 'marketedBy'
            },
            'Country Of Origin': {
                type: 'field',
                field: 'countryOfOrigin'
            },
            'FSSAI License': {
                type: 'field',
                field: 'fssaiLicense'
            },
            'Customer Care Details': {
                type: 'object',
                field: 'customerCare',
                subFields: ['email', 'phone', 'address']
            },
            'Return Policy': {
                type: 'field',
                field: 'returnPolicy'
            },
            'Seller': {
                type: 'field',
                field: 'seller'
            },
            'Seller FSSAI': {
                type: 'field',
                field: 'sellerFssai'
            },
            'Disclaimer': {
                type: 'field',
                field: 'disclaimer'
            }
        }

        // Create a regex pattern to match any of the section names
        const sectionPattern = new RegExp(`(${Object.keys(sectionMappings).join('|')})`, 'g')

        // Initialize product object with default structure
        const product = {
            name: '',
            description: '',
            unit: '',
            price: '',
            stock: '',
            discount: '',
            category: [],
            subCategory: [],
            image: [],
            more_details: {
                keyFeatures: [],
                type: '',
                shelfLife: '',
                manufacturerDetails: '',
                marketedBy: '',
                countryOfOrigin: '',
                fssaiLicense: '',
                customerCare: {
                    email: '',
                    phone: '',
                    address: ''
                },
                returnPolicy: '',
                seller: '',
                sellerFssai: '',
                disclaimer: ''
            }
        }

        // Create a Set to track found fields
        const foundSections = new Set(['name', 'description', 'unit', 'stock', 'price', 'discount'])

        // Find all section matches
        const matches = [...plainText.matchAll(sectionPattern)]
        
        // Process each section
        matches.forEach((match, index) => {
            const sectionName = match[0]
            const startIndex = match.index
            const endIndex = index < matches.length - 1 ? matches[index + 1].index : plainText.length
            let content = plainText.slice(startIndex + sectionName.length, endIndex).trim()
            
            const sectionConfig = sectionMappings[sectionName]
            if (!sectionConfig) return

            // Add section to found fields
            foundSections.add(sectionConfig.field)

            switch(sectionConfig.type) {
                case 'header':
                    // For Product Details section, try to extract name and description
                    const lines = content.split('\n').filter(line => line.trim())
                    if (lines.length > 0) {
                        product.name = lines[0]
                        // Only set description from Product Details if there's no dedicated Description section
                        if (!sectionConfig.descriptionOnly && lines.length > 1) {
                            const descriptionContent = lines.slice(1).join('\n').trim()
                            if (descriptionContent && !product.description) {
                                product.description = descriptionContent
                            }
                        }
                    }
                    break

                case 'array':
                    // For sections that should be arrays (like Key Features)
                    product.more_details[sectionConfig.field] = content.split('\n')
                        .filter(line => line.trim())
                        .map(line => line.replace(/^[•\-\*]\s*/, '').trim())
                    break

                case 'object':
                    // For sections with sub-fields (like Customer Care)
                    const subFields = sectionConfig.subFields
                    subFields.forEach(field => {
                        const regex = new RegExp(`${field}:\\s*(.+?)(?=\\n|$)`, 'i')
                        const match = content.match(regex)
                        if (match) {
                            product.more_details[sectionConfig.field][field] = match[1].trim()
                        }
                    })
                    // Auto-fill email if not present
                    if (sectionName === 'Customer Care Details' && !product.more_details.customerCare.email) {
                        product.more_details.customerCare.email = 'info@blinkit.com'
                    }
                    break

                case 'field':
                    // For simple field sections
                    if (sectionConfig.field === 'description') {
                        // Special handling for description field
                        const descriptionContent = content.split('\n')
                            .filter(line => line.trim())
                            .join('\n')
                            .trim()
                        
                        if (descriptionContent) {
                            // If we already have a description, append to it
                            if (product.description) {
                                product.description = `${product.description}\n\n${descriptionContent}`
                            } else {
                                product.description = descriptionContent
                            }
                        }
                    } else if (sectionConfig.field === 'unit') {
                        // Process unit content
                        const units = ['kg', 'g', 'ml', 'l', 'cm', 'm', 'piece', 'pack', 'box', 'bottle', 'jar', 'can']
                        let processedContent = content
                        units.forEach(unit => {
                            const regex = new RegExp(`(\\d+\\s*${unit})`, 'gi')
                            processedContent = processedContent.replace(regex, '$1\n')
                        })
                        product[sectionConfig.field] = processedContent.trim()
                    } else if (sectionConfig.field === 'type') {
                        // Handle type field and try to set category
                        product.more_details[sectionConfig.field] = content
                        const category = allCategory.find(cat => 
                            cat.name.toLowerCase().includes('groceries') || 
                            cat.name.toLowerCase().includes('food')
                        )
                        if (category) {
                            product.category = [category]
                        }
                    } else {
                        // For other fields, store in more_details
                        product.more_details[sectionConfig.field] = content
                    }
                    break
            }
        })

        // Clean up description
        if (product.description) {
            // Remove any extra newlines and normalize spaces
            product.description = product.description
                .replace(/\n{3,}/g, '\n\n')  // Replace 3 or more newlines with 2
                .replace(/\s{2,}/g, ' ')     // Replace multiple spaces with single space
                .trim()
        }

        // Try to set name from type if not set
        if (!product.name && product.more_details.type) {
            product.name = product.more_details.type
        }

        // Update found fields state
        setFoundFields(foundSections)

        console.log('Final parsed product:', product)
        return product
    } catch (error) {
        console.error('Error parsing RTF:', error)
        throw new Error('Failed to parse RTF file: ' + error.message)
    }
  }

  const handleRtfUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    if (!file.name.endsWith('.rtf')) {
        toast.error('Please upload an RTF file')
        return
    }

    setRtfFile(file)
    setStatus('Reading RTF file...')

    try {
        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                console.log('File loaded, starting to parse...')
                const productData = await parseRtfContent(e.target.result)
                console.log('Parsing complete, updating form...')
                
                // Reset select states
                setSelectCategory("")
                setSelectSubCategory("")

                // Update form data
                setData({
                    name: productData.name || '',
                    description: productData.description || '',
                    unit: productData.unit || '',
                    stock: productData.stock?.toString() || '',
                    price: productData.price?.toString() || '',
                    discount: productData.discount?.toString() || '',
                    category: productData.category || [],
                    subCategory: productData.subCategory || [],
                    image: productData.image || [],
                    more_details: productData.more_details || {}
                })

                console.log('Form data updated:', {
                    name: productData.name,
                    description: productData.description,
                    unit: productData.unit,
                    stock: productData.stock,
                    price: productData.price,
                    discount: productData.discount,
                    category: productData.category,
                    subCategory: productData.subCategory,
                    image: productData.image,
                    more_details: productData.more_details
                })

                setStatus('RTF file processed successfully')
                toast.success('RTF file processed successfully')
            } catch (error) {
                console.error('Error processing RTF:', error)
                toast.error('Failed to process RTF file')
                setStatus('Failed to process RTF file')
            }
        }
        reader.readAsText(file)
    } catch (error) {
        console.error('Error reading RTF:', error)
        toast.error('Error reading RTF file')
        setStatus('Error reading RTF file')
    }
  }

  // Function to handle field deletion
  const handleDeleteField = (fieldName) => {
    const normalizedFieldName = fieldName.toLowerCase().replace(/\s+/g, '')
    setData(prev => {
        const newData = { ...prev }
        if (fieldName in newData.more_details) {
            const { [fieldName]: deleted, ...rest } = newData.more_details
            newData.more_details = rest
        } else {
            newData[fieldName] = ''
        }
        return newData
    })
    setFoundFields(prev => {
        const newSet = new Set(prev)
        newSet.delete(normalizedFieldName)
        return newSet
    })
  }

  // useEffect(()=>{
  //   successAlert("Upload successfully")
  // },[])
  return (
    <section className=''>
        <div className='p-2   bg-white shadow-md flex items-center justify-between'>
            <h2 className='font-semibold'>Upload Product</h2>
            <div className='flex gap-2'>
                <label className='px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm cursor-pointer'>
                    <FaFileAlt className='inline mr-2' />
                    Upload RTF
                    <input
                        type='file'
                        accept='.rtf'
                        onChange={handleRtfUpload}
                        className='hidden'
                    />
                </label>
                <button
                    onClick={() => setShowBulkUpload(true)}
                    className='px-4 py-1 bg-primary-200 text-white rounded hover:bg-primary-300 text-sm'
                >
                    Bulk Upload
                </button>
            </div>
        </div>

        {/* Status Message */}
        {status && (
            <div className='p-3 bg-blue-50 text-blue-700 rounded m-2'>
                {status}
            </div>
        )}

        {/* RTF File Format Instructions */}
        <div className='p-2 bg-gray-50 text-sm text-gray-600 m-2 rounded'>
            <p className='font-medium mb-1'>RTF File Format:</p>
            <ul className='list-disc list-inside'>
                <li>Each section should start with its name as a heading</li>
                <li>Sections should be separated by blank lines</li>
                <li>Required sections:</li>
                <ul className='list-disc list-inside ml-4'>
                    <li>Product Details (header)</li>
                    <li>Key Features (list of features)</li>
                    <li>Ingredients</li>
                    <li>Unit</li>
                    <li>Type</li>
                    <li>Description</li>
                </ul>
                <li>Example format:</li>
                <pre className='ml-4 mt-1 bg-white p-2 rounded text-xs'>
                    {`Product Details

Key Features
Versatile flour
Suitable for daily use

Ingredients
Chana Besan

Unit
1 kg

Type
Besan

Description
Gram Flour important vitamins...`}
                </pre>
            </ul>
        </div>

        <div className='grid p-3'>
            <form className='grid gap-4' onSubmit={handleSubmit}>
                {/* Only show name field if found in RTF or manually added */}
                {foundFields.has('name') && (
                    <div className='grid gap-1 relative'>
                        <div className='flex justify-between items-center'>
                            <label htmlFor='name' className='font-medium'>Name</label>
                            {data.name && (
                                <button
                                    type='button'
                                    onClick={() => handleDeleteField('name')}
                                    className='text-red-500 hover:text-red-700'
                                >
                                    <IoClose size={20} />
                                </button>
                            )}
                        </div>
                        <input 
                            id='name'
                            type='text'
                            placeholder='Enter product name'
                            name='name'
                            value={data.name}
                            onChange={handleChange}
                            required
                            className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                        />
                    </div>
                )}

                {/* Only show description field if found in RTF or manually added */}
                {foundFields.has('description') && (
                    <div className='grid gap-1 relative'>
                        <div className='flex justify-between items-center'>
                            <label htmlFor='description' className='font-medium'>Description</label>
                            {data.description && (
                                <button
                                    type='button'
                                    onClick={() => handleDeleteField('description')}
                                    className='text-red-500 hover:text-red-700'
                                >
                                    <IoClose size={20} />
                                </button>
                            )}
                        </div>
                        <textarea 
                            id='description'
                            type='text'
                            placeholder='Enter product description'
                            name='description'
                            value={data.description}
                            onChange={handleChange}
                            required
                            multiple 
                            rows={3}
                            className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded resize-none'
                        />
                    </div>
                )}

                <div>
                    <p className='font-medium'>Image</p>
                    <div>
                      <label htmlFor='productImage' className='bg-blue-50 h-24 border rounded flex justify-center items-center cursor-pointer'>
                          <div className='text-center flex justify-center items-center flex-col'>
                            {
                              imageLoading ?  <Loading/> : (
                                <>
                                   <FaCloudUploadAlt size={35}/>
                                   <p>Upload Image</p>
                                </>
                              )
                            }
                          </div>
                          <input 
                            type='file'
                            id='productImage'
                            className='hidden'
                            accept='image/*'
                            onChange={handleUploadImage}
                          />
                      </label>
                      {/**display uploded image*/}
                      <div className='flex flex-wrap gap-4'>
                        {
                          data.image.map((img,index) =>{
                              return(
                                <div key={`image-${img}-${index}`} className='h-20 mt-1 w-20 min-w-20 bg-blue-50 border relative group'>
                                  <img
                                    src={img}
                                    alt={img}
                                    className='w-full h-full object-scale-down cursor-pointer' 
                                    onClick={()=>setViewImageURL(img)}
                                  />
                                  <div onClick={()=>handleDeleteImage(index)} className='absolute bottom-0 right-0 p-1 bg-red-600 hover:bg-red-600 rounded text-white hidden group-hover:block cursor-pointer'>
                                    <MdDelete/>
                                  </div>
                                </div>
                              )
                          })
                        }
                      </div>
                    </div>

                </div>
                <div className='grid gap-1'>
                  <label className='font-medium'>Category</label>
                  <div>
                    <select
                      className='bg-blue-50 border w-full p-2 rounded'
                      value={selectCategory}
                      onChange={(e)=>{
                        const value = e.target.value 
                        const category = allCategory.find(el => el._id === value )
                        
                        setData((preve)=>{
                          return{
                            ...preve,
                            category : [...preve.category,category],
                          }
                        })
                        setSelectCategory("")
                      }}
                    >
                      <option value="">Select Category</option>
                      {allCategory.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className='flex flex-wrap gap-3'>
                      {
                        data.category.map((c,index)=>{
                          return(
                            <div key={`category-${c._id}-${index}`} className='text-sm flex items-center gap-1 bg-blue-50 mt-2'>
                              <p>{c.name}</p>
                              <div className='hover:text-red-500 cursor-pointer' onClick={()=>handleRemoveCategory(index)}>
                                <IoClose size={20}/>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </div>
                <div className='grid gap-1'>
                  <label className='font-medium'>Sub Category</label>
                  <div>
                    <select
                      className='bg-blue-50 border w-full p-2 rounded'
                      value={selectSubCategory}
                      onChange={(e)=>{
                        const value = e.target.value 
                        const subCategory = allSubCategory.find(el => el._id === value )

                        setData((preve)=>{
                          return{
                            ...preve,
                            subCategory : [...preve.subCategory,subCategory]
                          }
                        })
                        setSelectSubCategory("")
                      }}
                    >
                      <option value="">Select Sub Category</option>
                      {allSubCategory.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div className='flex flex-wrap gap-3'>
                      {
                        data.subCategory.map((c,index)=>{
                          return(
                            <div key={`subcategory-${c._id}-${index}`} className='text-sm flex items-center gap-1 bg-blue-50 mt-2'>
                              <p>{c.name}</p>
                              <div className='hover:text-red-500 cursor-pointer' onClick={()=>handleRemoveSubCategory(index)}>
                                <IoClose size={20}/>
                              </div>
                            </div>
                          )
                        })
                      }
                    </div>
                  </div>
                </div>

                {/* Only show unit field if found in RTF or manually added */}
                {foundFields.has('unit') && (
                    <div className='grid gap-1 relative'>
                        <div className='flex justify-between items-center'>
                            <label htmlFor='unit' className='font-medium'>Unit</label>
                            {data.unit && (
                                <button
                                    type='button'
                                    onClick={() => handleDeleteField('unit')}
                                    className='text-red-500 hover:text-red-700'
                                >
                                    <IoClose size={20} />
                                </button>
                            )}
                        </div>
                        <input 
                            id='unit'
                            type='text'
                            placeholder='Enter product unit'
                            name='unit'
                            value={data.unit}
                            onChange={handleChange}
                            required
                            className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                        />
                    </div>
                )}

                {/* Only show stock field if found in RTF or manually added */}
                {foundFields.has('stock') && (
                    <div className='grid gap-1 relative'>
                        <div className='flex justify-between items-center'>
                            <label htmlFor='stock' className='font-medium'>Number of Stock</label>
                            {data.stock && (
                                <button
                                    type='button'
                                    onClick={() => handleDeleteField('stock')}
                                    className='text-red-500 hover:text-red-700'
                                >
                                    <IoClose size={20} />
                                </button>
                            )}
                        </div>
                        <input 
                            id='stock'
                            type='number'
                            placeholder='Enter product stock'
                            name='stock'
                            value={data.stock}
                            onChange={handleChange}
                            required
                            className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                        />
                    </div>
                )}

                {/* Only show price field if found in RTF or manually added */}
                {foundFields.has('price') && (
                    <div className='grid gap-1 relative'>
                        <div className='flex justify-between items-center'>
                            <label htmlFor='price' className='font-medium'>Price</label>
                            {data.price && (
                                <button
                                    type='button'
                                    onClick={() => handleDeleteField('price')}
                                    className='text-red-500 hover:text-red-700'
                                >
                                    <IoClose size={20} />
                                </button>
                            )}
                        </div>
                        <input 
                            id='price'
                            type='number'
                            placeholder='Enter product price'
                            name='price'
                            value={data.price}
                            onChange={handleChange}
                            required
                            className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                        />
                    </div>
                )}

                {/* Only show discount field if found in RTF or manually added */}
                {foundFields.has('discount') && (
                    <div className='grid gap-1 relative'>
                        <div className='flex justify-between items-center'>
                            <label htmlFor='discount' className='font-medium'>Discount</label>
                            {data.discount && (
                                <button
                                    type='button'
                                    onClick={() => handleDeleteField('discount')}
                                    className='text-red-500 hover:text-red-700'
                                >
                                    <IoClose size={20} />
                                </button>
                            )}
                        </div>
                        <input 
                            id='discount'
                            type='number'
                            placeholder='Enter product discount'
                            name='discount'
                            value={data.discount}
                            onChange={handleChange}
                            required
                            className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                        />
                    </div>
                )}

                {/* Only show additional fields that were found in RTF or manually added */}
                {Object.keys(data?.more_details || {})
                    .filter(k => foundFields.has(k.toLowerCase().replace(/\s+/g, '')))
                    .map((k, index) => (
                        <div key={`more-details-${k}-${index}`} className='grid gap-1 relative'>
                            <div className='flex justify-between items-center'>
                                <label htmlFor={k} className='font-medium'>{k}</label>
                                <button
                                    type='button'
                                    onClick={() => handleDeleteField(k)}
                                    className='text-red-500 hover:text-red-700'
                                >
                                    <IoClose size={20} />
                                </button>
                            </div>
                            <input 
                                id={k}
                                type='text'
                                value={data?.more_details[k]}
                                onChange={(e) => {
                                    const value = e.target.value 
                                    setData((preve) => ({
                                        ...preve,
                                        more_details: {
                                            ...preve.more_details,
                                            [k]: value
                                        }
                                    }))
                                }}
                                required
                                className='bg-blue-50 p-2 outline-none border focus-within:border-primary-200 rounded'
                            />
                        </div>
                    ))
                }

                <div onClick={()=>setOpenAddField(true)} className='hover:bg-primary-200 bg-white py-1 px-3 w-32 text-center font-semibold border border-primary-200 hover:text-neutral-900 cursor-pointer rounded'>
                    Add Fields
                </div>

                <button className='bg-primary-100 hover:bg-primary-200 py-2 rounded font-semibold'>
                    Submit
                </button>
            </form>
        </div>

        {
          ViewImageURL && (
            <ViewImage url={ViewImageURL} close={()=>setViewImageURL("")}/>
          )
        }

        {
          openAddField && (
            <AddFieldComponent 
              value={fieldName}
              onChange={(e)=>setFieldName(e.target.value)}
              submit={handleAddField}
              close={()=>setOpenAddField(false)} 
            />
          )
        }

        {showBulkUpload && (
            <BulkUploadProducts
                close={() => setShowBulkUpload(false)}
                fetchData={handleProductSelect}
            />
        )}
    </section>
  )
}

export default UploadProduct
