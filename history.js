
function formatDateTime(value) {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleString();
}

// Render the history list from localStorage
function renderHistory() {
  const container = document.getElementById("history-list");
  container.innerHTML = "";

  const history = JSON.parse(localStorage.getItem("whackAMoleHistory") || "[]");

  if (history.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:#502f09;">No history found.</p>';
    return;
  }

  history.forEach(({ score, timestamp }, index) => {
    const div = document.createElement("div");
    div.className = "history-entry";
    div.innerHTML = `
      <span>🔢 Score: ${score}</span>
      <span>🕒 ${formatDateTime(timestamp)}</span>
    `;
    container.appendChild(div);
  });
}

// Clear history button handler
document.getElementById("clear-history").addEventListener("click", () => {
  if (confirm("Are you sure you want to clear all history?")) {
    localStorage.removeItem("whackAMoleHistory");
    renderHistory();
  }
});

// Initial render on page load
renderHistory();
