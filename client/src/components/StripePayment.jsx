import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripePayment = ({ amount, addressId, cartItems }) => {

  const handleStripeCheckout = async () => {
    if(amount === 0){
        alert("Please add some items first");
        return;
    }
    try {
      const response = await Axios({
        ...SummaryApi.stripe_create_intent,
        data: {
          amount: amount, 
          addressId,
          cartItems
        }
      })

      const { data: resData } = response

      if (resData.url) {
        window.location.href = resData.url
      }
    } catch (error) {
      console.error(error)
    }
  }


  return (
    <div>
    <button
      onClick={handleStripeCheckout}
      className='w-full py-3 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
    >
      Pay with Card
    </button>
    </div>
  )
}

export default StripePayment