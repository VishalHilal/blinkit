import React, { useState } from 'react';
import EditProductAdmin from './EditProductAdmin';
import { IoClose } from 'react-icons/io5';
import SummaryApi from '../common/SummaryApi';
import Axios from '../utils/Axios';
import AxiosToastError from '../utils/AxiosToastError';
import toast from 'react-hot-toast';

const ProductCardAdmin = ({ data, fetchProductData }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  const handleDeleteCancel = () => {
    setOpenDelete(false);
  };

  const handleDelete = async () => {
    try {
      const response = await Axios({
        ...SummaryApi.deleteProduct,
        data: {
          _id: data._id,
        },
      });

      const { data: responseData } = response;

      if (responseData.success) {
        toast.success(responseData.message);
        if (fetchProductData) fetchProductData();
        setOpenDelete(false);
      }
    } catch (error) {
      AxiosToastError(error);
    }
  };

  return (
    <div className="w-44 p-4 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all border border-gray-100">
      <div className="rounded-xl overflow-hidden aspect-square bg-gray-50 flex items-center justify-center">
        <img
          src={data?.image[0]}
          alt={data?.name}
          className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>

      <p className="mt-3 text-sm font-medium text-gray-800 line-clamp-2">{data?.name}</p>
      <p className="text-xs text-gray-500">{data?.unit}</p>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <button
          onClick={() => setEditOpen(true)}
          className="text-xs px-3 py-1.5 rounded-lg border border-green-500 text-green-600 bg-green-50 hover:bg-green-100 transition"
        >
          Edit
        </button>
        <button
          onClick={() => setOpenDelete(true)}
          className="text-xs px-3 py-1.5 rounded-lg border border-red-500 text-red-600 bg-red-50 hover:bg-red-100 transition"
        >
          Delete
        </button>
      </div>

      {editOpen && (
        <EditProductAdmin
          fetchProductData={fetchProductData}
          data={data}
          close={() => setEditOpen(false)}
        />
      )}

      {openDelete && (
        <section className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Delete Product</h3>
              <button onClick={() => setOpenDelete(false)} className="text-gray-500 hover:text-gray-800">
                <IoClose size={22} />
              </button>
            </div>

            <p className="text-sm text-gray-600">Are you sure you want to delete this product permanently?</p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 text-sm rounded-lg border border-red-500 text-white bg-red-500 hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductCardAdmin;
