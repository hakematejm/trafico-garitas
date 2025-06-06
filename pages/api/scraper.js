import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';

export default async function handler(req, res) {
  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath || '/usr/bin/chromium-browser',
      headless: chromium.headless,
    });

    const page = await browser.newPage();

    // Ir al sitio de Otay como ejemplo (ajusta si usas otro)
    await page.goto('https://bwt.cbp.gov/details/250601/POV', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Esperar el selector si estás seguro del nombre
    await page.waitForSelector('.curr-wait', { timeout: 15000 });

    const waitTime = await page.$eval('.curr-wait', el => el.innerText.trim());

    res.status(200).json({
      garita: 'Otay Mesa',
      tiempo_espera: waitTime,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error scraping:', error.message);
    res.status(500).json({ error: 'Scraping failed', detalle: error.message });
  } finally {
    if (browser) await browser.close();
  }
}
