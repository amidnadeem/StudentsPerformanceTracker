// js/auth.js
import { auth, db } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

import {
  doc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const errorMessage = document.getElementById('error-message');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginForm['email'].value;
      const password = loginForm['password'].value;

      try {
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
      } catch (error) {
        console.error(error.message);
        errorMessage.textContent = 'Invalid email or password';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = registerForm['name'].value;
      const email = registerForm['email'].value;
      const password = registerForm['password'].value;
      const role = registerForm['role'].value;

      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Save additional user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
          name: name,
          email: email,
          role: role,
        });

        alert('Registration successful!');
        window.location.href = 'dashboard.html';
      } catch (error) {
        console.error(error.message);
        errorMessage.textContent = 'Registration failed';
      }
    });
  }
});
