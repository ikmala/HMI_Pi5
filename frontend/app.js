const grid = document.getElementById("grid");
const kolamSelect = document.getElementById("kolam-select");
const alarmBadge = document.getElementById("alarm-badge");
const alarmDropdown = document.getElementById("alarm-dropdown");
const alarmNotif = document.getElementById("alarm-notif");

const MAX_POINTS = 60;
let history = {};
let selectedKolam = 1;

// init history
for (let i = 1; i <= 12; i++) {
  history[i] = { ph: [], temp: [] };
}

// ================= CHART =================
const chart = new Chart(
  document.getElementById("trendChart").getContext("2d"), {
    type: "line",
    data: {
      labels: [],
      datasets: [
        { label: "pH", data: [], borderColor: "#00e676", tension: 0.3 },
        { label: "Temp (°C)", data: [], borderColor: "#ffb300", tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: {
          labels: {
            color: "#aaa",
            boxWidth: 12,
            font: { size: 11 }
          }
        }
      },
      scales: {
        x: {
          display: false,
          grid: { display: false }
        },
        y: {
          ticks: {
            color: "#666",
            font: { size: 10 }
          },
          grid: {
            color: "rgba(255,255,255,0.05)"
          }
        }
      }
    }

  }
);

kolamSelect.onchange = e => {
  selectedKolam = Number(e.target.value);
  updateChart();
};

alarmNotif.onclick = () => {
  alarmDropdown.style.display =
    alarmDropdown.style.display === "block" ? "none" : "block";
};

function updateChart() {
  chart.data.labels = history[selectedKolam].ph.map((_, i) => i);
  chart.data.datasets[0].data = history[selectedKolam].ph;
  chart.data.datasets[1].data = history[selectedKolam].temp;
  chart.update();
}

// ================= MAIN LOOP =================
async function loadData() {
  const res = await fetch("http://127.0.0.1:8000/data");
  const data = await res.json();

  grid.innerHTML = "";
  alarmDropdown.innerHTML = "";

  let alarmTotal = 0;
  let messages = [];

  data.forEach(k => {
    history[k.kolam].ph.push(k.ph);
    history[k.kolam].temp.push(k.temp);

    if (history[k.kolam].ph.length > MAX_POINTS) {
      history[k.kolam].ph.shift();
      history[k.kolam].temp.shift();
    }

    let level = "normal";
    if (k.ph_status === "ALARM" || k.temp_status === "ALARM") {
      level = "alarm";
      alarmTotal++;
    } else if (k.ph_status === "WARNING" || k.temp_status === "WARNING") {
      level = "warning";
    }

    const card = document.createElement("div");
    card.className = `card ${level}`;
    card.innerHTML = `
      <h2>Kolam ${k.kolam}</h2>
      <div class="value">pH: ${k.ph}</div>
      <div class="status-text">${k.ph_status}</div>
      <div class="value">Temp: ${k.temp} °C</div>
      <div class="status-text">${k.temp_status}</div>
    `;
    grid.appendChild(card);

    if (level !== "normal") {
      messages.push({
        text: `Kolam ${k.kolam}: pH ${k.ph_status}, Temp ${k.temp_status}`,
        level
      });
    }
  });

  alarmBadge.textContent = alarmTotal;

  if (messages.length === 0) {
    alarmDropdown.innerHTML = `<div class="no-alarm">🟢 Tidak ada alarm</div>`;
  } else {
    messages.forEach(m => {
      const div = document.createElement("div");
      div.className = m.level === "alarm" ? "alarm-item" : "warning-item";
      div.textContent = m.text;
      alarmDropdown.appendChild(div);
    });
  }

  updateChart();
}
const fsBtn = document.getElementById("fs-btn");

fsBtn.onclick = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fsBtn.textContent = "⤢";
  } else {
    document.exitFullscreen();
    fsBtn.textContent = "⛶";
  }
};


setInterval(loadData, 1000);
loadData();
