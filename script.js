document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach((link) => {
    const targetId = link.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (!targetElement) return;

    link.addEventListener('click', (event) => {
      event.preventDefault();
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', targetId);
    });
  });

  // Steam API Integration
  const steamApiKey = 'YOUR_STEAM_API_KEY'; // Get from https://steamcommunity.com/dev/apikey
  const steamId = 'YOUR_STEAM_ID_64'; // Find at https://steamid.io/ or your profile URL

  if (steamApiKey !== 'YOUR_STEAM_API_KEY' && steamId !== 'YOUR_STEAM_ID_64') {
    fetchSteamStats();
  } else {
    document.getElementById('steam-stats').innerHTML = '<p>Steam stats not configured. Add your API key and Steam ID to script.js</p>';
  }

  async function fetchSteamStats() {
    try {
      // Fetch owned games
      const gamesResponse = await fetch(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${steamApiKey}&steamid=${steamId}&format=json&include_appinfo=true`);
      const gamesData = await gamesResponse.json();

      // Fetch player summary
      const playerResponse = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${steamApiKey}&steamids=${steamId}`);
      const playerData = await playerResponse.json();

      const games = gamesData.response.games || [];
      const player = playerData.response.players[0];

      // Calculate total playtime
      const totalHours = games.reduce((sum, game) => sum + game.playtime_forever, 0) / 60;

      // Get top 3 games by playtime
      const topGames = games
        .sort((a, b) => b.playtime_forever - a.playtime_forever)
        .slice(0, 3)
        .map(game => `<li>${game.name}: ${Math.round(game.playtime_forever / 60)} hours</li>`)
        .join('');

      const statsHtml = `
        <div class="stats-grid">
          <div class="stat-item">
            <h4>Total Games</h4>
            <p class="stat-number">${games.length}</p>
          </div>
          <div class="stat-item">
            <h4>Total Hours</h4>
            <p class="stat-number">${Math.round(totalHours)}</p>
          </div>
          <div class="stat-item">
            <h4>Top Games</h4>
            <ul class="top-games">${topGames}</ul>
          </div>
        </div>
      `;

      document.getElementById('steam-stats').innerHTML = statsHtml;
    } catch (error) {
      console.error('Error fetching Steam stats:', error);
      document.getElementById('steam-stats').innerHTML = '<p>Unable to load Steam stats. Check console for details.</p>';
    }
  }
});
