const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/scrape', async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto('https://bwt.cbp.gov/details/09250601/POV', { waitUntil: 'networkidle2' });

    const tiempo = await page.$eval('.curr-wait', el => el.innerText);

    await browser.close();

    res.json({
      garita: 'San Ysidro',
      tiempo_espera: tiempo,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos', detalle: error.toString() });
  }
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});
