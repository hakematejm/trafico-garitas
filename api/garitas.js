import cheerio from "cheerio";
import fetch from "node-fetch";

const GARITAS = [
  {
    nombre: "San Ysidro",
    url: "https://bwt.cbp.gov/details/09250601/POV"
  },
  {
    nombre: "Otay Mesa",
    url: "https://bwt.cbp.gov/details/250601/POV"
  }
];

// Vercel requiere exportar una función por default
export default async function handler(req, res) {
  try {
    const resultados = [];

    for (const garita of GARITAS) {
      const response = await fetch(garita.url);
      const html = await response.text();
      const $ = cheerio.load(html);
      const waitTime = $(".curr-wait").first().text().trim();

      resultados.push({
        garita: garita.nombre,
        tiempo_espera: waitTime ? `${waitTime} min` : "No disponible"
      });
    }

    res.status(200).json(resultados);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener los tiempos de espera",
      detalle: error.message
    });
  }
}
