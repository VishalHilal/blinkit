import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import router from './route/index'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import StripeProvider from './provider/StripeProvider'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
  <Provider store={store}>
    <StripeProvider>
      <RouterProvider router={router}/>
    </StripeProvider>
  </Provider>
  // </StrictMode>,
)
