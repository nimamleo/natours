const stripe = Stripe('pk_test_51Ljn96L790uS6XPNaqHfp1z99N0yW3J9Yhwy1d9mgIHLD5MjiA8wmWFkQp7YXjKJIAFv5SKu5EXW70i61fAZOO2x00gemV51P2')
import axios from "axios"

export const bookTour =async tourId=>{
    const session = await axios(`http://127.0.0.1:3000/api/v1/booking/checkout-session/${tourId}`)
    
}