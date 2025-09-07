// cosmetics.js — 323cosmetics frontend logic

document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = ""; // same origin, since server.js and index.html are served together
  const container = document.getElementById("trend");

  function ts() {
    return new Date().toLocaleTimeString([], { hour12: false });
  }

  function line(msg) {
    const p = document.createElement("p");
    p.innerHTML = `<span>[${ts()}]</span> ${msg}`;
    container.appendChild(p);
  }

  async function loadTrend() {
    try {
      line("📡 Fetching 323cosmetics trend…");
      const r = await fetch(`${API_BASE}/api/trend`, { cache: "no-store" });
      const j = await r.json();

      container.innerHTML = `
        <div class="card">
          <h2>${j.brand}</h2>
          <p><strong>Product:</strong> ${j.product}</p>
          <p><strong>Gender:</strong> ${j.gender}</p>
          <p><strong>Description:</strong> ${j.description}</p>
          <div>
            ${(j.hashtags || []).map(h => `<span class="badge">${h}</span>`).join(" ")}
          </div>
        </div>
      `;
    } catch (e) {
      container.innerHTML = `<p style="color:red">❌ Failed to load trend.</p>`;
      console.error(e);
    }
  }

  loadTrend();
});
