import puppeteer from 'puppeteer';

export default async function handler(req, res) {
  try {
    const browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto('https://bwt.cbp.gov/details/250601/POV', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const waitTime = await page.$eval('.curr-wait', el => el.innerText);

    await browser.close();

    res.status(200).json({
      garita: 'Otay',
      tiempo_espera: waitTime
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener el tiempo de espera',
      detalle: error.message
    });
  }
}
