import {login , logout} from './login'
import { displayMap } from './mapbox'
import { updateSettings } from './updateSettings'
import { bookTour } from './stripe'
import '@babel/polyfill'



// ===================================login=================================
const form = document.querySelector('.form--login')
if (form) {
  form.addEventListener('submit' , e=>{
    e.preventDefault()
    const email = document.querySelector('#email')
    const password = document.querySelector('#password')
    login(email.value , password.value)
  })
}


// ===================================logout=================================
const logOutBtn = document.querySelector('.nav__el--logout')
if (logOutBtn) {
  logOutBtn.addEventListener('click' , logout)
}



// ===================================change info=================================
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm = document.querySelector('.form-user-password') 



if (userDataForm) {
  userDataForm.addEventListener('submit' , e=>{
    e.preventDefault()
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateSettings(form , 'data')
  })
}

if (userPasswordForm) {
  userPasswordForm.addEventListener('submit' ,async  e=>{
    e.preventDefault()

    document.querySelector('.btn--save--passord').textContent = 'Updating'
    
    const passwordCurrent = document.querySelector('#password-current').value
    const password = document.querySelector('#password').value
    const passwordConfirm = document.querySelector('#password-confirm').value
    await updateSettings({passwordCurrent ,password,passwordConfirm} , 'password')

    document.querySelector('#password-current').value = ''
    document.querySelector('#password-current').value = ''
    document.querySelector('#password-current').value = ''

    document.querySelector('.btn--save--passord').textContent = 'save password'
  })
} 


// ================================================================================
const bookBtn = document.querySelector('#book-tour')

if (bookBtn) {
  bookBtn.addEventListener('click' , e=>{
    e.target.textContent = 'Processing...'
    const {tourId} = e.target.dataset
    bookTour(tourId)
    e.target.textContent = ''
  })
}



// ===================================map=================================
// const mapBox = document.querySelector("#map")
// if (mapBox) {
//   const locations = JSON.parse(mapBox.CDATA_SECTION_NODE.locations)
//   displayMap(locations)
// }


