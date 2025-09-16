const axios = require("axios");
const cheerio = require("cheerio");

async function fetchHtml(url) {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
    },
    timeout: 15000,
    validateStatus: (s) => s >= 200 && s < 400,
  });
  return cheerio.load(data);
}

async function getJugadores(keyword) {
  const url = `https://sofifa.com/players?keyword=${encodeURIComponent(keyword)}&hl=es-ES`;
  const $ = await fetchHtml(url);
  const jugadores = [];

  $("table.table tbody tr, .table tbody tr").each((_, el) => {
    const row = $(el);
    const tds = row.find("td");
    if (!tds || tds.length === 0) return;

    const nameLink = tds.eq(1).find("a").first();
    const name = nameLink.text().trim();
    if (!name) return;

    const href = nameLink.attr("href") || "";
    const id = parseInt((href.match(/\d+/) || [0])[0], 10) || 0;

    const nacionalidad = tds.eq(1).find("a > span").attr("title") || "";
    const posiciones = tds
      .eq(1)
      .find("span.pos, .pos")
      .map((i, e) => $(e).text().trim())
      .get()
      .filter(Boolean);

    const nivel = parseInt(tds.eq(3).text().trim() || "0", 10) || 0;
    const potencial = parseInt(tds.eq(4).text().trim() || "0", 10) || 0;

    jugadores.push({
      id,
      nombre: name,
      nacionalidad,
      posiciones,
      nivel,
      potencial,
    });
  });

  return jugadores;
}

async function getEquipos(keyword) {
  const url = `https://sofifa.com/teams?keyword=${encodeURIComponent(keyword)}&hl=es-ES`;
  const $ = await fetchHtml(url);
  const equipos = [];

  $('tbody > tr > td > a[href*="team"]').each((_, el) => {
    const a = $(el);
    const href = a.attr("href") || "";
    const id = parseInt(href.replace(/[^\d]/g, ""), 10) || 0;
    const nombre = a.text().trim();
    if (!id || !nombre) return;
    equipos.push({ id, nombre });
  });

  return equipos;
}

module.exports = { getJugadores, getEquipos };
