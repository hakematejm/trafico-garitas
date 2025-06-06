const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
  const url = 'https://bwt.cbp.gov/details/250601/POV';

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    // Esperar a que aparezca algo útil
    await page.waitForSelector('.table tbody', { timeout: 30000 });

    const datos = await page.evaluate(() => {
      const filas = Array.from(document.querySelectorAll('.table tbody tr'));
      const tiempos = {};
      filas.forEach(row => {
        const tds = row.querySelectorAll('td');
        const tipo = tds[0]?.innerText.trim().toUpperCase();
        const tiempo = parseInt(tds[1]?.innerText.trim()) || 0;
        if (tipo) {
          tiempos[tipo] = tiempo;
        }
      });
      return tiempos;
    });

    await browser.close();

    res.status(200).json({
      garita: 'Otay Mesa',
      ...datos
    });
  } catch (err) {
    if (browser) await browser.close();
    res.status(500).json({ error: 'Error al extraer los datos', detalle: err.message });
  }
};
