// ==============================
// KONFIGURASI
// ==============================
const API_URL = "http://localhost:8000/data";
const grid = document.getElementById("grid");
const fsBtn = document.getElementById("fs-btn");

// ==============================
// FULLSCREEN BUTTON
// ==============================
fsBtn.onclick = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
};

// ==============================
// FETCH DATA
// ==============================
async function loadData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    renderGrid(data);
  } catch (err) {
    console.error(err);
    grid.innerHTML = `<div class="error">❌ Backend tidak bisa diakses</div>`;
  }
}

// ==============================
// RENDER GRID
// ==============================

function renderGrid(data) {
  grid.innerHTML = "";

  data.forEach(k => {
    const ph = k.ph !== null ? k.ph.toFixed(2) : "--";
    const temp = k.temp !== null ? k.temp.toFixed(1) : "--";

    // Tentukan status utama kartu
    let level = "normal";
    if (k.ph_status === "ALARM" || k.temp_status === "ALARM") level = "alarm";
    else if (k.ph_status === "WARNING" || k.temp_status === "WARNING") level = "warning";
    // Jika data kosong/null, bisa tetap 'normal' atau buat class baru 'offline'
    if (k.ph === null) level = ""; 

    const card = document.createElement("div");
    card.className = `card ${level}`;

    card.innerHTML = `
      <div class="card-header">
        <h2>KOLAM ${k.kolam}</h2>
        <div class="live-dot"></div>
      </div>
      
      <div class="card-body">
        <div class="param">
          <span class="label">pH Level</span>
          <div class="value-box">
            <span class="val">${ph}</span>
          </div>
        </div>
        <div class="param">
          <span class="label">Temperature</span>
          <div class="value-box">
            <span class="val">${temp}</span>
            <span class="unit">&deg;C</span>
          </div>
        </div>
      </div>

      <div class="card-footer">
        ${level === 'alarm' ? 'ALARM DETECTED' : level === 'warning' ? 'WARNING' : 'SYSTEM OK'}
      </div>
    `;

    grid.appendChild(card);
  });
}

// ==============================
// AUTO REFRESH
// ==============================
loadData();
setInterval(loadData, 1000);
