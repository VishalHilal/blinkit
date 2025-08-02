import React, { useEffect, useState } from 'react';
import { IoSearch } from 'react-icons/io5';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TypeAnimation } from 'react-type-animation';
import { FaArrowLeft } from 'react-icons/fa';
import useMobile from '../hooks/useMobile';

const Search = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchPage, setIsSearchPage] = useState(false);
  const [isMobile] = useMobile();
  const params = useLocation();
  const searchText = params.search.slice(3);

  useEffect(() => {
    const isSearch = location.pathname === '/search';
    setIsSearchPage(isSearch);
  }, [location]);

  const redirectToSearchPage = () => {
    navigate('/search');
  };

  const handleOnChange = (e) => {
    const value = e.target.value;
    const url = `/search?q=${value}`;
    navigate(url);
  };

  return (
    <div className="w-full min-w-[300px] lg:min-w-[420px] h-11 lg:h-12 rounded-2xl border border-gray-200 bg-white shadow-sm flex items-center group focus-within:ring-2 focus-within:ring-primary-200 transition">
      <div className="pl-3 pr-2 flex items-center">
        {isMobile && isSearchPage ? (
          <Link
            to="/"
            className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-black transition"
          >
            <FaArrowLeft size={18} />
          </Link>
        ) : (
          <div className="text-gray-500 group-focus-within:text-primary-500 transition">
            <IoSearch size={20} />
          </div>
        )}
      </div>

      <div className="flex-1 h-full">
        {!isSearchPage ? (
          <div
            onClick={redirectToSearchPage}
            className="w-full h-full flex items-center cursor-text text-sm text-gray-400"
          >
            <TypeAnimation
              sequence={[
                'Search "milk"', 1000,
                'Search "bread"', 1000,
                'Search "sugar"', 1000,
                'Search "paneer"', 1000,
                'Search "chocolate"', 1000,
                'Search "curd"', 1000,
                'Search "rice"', 1000,
                'Search "egg"', 1000,
                'Search "chips"',
              ]}
              wrapper="span"
              speed={50}
              repeat={Infinity}
              className="truncate"
            />
          </div>
        ) : (
          <input
            type="text"
            autoFocus
            defaultValue={searchText}
            placeholder="Search for atta, dal and more..."
            onChange={handleOnChange}
            className="w-full h-full bg-transparent outline-none px-1 text-sm text-gray-700 placeholder-gray-400"
          />
        )}
      </div>
    </div>
  );
};

export default Search;
