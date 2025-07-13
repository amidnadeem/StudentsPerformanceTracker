// js/dashboard.js

import { auth, db } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

import {
  doc,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';


const welcome = document.getElementById('welcome');
const teacherActions = document.getElementById('teacher-actions');
const studentActions = document.getElementById('student-actions');
const navbar = document.getElementById('nav-links');


onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);
  const data = docSnap.data();

  welcome.textContent = `Welcome, ${data.name} (${data.role})`;

  // Build navbar buttons based on role
  if (navbar) {
    if (data.role === 'teacher') {
      navbar.innerHTML = `
        <button data-href="dashboard.html">Dashboard</button>
        <button data-href="add-marks.html">Add Marks</button>
        <button data-href="view-marks.html">View Marks</button>
        <button data-href="students.html">All Students</button>
        <button id="logoutBtn">Logout</button>
      `;
    } else if (data.role === 'student') {
      navbar.innerHTML = `
        <button data-href="dashboard.html">Dashboard</button>
        <button data-href="view-marks.html">View Marks</button>
        <button id="logoutBtn">Logout</button>
      `;
    }
    // Attach logout event listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        window.logout();
      });
    }
    // Attach navigation event listeners
    Array.from(navbar.querySelectorAll('button[data-href]')).forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = btn.getAttribute('data-href');
      });
    });
  }

  if (data.role === 'teacher') {
    teacherActions.style.display = 'block';
  } else if (data.role === 'student') {
    studentActions.style.display = 'block';
  }
});


window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = 'index.html';
  });
};

// ...existing code...

// Sidebar/hamburger menu logic for mobile responsiveness
document.addEventListener('DOMContentLoaded', function () {
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const navOverlay = document.querySelector('.nav-overlay');

  if (navToggle && navLinks && navOverlay) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('nav-open');
      navOverlay.classList.toggle('active');
      navToggle.classList.toggle('open');
    });

    navOverlay.addEventListener('click', function () {
      navLinks.classList.remove('nav-open');
      navOverlay.classList.remove('active');
      navToggle.classList.remove('open');
    });
  }
});
