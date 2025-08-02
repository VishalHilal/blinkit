import { Outlet, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import toast, { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import fetchUserDetails from './utils/fetchUserDetails';
import { setUserDetails } from './store/userSlice';
import { setAllCategory, setAllSubCategory, setLoadingCategory } from './store/productSlice';
import { useDispatch } from 'react-redux';
import Axios from './utils/Axios';
import SummaryApi from './common/SummaryApi';
import GlobalProvider from './provider/GlobalProvider';
import CartMobileLink from './components/CartMobile';
import DisplayCartItem from './components/DisplayCartItem';

function App() {
  const dispatch = useDispatch();
  const location = useLocation();
  const [openCartSection, setOpenCartSection] = useState(false);

  const fetchUser = async () => {
    try {
      const userData = await fetchUserDetails();
      if (userData?.data) {
        dispatch(setUserDetails(userData.data));
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchCategory = async () => {
    try {
      dispatch(setLoadingCategory(true));
      const response = await Axios({ ...SummaryApi.getCategory });
      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(setAllCategory(responseData.data.sort((a, b) => a.name.localeCompare(b.name))));
      }
    } catch (error) {
      // Silently fail
    } finally {
      dispatch(setLoadingCategory(false));
    }
  };

  const fetchSubCategory = async () => {
    try {
      const response = await Axios({ ...SummaryApi.getSubCategory });
      const { data: responseData } = response;
      if (responseData.success) {
        dispatch(setAllSubCategory(responseData.data.sort((a, b) => a.name.localeCompare(b.name))));
      }
    } catch (error) {
      // Silently fail
    }
  };

  useEffect(() => {
    fetchUser();
    fetchCategory();
    fetchSubCategory();
  }, []);

  return (
    <GlobalProvider>
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 transition-colors">
        <Header openCartSection={setOpenCartSection} />

        <main className="flex-1 min-h-[78vh] px-2 sm:px-4 md:px-6 pt-2">
          <Outlet />
        </main>

        <Footer />
      </div>

      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      {location.pathname !== '/checkout' && (
        <CartMobileLink openCartSection={() => setOpenCartSection(true)} />
      )}

      {openCartSection && (
        <DisplayCartItem close={() => setOpenCartSection(false)} />
      )}
    </GlobalProvider>
  );
}

export default App;
