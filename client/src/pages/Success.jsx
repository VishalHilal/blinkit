import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const Success = () => {
  const location = useLocation();
  const message = Boolean(location?.state?.text) ? location.state.text : "Payment";

  return (
    <div className="m-4 w-full max-w-md bg-white shadow-lg p-6 rounded-2xl mx-auto flex flex-col items-center gap-4 border border-green-100">
      <CheckCircle className="text-green-600" size={48} />
      <h2 className="text-xl font-semibold text-green-700 text-center">
        {message} Successful
      </h2>
      <p className="text-gray-600 text-center text-sm">
        Thank you for your transaction. You can now return to the homepage.
      </p>
      <Link
        to="/"
        className="mt-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
      >
        Go To Home
      </Link>
    </div>
  );
};

export default Success;
