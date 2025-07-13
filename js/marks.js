// js/marks.js

import { auth, db } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';



const form = document.getElementById('marks-form');
const statusMsg = document.getElementById('status');
const navbar = document.getElementById('nav-links');
let userData = null;


onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  const userRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(userRef);
  const data = docSnap.data();
  userData = data;

  // Build navbar buttons based on role
  if (navbar) {
    if (data.role === 'teacher') {
      navbar.innerHTML = `
        <button onclick="location.href='dashboard.html'">Dashboard</button>
        <button onclick="location.href='add-marks.html'">Add Marks</button>
        <button onclick="location.href='view-marks.html'">View Marks</button>
        <button onclick="location.href='students.html'">All Students</button>
        <button onclick="logout()">Logout</button>
      `;
    } else if (data.role === 'student') {
      navbar.innerHTML = `
        <button onclick="location.href='dashboard.html'">Dashboard</button>
        <button onclick="location.href='view-marks.html'">View Marks</button>
        <button onclick="logout()">Logout</button>
      `;
    }
  }
});
// Global logout function
window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = 'index.html';
  });
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const studentEmail = document.getElementById('studentEmail').value;
  const subject = document.getElementById('subject').value;
  const score = parseInt(document.getElementById('score').value);

  try {
    // Validate that student exists
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', studentEmail), where('role', '==', 'student'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      statusMsg.style.color = 'red';
      statusMsg.textContent = 'No student found with that email.';
      return;
    }

    // Add marks
    await addDoc(collection(db, 'marks'), {
      studentEmail,
      subject,
      score,
      date: new Date()
    });

    statusMsg.style.color = 'green';
    statusMsg.textContent = 'Marks added successfully!';
    form.reset();
  } catch (error) {
    console.error('Error adding marks:', error);
    statusMsg.style.color = 'red';
    statusMsg.textContent = 'Failed to add marks.';
  }
});
