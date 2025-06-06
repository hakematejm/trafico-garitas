import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  const url = 'https://bwt.cbp.gov/details/09250601/POV'; // San Ysidro

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    await page.waitForSelector('.table tbody tr', { timeout: 30000 });

    const datos = await page.evaluate(() => {
      const filas = Array.from(document.querySelectorAll('.table tbody tr'));
      const resultado = {};
      filas.forEach(fila => {
        const celdas = fila.querySelectorAll('td');
        if (celdas.length >= 2) {
          const tipo = celdas[0].innerText.trim().toUpperCase();
          const minutos = parseInt(celdas[1].innerText.trim()) || 0;
          resultado[tipo] = minutos;
        }
      });
      return resultado;
    });

    await browser.close();

    res.status(200).json({
      garita: 'San Ysidro',
      ...datos
    });

  } catch (error) {
    console.error('❌ Error en Puppeteer:', error.message);
    res.status(500).json({ error: 'Error al obtener datos de San Ysidro' });
  }
}
