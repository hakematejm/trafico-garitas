import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  try {
    const urls = [
      {
        nombre: "San Ysidro",
        url: "https://bwt.cbp.gov/details/250401/traffic"
      },
      {
        nombre: "Otay",
        url: "https://bwt.cbp.gov/details/250601/traffic"
      }
    ];

    const resultados = {};

    for (const garita of urls) {
      const response = await fetch(garita.url);
      const html = await response.text();
      const $ = cheerio.load(html);

      let datos = {};

      // Buscar tabla con clase 'traffic-table'
      $('table.traffic-table tbody tr').each((i, el) => {
        const tipo = $(el).find('td').eq(0).text().trim();
        const tiempo = $(el).find('td').eq(1).text().trim();
        if (tipo && tiempo) {
          datos[tipo] = tiempo;
        }
      });

      resultados[garita.nombre] = datos;
    }

    res.status(200).json({ ok: true, resultados });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.toString() });
  }
}
