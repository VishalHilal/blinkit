import React, { useState, useEffect, useCallback } from "react";
import banner from "../assets/banner.jpg";
import banner1 from "../assets/image1.jpg";
import banner2 from "../assets/image2.jpg";
import banner3 from "../assets/image3.jpg";
import banner4 from "../assets/image4.jpg";
import { useSelector } from "react-redux";
import { valideURLConvert } from "../utils/valideURLConvert";
import { Link, useNavigate } from "react-router-dom";
import CategoryWiseProductDisplay from "../components/CategoryWiseProductDisplay";
import toast from "react-hot-toast";

const Home = () => {
  const loadingCategory = useSelector((state) => state.product.loadingCategory);
  const categoryData = useSelector((state) => state.product.allCategory);
  const subCategoryData = useSelector((state) => state.product.allSubCategory);
  const navigate = useNavigate();

  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const mobileBanners = [banner1, banner2, banner3, banner4];

  const handleBannerChange = useCallback(
    (index) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrentBannerIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setCurrentBannerIndex((prevIndex) =>
          prevIndex === mobileBanners.length - 1 ? 0 : prevIndex + 1
        );
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isTransitioning, mobileBanners.length]);

  const handleRedirectProductListpage = (id, cat) => {
    try {
      const subcategory = subCategoryData.find((sub) => {
        return sub.category.some((c) => c._id === id);
      });

      if (!subcategory) {
        toast.error("No subcategories found for this category");
        return;
      }

      const url = `/${valideURLConvert(cat)}-${id}/${valideURLConvert(
        subcategory.name
      )}-${subcategory._id}`;
      navigate(url);
    } catch (error) {
      console.error("Error redirecting to product list:", error);
      toast.error("Error loading category");
    }
  };

  return (
    <section className="bg-white relative ">
      <div className="flex mx-auto mt-2 items-start justify-start">
        <div className="w-full bg-gradient-to-r from-green-50 to-green-100 rounded-2xl overflow-hidden shadow-md">
          <img
            src={banner}
            className="w-full h-[450px] hidden lg:block"
            alt="banner"
          />

          <div className="relative w-full aspect-[2/1] lg:hidden overflow-hidden">
            {mobileBanners.map((bannerImg, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-500 ease-in-out ${
                  index === currentBannerIndex
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0"
                }`}
                style={{ willChange: "transform, opacity" }}
              >
                <img
                  src={bannerImg}
                  className="w-full h-full object-cover"
                  alt={`banner ${index + 1}`}
                  loading={index === 0 ? "eager" : "lazy"}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://via.placeholder.com/1080x540?text=Banner+Image";
                  }}
                />
              </div>
            ))}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {mobileBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleBannerChange(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentBannerIndex
                      ? "bg-green-600 scale-125 shadow-lg"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  disabled={isTransitioning}
                />
              ))}
            </div>

            <div
              className="absolute inset-y-0 left-0 w-1/3 z-10 cursor-pointer"
              onClick={() =>
                handleBannerChange(Math.max(0, currentBannerIndex - 1))
              }
            />
            <div
              className="absolute inset-y-0 right-0 w-1/3 z-10 cursor-pointer"
              onClick={() =>
                handleBannerChange(
                  Math.min(mobileBanners.length - 1, currentBannerIndex + 1)
                )
              }
            />
          </div>
        </div>
      </div>

      <div className="px-4 my-4 overflow-x-auto sm:grid sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4 flex sm:flex-none">
        {loadingCategory
          ? new Array(12).fill(null).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-4 h-36 grid gap-2 shadow-md animate-pulse"
              >
                <div className="bg-green-100 h-20 rounded"></div>
                <div className="bg-green-100 h-6 rounded"></div>
              </div>
            ))
          : categoryData.map((cat) => {
              const hasSubcategories = subCategoryData.some((sub) =>
                sub.category.some((c) => c._id === cat._id)
              );
              if (!hasSubcategories) return null;

              return (
                <div
                  key={cat._id}
                  className="cursor-pointer 
             min-w-[80px] w-[80px] h-[100px] 
             md:min-w-[100px] md:w-[100px] md:h-[120px] 
             lg:min-w-[120px] lg:w-[120px] lg:h-[140px]
             bg-white rounded-xl shadow-sm hover:shadow-md 
             transition flex flex-col items-center justify-center text-center p-2"
                  onClick={() =>
                    handleRedirectProductListpage(cat._id, cat.name)
                  }
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain mb-1"
                  />
                  <span className="text-[10px] md:text-xs lg:text-sm leading-tight text-gray-700 line-clamp-2">
                    {cat.name}
                  </span>
                </div>
              );
            })}
      </div>

      {categoryData?.map((c) => (
        <CategoryWiseProductDisplay
          key={c?._id + "CategorywiseProduct"}
          id={c?._id}
          name={c?.name}
        />
      ))}
    </section>
  );
};

export default Home;
