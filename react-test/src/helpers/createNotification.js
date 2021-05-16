import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export const createNotification = (message) => {
    /* Reusable function to create push notifications on the fly. */
    toast.info(
      message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    )
} 
