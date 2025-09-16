const express = require("express");
const path = require("path");
const { getJugadores, getEquipos } = require("./sofifa");

const app = express();

app.get("/api/sofifa", async (req, res) => {
  console.log("llegué api");
  const player = (req.query.keyword || req.query.player || "").toString().trim();
  if (!player) return res.status(400).json({ error: "Missing keyword" });

  try {
    const jugadores = await getJugadores(player);

    // Adaptar a lo que espera SoFifaPage
    const results = jugadores.map(j => ({
      name: j.nombre,
      rating: j.nivel,
      potential: j.potencial,
      positions: j.posiciones,
    }));

    res.json({ results });
  } catch (err: any) {
    console.error("SoFIFA scrape error:", err?.message || err);
    res.status(500).json({ error: "Error al obtener datos" });
  }
});

app.get("/api/sofifa/teams", async (req, res) => {
  const team = (req.query.keyword || req.query.team || "").toString().trim();
  if (!team) return res.status(400).json({ error: "Missing keyword" });
  try {
    const equipos = await getEquipos(team);
    res.json({ results: equipos });
  } catch (err) {
    console.error(
      "SoFIFA teams scrape error:",
      err && err.message ? err.message : err,
    );
    res.status(500).json({ error: "Error al obtener datos" });
  }
});

// Static hosting for built Angular app (after `ng build`)
const distDir = path.join(
  __dirname,
  "..",
  "dist",
  "fusion-angular-tailwind-starter",
  "browser",
);
app.use(express.static(distDir));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(distDir, "index.html"));
});

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

module.exports = app;
