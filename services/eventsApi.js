/**
 * Placeholder events data source.
 * Step 2 will replace these methods with real Ticketmaster Discovery API calls,
 * keeping the same method signatures so routes/views don't need to change.
 */

const SAMPLE_EVENTS = {
  sports: [
    { slug: 'lakers-vs-celtics', name: 'LA Lakers vs Boston Celtics', venue: 'Crypto.com Arena', city: 'Los Angeles', date: '2026-07-12', minPrice: 89, image: '/img/placeholder-sports-1.jpg' },
    { slug: 'real-madrid-vs-barcelona', name: 'Real Madrid vs FC Barcelona', venue: 'Santiago Bernabéu', city: 'Madrid', date: '2026-08-03', minPrice: 145, image: '/img/placeholder-sports-2.jpg' },
    { slug: 'us-open-finals', name: 'US Open Tennis - Finals', venue: 'Arthur Ashe Stadium', city: 'New York', date: '2026-09-13', minPrice: 210, image: '/img/placeholder-sports-3.jpg' },
  ],
  concerts: [
    { slug: 'bad-bunny-world-tour', name: 'Bad Bunny - World Tour', venue: 'Hard Rock Stadium', city: 'Miami', date: '2026-07-22', minPrice: 120, image: '/img/placeholder-concert-1.jpg' },
    { slug: 'taylor-swift', name: 'Taylor Swift', venue: 'Wembley Stadium', city: 'London', date: '2026-08-15', minPrice: 175, image: '/img/placeholder-concert-2.jpg' },
    { slug: 'coldplay', name: 'Coldplay - Music of the Spheres', venue: 'Stade de France', city: 'Paris', date: '2026-09-02', minPrice: 99, image: '/img/placeholder-concert-3.jpg' },
  ],
  theatre: [
    { slug: 'hamilton', name: 'Hamilton', venue: 'Victoria Palace Theatre', city: 'London', date: '2026-07-05', minPrice: 65, image: '/img/placeholder-theatre-1.jpg' },
    { slug: 'the-lion-king', name: 'The Lion King', venue: 'Lyceum Theatre', city: 'New York', date: '2026-07-19', minPrice: 79, image: '/img/placeholder-theatre-2.jpg' },
    { slug: 'wicked', name: 'Wicked', venue: 'Apollo Victoria Theatre', city: 'London', date: '2026-08-09', minPrice: 55, image: '/img/placeholder-theatre-3.jpg' },
  ],
};

const SAMPLE_ARTISTS = {
  'bad-bunny': {
    slug: 'bad-bunny',
    name: 'Bad Bunny',
    image: '/img/artist-bad-bunny.jpg',
    description: 'Benito Antonio Martínez Ocasio, known professionally as Bad Bunny, is a Puerto Rican rapper and singer.',
    events: [
      { slug: 'bad-bunny-miami', name: 'Bad Bunny', venue: 'Hard Rock Stadium', city: 'Miami, FL', date: 'Tue · Jul 22 · 8:00 PM', minPrice: 120 },
      { slug: 'bad-bunny-nyc', name: 'Bad Bunny', venue: 'MetLife Stadium', city: 'East Rutherford, NJ', date: 'Fri · Jul 25 · 7:30 PM', minPrice: 145 },
      { slug: 'bad-bunny-mexico', name: 'Bad Bunny', venue: 'Estadio Azteca', city: 'Mexico City, MX', date: 'Sat · Aug 9 · 8:30 PM', minPrice: 98 },
    ],
  },
};

const SAMPLE_CITIES = [
  { name: 'New York', slug: 'new-york', image: '/img/city-new-york.jpg', eventCount: 1240 },
  { name: 'London', slug: 'london', image: '/img/city-london.jpg', eventCount: 980 },
  { name: 'Los Angeles', slug: 'los-angeles', image: '/img/city-los-angeles.jpg', eventCount: 860 },
  { name: 'Madrid', slug: 'madrid', image: '/img/city-madrid.jpg', eventCount: 540 },
  { name: 'Paris', slug: 'paris', image: '/img/city-paris.jpg', eventCount: 610 },
  { name: 'Miami', slug: 'miami', image: '/img/city-miami.jpg', eventCount: 410 },
];

async function getEventsByCategory(slug) {
  return SAMPLE_EVENTS[slug] || [];
}

async function getTopCities() {
  return SAMPLE_CITIES;
}

async function getArtistBySlug(slug) {
  return SAMPLE_ARTISTS[slug] || null;
}

async function getEventBySlug(slug) {
  const artist = SAMPLE_ARTISTS['bad-bunny'];
  const event = artist.events.find((e) => e.slug === slug);
  if (!event) return null;
  return {
    ...event,
    artist,
    sections: [
      { name: 'Floor A', priceFrom: 145 },
      { name: 'Lower Bowl', priceFrom: 120 },
      { name: 'Upper Bowl', priceFrom: 79 },
      { name: 'VIP Box', priceFrom: 320 },
    ],
  };
}

module.exports = { getEventsByCategory, getTopCities, getArtistBySlug, getEventBySlug };
