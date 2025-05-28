import React, { useState } from 'react';
import { FaFileAlt } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { useSelector } from 'react-redux';
import Axios from '../utils/Axios';
import SummaryApi from '../common/SummaryApi';
import toast from 'react-hot-toast';
import AxiosToastError from '../utils/AxiosToastError';

const BulkUploadProducts = ({ close, fetchData, onProductSelect }) => {
    const [uploading, setUploading] = useState(false);
    const [rtfFile, setRtfFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [status, setStatus] = useState('');
    const [currentProductIndex, setCurrentProductIndex] = useState(0);
    
    const allCategory = useSelector(state => state.product.allCategory);
    const allSubCategory = useSelector(state => state.product.allSubCategory);

    // Function to parse RTF content
    const parseRtfContent = async (rtfContent) => {
        try {
            // Remove RTF control characters and get plain text
            const plainText = rtfContent.replace(/\\[a-z0-9]+/g, '')
                .replace(/[{}]/g, '')
                .replace(/\\par/g, '\n')
                .replace(/\\tab/g, '\t')
                .trim()

            // Split into products (assuming each product is separated by multiple newlines)
            const productBlocks = plainText.split(/\n\s*\n/)

            const products = productBlocks.map(block => {
                const lines = block.split('\n').filter(line => line.trim())
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
                    more_details: {}
                }

                lines.forEach(line => {
                    // Split by first colon only to handle values that might contain colons
                    const colonIndex = line.indexOf(':')
                    if (colonIndex === -1) return

                    const key = line.substring(0, colonIndex).trim().toLowerCase()
                    const value = line.substring(colonIndex + 1).trim()

                    // Map RTF fields to our product schema
                    switch(key) {
                        case 'product name':
                        case 'name':
                            product.name = value
                            break
                        case 'description':
                        case 'desc':
                            product.description = value
                            break
                        case 'unit':
                        case 'measurement':
                            product.unit = value
                            break
                        case 'price':
                        case 'mrp':
                            // Remove currency symbols and convert to number
                            const priceValue = value.replace(/[^0-9.]/g, '')
                            product.price = priceValue ? parseFloat(priceValue) : ''
                            break
                        case 'stock':
                        case 'quantity':
                            // Remove any non-numeric characters and convert to number
                            const stockValue = value.replace(/[^0-9]/g, '')
                            product.stock = stockValue ? parseInt(stockValue) : ''
                            break
                        case 'discount':
                        case 'off':
                            // Remove any non-numeric characters and convert to number
                            const discountValue = value.replace(/[^0-9]/g, '')
                            product.discount = discountValue ? parseInt(discountValue) : ''
                            break
                        case 'category':
                            const category = allCategory.find(cat => 
                                cat.name.toLowerCase() === value.toLowerCase()
                            )
                            if (category) {
                                product.category = [category]
                            }
                            break
                        case 'subcategory':
                        case 'sub category':
                            const subCategory = allSubCategory.find(sub => 
                                sub.name.toLowerCase() === value.toLowerCase()
                            )
                            if (subCategory) {
                                product.subCategory = [subCategory]
                            }
                            break
                        case 'image':
                        case 'image url':
                            // Split by comma and trim each URL
                            product.image = value.split(',').map(url => url.trim())
                            break
                        default:
                            // Store any other fields in more_details
                            product.more_details[key] = value
                    }
                })

                // Log the parsed product for debugging
                console.log('Parsed product:', product)

                return product
            })

            // Filter out products that don't have required fields
            const validProducts = products.filter(product => {
                const isValid = product.name && product.description
                if (!isValid) {
                    console.log('Invalid product:', product)
                }
                return isValid
            })

            console.log('Total products parsed:', validProducts.length)
            return validProducts
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
                    const products = await parseRtfContent(e.target.result)
                    setPreview(products)
                    setStatus('RTF file processed successfully')
                    toast.success('RTF file processed successfully')
                    
                    // If onProductSelect is provided, send the first product to the form
                    if (onProductSelect && products.length > 0) {
                        onProductSelect(products[0])
                        setCurrentProductIndex(0)
                    }
                } catch (error) {
                    toast.error('Failed to process RTF file')
                    setStatus('Failed to process RTF file')
                }
            }
            reader.readAsText(file)
        } catch (error) {
            toast.error('Error reading RTF file')
            setStatus('Error reading RTF file')
        }
    }

    const handleNextProduct = () => {
        if (currentProductIndex < preview.length - 1) {
            const nextIndex = currentProductIndex + 1
            setCurrentProductIndex(nextIndex)
            if (onProductSelect) {
                onProductSelect(preview[nextIndex])
            }
        }
    }

    const handlePreviousProduct = () => {
        if (currentProductIndex > 0) {
            const prevIndex = currentProductIndex - 1
            setCurrentProductIndex(prevIndex)
            if (onProductSelect) {
                onProductSelect(preview[prevIndex])
            }
        }
    }

    // Upload all products
    const handleBulkUpload = async () => {
        if (!preview.length) {
            toast.error('Please upload and process RTF file first')
            return
        }

        setUploading(true)
        setStatus('Starting bulk upload...')

        try {
            // Process products in batches of 10
            const batchSize = 10
            const totalBatches = Math.ceil(preview.length / batchSize)
            let successCount = 0
            let errorCount = 0

            for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
                const start = batchIndex * batchSize
                const end = Math.min(start + batchSize, preview.length)
                const batch = preview.slice(start, end)

                setStatus(`Uploading batch ${batchIndex + 1} of ${totalBatches}...`)

                // Process each product in the batch
                const batchResults = await Promise.allSettled(
                    batch.map(async (product) => {
                        if (!product.image || product.image.length === 0) {
                            throw new Error(`No images found for product: ${product.name}`)
                        }

                        return Axios({
                            ...SummaryApi.createProduct,
                            data: product
                        })
                    })
                )

                // Count successes and failures
                batchResults.forEach(result => {
                    if (result.status === 'fulfilled') {
                        successCount++
                    } else {
                        errorCount++
                        console.error('Product upload failed:', result.reason)
                    }
                })
            }

            setStatus(`Upload completed. ${successCount} products uploaded successfully. ${errorCount} failed.`)
            
            if (errorCount > 0) {
                toast.error(`${errorCount} products failed to upload. Check console for details.`)
            } else {
                toast.success('All products uploaded successfully')
            }

            if (close) close()
            if (fetchData) fetchData()
        } catch (error) {
            console.error('Bulk upload error:', error)
            AxiosToastError(error)
            setStatus('Error: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <section className='fixed top-0 right-0 bottom-0 left-0 bg-neutral-800 bg-opacity-70 z-50 flex items-center justify-center p-4'>
            <div className='w-full max-w-5xl bg-white p-4 rounded max-h-[90vh] overflow-y-auto'>
                <div className='flex items-center justify-between gap-3 mb-4'>
                    <h1 className='font-semibold text-xl'>Bulk Upload Products</h1>
                    <button onClick={close}>
                        <IoClose size={25}/>
                    </button>
                </div>

                <div className='grid gap-6'>
                    {/* Status Message */}
                    {status && (
                        <div className='p-3 bg-blue-50 text-blue-700 rounded'>
                            {status}
                        </div>
                    )}

                    {/* RTF File Upload */}
                    <div className='grid gap-2'>
                        <label className='font-medium'>Product Information (RTF File)</label>
                        <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                            <div className='flex flex-col items-center gap-4'>
                                <FaFileAlt size={40} className='text-gray-400'/>
                                <div className='text-center'>
                                    <h3 className='font-semibold'>Upload RTF File</h3>
                                    <p className='text-sm text-gray-500 mt-1'>Upload RTF file containing product descriptions</p>
                                    <input
                                        type='file'
                                        accept='.rtf'
                                        onChange={handleRtfUpload}
                                        className='mt-4'
                                    />
                                </div>
                            </div>
                            {rtfFile && (
                                <p className='mt-2 text-sm text-gray-600'>
                                    Selected: {rtfFile.name}
                                </p>
                            )}
                            <div className='mt-4 text-sm text-gray-500'>
                                <p>RTF file format requirements:</p>
                                <ul className='mt-1 text-left list-disc list-inside'>
                                    <li>Each product should be separated by a blank line</li>
                                    <li>Required fields: name, description, unit, price, stock, category, subcategory, image</li>
                                    <li>Image URLs should be comma-separated</li>
                                    <li>Category and subcategory should match existing categories</li>
                                    <li>Price should be a number without currency symbol</li>
                                    <li>Stock should be a positive number</li>
                                    <li>Discount should be a number between 0 and 100</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Preview and Navigation */}
                    {preview.length > 0 && (
                        <div className='grid gap-4'>
                            <div className='flex items-center justify-between'>
                                <h2 className='font-medium'>Preview</h2>
                                <div className='flex gap-2'>
                                    <button
                                        onClick={handlePreviousProduct}
                                        disabled={currentProductIndex === 0}
                                        className='px-3 py-1 bg-gray-100 rounded disabled:opacity-50'
                                    >
                                        Previous
                                    </button>
                                    <span className='px-3 py-1 bg-gray-100 rounded'>
                                        {currentProductIndex + 1} of {preview.length}
                                    </span>
                                    <button
                                        onClick={handleNextProduct}
                                        disabled={currentProductIndex === preview.length - 1}
                                        className='px-3 py-1 bg-gray-100 rounded disabled:opacity-50'
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                            <div className='border p-4 rounded'>
                                <h3 className='font-medium'>{preview[currentProductIndex].name}</h3>
                                <p className='text-sm text-gray-600'>{preview[currentProductIndex].description}</p>
                                <div className='mt-2'>
                                    <p className='text-sm'>Images: {preview[currentProductIndex].image.length} images</p>
                                    <p className='text-sm'>Category: {preview[currentProductIndex].category?.[0]?.name}</p>
                                    <p className='text-sm'>Subcategory: {preview[currentProductIndex].subCategory?.[0]?.name}</p>
                                    <p className='text-sm'>Price: ₹{preview[currentProductIndex].price}</p>
                                    <p className='text-sm'>Stock: {preview[currentProductIndex].stock}</p>
                                    {preview[currentProductIndex].discount > 0 && (
                                        <p className='text-sm'>Discount: {preview[currentProductIndex].discount}%</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className='flex justify-end'>
                        <button
                            onClick={handleBulkUpload}
                            className='px-4 py-2 bg-primary-200 text-white rounded hover:bg-primary-300'
                            disabled={!rtfFile || uploading || preview.length === 0}
                        >
                            {uploading ? 'Uploading...' : 'Upload All Products'}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BulkUploadProducts; 