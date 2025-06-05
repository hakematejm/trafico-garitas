export default function Home() {
  return (
    <main style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>🚦 Tráfico Garitas</h1>
      <p>La API del scraper está activa en:</p>
      <a href="/api/scraper" style={{ color: 'blue', textDecoration: 'underline' }}>
        /api/scraper
      </a>
    </main>
  );
}
