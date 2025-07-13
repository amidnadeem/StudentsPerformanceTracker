// js/chart.js
import { auth, db } from './firebase-config.js';
import {
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  doc,
  getDoc,
  collection,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const chartCanvas = document.getElementById('marksChart');
const lineChartCanvas = document.getElementById('lineChart');
const studentTable = document.getElementById('studentMarksTable');
const studentTableBody = studentTable.querySelector('tbody');
const table = document.getElementById('marksTable');
const tableBody = table.querySelector('tbody');
const subjectFilter = document.getElementById('subjectFilter');
const lineSubjectSelect = document.getElementById('lineSubject');
const heading = document.getElementById('heading');
const downloadBtn = document.getElementById('downloadBtn');

let userData = null;
let marksSnapshot = null;
let allMarks = [];
let lineChartInstance;

onAuthStateChanged(auth, async (user) => {
  if (!user) return window.location.href = 'index.html';

  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  userData = userSnap.data();

  // Dynamic navbar population
  const navLinks = document.getElementById('nav-links');
  if (userData.role === 'teacher') {
    navLinks.innerHTML = `
      <button onclick="location.href='dashboard.html'">Dashboard</button>
      <button onclick="location.href='add-marks.html'">Add Marks</button>
      <button onclick="location.href='view-marks.html'">View Marks</button>
      <button onclick="location.href='students.html'">All Students</button>
      <button onclick="logout()">Logout</button>
    `;
  } else if (userData.role === 'student') {
    navLinks.innerHTML = `
      <button onclick="location.href='dashboard.html'">Dashboard</button>
      <button onclick="location.href='view-marks.html'">View Marks</button>
      <button onclick="logout()">Logout</button>
    `;
  }

  await loadMarks();

  subjectFilter.addEventListener('change', () => {
    displayMarks(allMarks, subjectFilter.value);
  });

  if (lineSubjectSelect) {
    lineSubjectSelect.addEventListener('change', () => {
      const selected = lineSubjectSelect.value;
      if (!selected || selected === 'all') {
        lineChartCanvas.style.display = 'none';
        return;
      }

      const subjectMarks = allMarks
        .filter(m => m.subject === selected)
        .sort((a, b) => a.date.toDate() - b.date.toDate());

      const labels = subjectMarks.map(m => new Date(m.date.toDate()).toLocaleDateString());
      const scores = subjectMarks.map(m => m.score);

      if (lineChartInstance) lineChartInstance.destroy();

      lineChartCanvas.style.display = 'block';
      lineChartInstance = new Chart(lineChartCanvas, {
        type: 'line',
        data: {
          labels,
          datasets: [{
            label: `${selected} Performance`,
            data: scores,
            fill: false,
            borderColor: '#28a745',
            tension: 0.2
          }]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: 100
            }
          }
        }
      });
    });
  }
});

async function loadMarks() {
  const marksRef = collection(db, 'marks');
  const snapshot = await getDocs(marksRef);
  marksSnapshot = snapshot;

  allMarks = [];

  snapshot.forEach(doc => {
    const mark = doc.data();
    if (
      (userData.role === 'student' && mark.studentEmail === userData.email) ||
      userData.role === 'teacher'
    ) {
      allMarks.push(mark);
    }
  });

  displayMarks(allMarks, subjectFilter.value);
}

function displayMarks(marks, selectedSubject) {
  const filtered = selectedSubject === 'all'
    ? marks
    : marks.filter(m => m.subject === selectedSubject);

  if (userData.role === 'student') {
    heading.textContent = 'Your Marks';
    chartCanvas.style.display = 'block';
    table.style.display = 'none';
    studentTable.style.display = 'table';
    studentTableBody.innerHTML = '';

    const subjects = filtered.map(m => m.subject);
    const scores = filtered.map(m => m.score);

    if (Chart.getChart(chartCanvas)) Chart.getChart(chartCanvas).destroy();

    new Chart(chartCanvas, {
      type: 'bar',
      data: {
        labels: subjects,
        datasets: [{
          label: 'Score',
          data: scores,
          backgroundColor: 'rgba(0, 123, 255, 0.7)'
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });

    filtered.forEach(m => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${m.subject}</td>
        <td>${m.score}</td>
        <td>${new Date(m.date.toDate()).toLocaleDateString()}</td>
      `;
      studentTableBody.appendChild(row);
    });

  } else {
    heading.textContent = "All Students' Marks";
    chartCanvas.style.display = 'none';
    lineChartCanvas.style.display = 'none';
    studentTable.style.display = 'none';
    table.style.display = 'table';
    tableBody.innerHTML = '';

    filtered.forEach(m => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${m.studentEmail}</td>
        <td>${m.subject}</td>
        <td>${m.score}</td>
        <td>${new Date(m.date.toDate()).toLocaleDateString()}</td>
      `;
      tableBody.appendChild(row);
    });
  }
}

downloadBtn.addEventListener('click', async () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  if (!userData || !marksSnapshot) {
    alert('Data not loaded yet.');
    return;
  }

  if (userData.role === 'student') {
    const studentMarks = allMarks.filter(m => m.studentEmail === userData.email);
    const subjects = studentMarks.map(m => m.subject);
    const scores = studentMarks.map(m => m.score);

    const chartImage = chartCanvas.toDataURL('image/png', 1.0);
    doc.text('Student Performance Report', 20, 20);
    doc.addImage(chartImage, 'PNG', 15, 30, 180, 100);

    let y = 140;
    doc.setFontSize(10);
    doc.text('Subject      Score     Date', 20, y);
    y += 8;
    studentMarks.forEach(mark => {
      const date = new Date(mark.date.toDate()).toLocaleDateString();
      doc.text(`${mark.subject}         ${mark.score}     ${date}`, 20, y);
      y += 8;
    });

  } else if (userData.role === 'teacher') {
    doc.text('All Students Marks Report', 20, 20);

    let y = 30;
    doc.setFontSize(10);
    doc.text('Email           Subject           Score     Date', 20, y);
    y += 8;

    marksSnapshot.docs.forEach(docSnap => {
      const mark = docSnap.data();
      const date = new Date(mark.date.toDate()).toLocaleDateString();
      doc.text(
        `${mark.studentEmail}   ${mark.subject}      ${mark.score}     ${date}`,
        20,
        y
      );
      y += 8;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });
  }

  doc.save('marks-report.pdf');
});
