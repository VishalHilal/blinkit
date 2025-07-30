import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';

const Cancel = () => {
  return (
    <div className="m-4 w-full max-w-md bg-white shadow-lg p-6 rounded-2xl mx-auto flex flex-col items-center gap-4 border border-red-100">
      <XCircle className="text-red-600" size={48} />
      <h2 className="text-xl font-semibold text-red-700 text-center">
        Order Cancelled
      </h2>
      <p className="text-gray-600 text-center text-sm">
        Your payment was not completed. You can return to the homepage to continue shopping.
      </p>
      <Link
        to="/"
        className="mt-2 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
      >
        Go To Home
      </Link>
    </div>
  );
};

export default Cancel;
