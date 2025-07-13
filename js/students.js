import { auth, db } from './firebase-config.js';
import {
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

import {
  collection,
  query,
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const tableBody = document.querySelector('#studentsTable tbody');
const navbar = document.getElementById('nav-links');

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = 'index.html';

  const usersRef = collection(db, 'users');
  const marksRef = collection(db, 'marks');

  // Load nav
  navbar.innerHTML = `
    <button onclick="location.href='dashboard.html'">Dashboard</button>
    <button onclick="location.href='add-marks.html'">Add Marks</button>
    <button onclick="location.href='view-marks.html'">View Marks</button>
    <button onclick="location.href='students.html'">All Students</button>
    <button onclick="logout()">Logout</button>
  `;

  // Fetch students only
  const studentQuery = query(usersRef, where('role', '==', 'student'));
  const studentSnap = await getDocs(studentQuery);
  const allMarks = await getDocs(marksRef);

  const marksData = {};
  allMarks.forEach(doc => {
    const mark = doc.data();
    const email = mark.studentEmail;
    if (!marksData[email]) marksData[email] = [];
    marksData[email].push(mark.score);
  });

  studentSnap.forEach(doc => {
    const student = doc.data();
    const scores = marksData[student.email] || [];
    const total = scores.length;
    const avg = total ? (scores.reduce((a, b) => a + b, 0) / total).toFixed(2) : 'N/A';

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${student.name || 'N/A'}</td>
      <td>${student.email}</td>
      <td>${total}</td>
      <td>${avg}</td>
    `;
    tableBody.appendChild(row);
  });
});

window.logout = function () {
  signOut(auth).then(() => {
    window.location.href = 'index.html';
  });
};
