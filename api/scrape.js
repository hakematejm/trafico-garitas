const puppeteer = require('puppeteer');

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

module.exports = async (req, res) => {
  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    const resultados = [];

    for (const garita of GARITAS) {
      await page.goto(garita.url, { waitUntil: "networkidle2", timeout: 60000 });
      await page.waitForSelector('.curr-wait');
      const tiempo = await page.$eval('.curr-wait', el => el.innerText);

      resultados.push({
        garita: garita.nombre,
        tiempo_espera: tiempo,
        timestamp: new Date().toISOString()
      });
    }

    await browser.close();
    res.status(200).json({ status: 'ok', datos: resultados });
  } catch (error) {
    console.error('❌ Error en /scrape:', error);
    res.status(500).json({ status: 'error', error: error.toString() });
  }
};
