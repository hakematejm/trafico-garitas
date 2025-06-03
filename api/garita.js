export default async function handler(req, res) {
  try {
    const response = await fetch('https://bwt.cbp.gov/api/bwt.json');
    const data = await response.json();

    const getDelay = (port, lane) => {
      const item = data.find(
        x => x.port_name === port && x.lane_type === lane && x.direction === 'Northbound'
      );
      return item && item.delay_minutes !== null ? item.delay_minutes : 'N/D';
    };

    res.status(200).json({
      SanYsidro: {
        Normal: getDelay('San Ysidro', 'Standard'),
        Ready: getDelay('San Ysidro', 'Ready Lane'),
        Sentri: getDelay('San Ysidro', 'Sentri'),
        Peatonal: getDelay('San Ysidro', 'Pedestrian')
      },
      Otay: {
        Normal: getDelay('Otay Mesa', 'Standard'),
        Ready: getDelay('Otay Mesa', 'Ready Lane'),
        Sentri: getDelay('Otay Mesa', 'Sentri'),
        Peatonal: getDelay('Otay Mesa', 'Pedestrian')
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos de CBP' });
  }
}
