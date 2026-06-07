const TICKETMASTER_API_KEY = process.env.TICKETMASTER_API_KEY;
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map();

function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function formatDateRange(dates) {
  const start = dates && dates.start && (dates.start.localDate || dates.start.dateTime);
  if (!start) return 'Date to be announced';
  const startDate = new Date(start);
  const opts = { day: '2-digit', month: 'short' };
  let label = startDate.toLocaleDateString('en-GB', opts);

  const end = dates && dates.end && (dates.end.localDate || dates.end.dateTime);
  if (end) {
    const endDate = new Date(end);
    label += ` - ${endDate.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`;
  }
  return label;
}

function pickImage(images) {
  if (!images || !images.length) return '/img/placeholder-event.jpg';
  const wide = images
    .filter((img) => img.ratio === '16_9' && img.width >= 640)
    .sort((a, b) => b.width - a.width)[0];
  return (wide || images[0]).url;
}

function mapEvent(raw) {
  const venue = raw._embedded && raw._embedded.venues && raw._embedded.venues[0];
  const priceRange = raw.priceRanges && raw.priceRanges[0];

  return {
    id: raw.id,
    slug: slugify(raw.name) + '-' + raw.id.slice(-6),
    name: raw.name,
    image: pickImage(raw.images),
    dateRange: formatDateRange(raw.dates),
    venue: venue ? venue.name : 'Venue TBA',
    city: venue && venue.city ? venue.city.name : '',
    minPrice: priceRange ? Math.round(priceRange.min) : null,
    url: raw.url,
  };
}

const SAMPLE_EVENTS_FALLBACK = [
  {
    id: 'sample001', name: 'Bad Bunny - World Tour',
    images: [{ url: '/img/placeholder-concert-1.jpg', ratio: '16_9', width: 1024 }],
    dates: { start: { localDate: '2026-07-22' } },
    _embedded: { venues: [{ name: 'Hard Rock Stadium', city: { name: 'Miami' } }] },
    priceRanges: [{ min: 120 }],
    url: '#',
  },
  {
    id: 'sample002', name: 'Taylor Swift',
    images: [{ url: '/img/placeholder-concert-2.jpg', ratio: '16_9', width: 1024 }],
    dates: { start: { localDate: '2026-08-15' } },
    _embedded: { venues: [{ name: 'Wembley Stadium', city: { name: 'London' } }] },
    priceRanges: [{ min: 175 }],
    url: '#',
  },
  {
    id: 'sample003', name: 'LA Lakers vs Boston Celtics',
    images: [{ url: '/img/placeholder-sports-1.jpg', ratio: '16_9', width: 1024 }],
    dates: { start: { localDate: '2026-07-12' } },
    _embedded: { venues: [{ name: 'Crypto.com Arena', city: { name: 'Los Angeles' } }] },
    priceRanges: [{ min: 89 }],
    url: '#',
  },
];

/**
 * In local development without TICKETMASTER_API_KEY set, fall back to sample
 * data so the page can still be rendered and reviewed end-to-end.
 */
function isConfigured() {
  return Boolean(TICKETMASTER_API_KEY);
}

async function fetchFromTicketmaster(path, params = {}) {
  if (!TICKETMASTER_API_KEY) {
    throw new Error('TICKETMASTER_API_KEY is not set. Add it to your environment to fetch live events.');
  }

  const cacheKey = path + JSON.stringify(params);
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  const query = new URLSearchParams({ apikey: TICKETMASTER_API_KEY, ...params });
  const response = await fetch(`${BASE_URL}${path}?${query.toString()}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ticketmaster API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  cache.set(cacheKey, { data, timestamp: Date.now() });
  return data;
}

async function getPopularEvents({ size = 12 } = {}) {
  if (!isConfigured()) {
    return SAMPLE_EVENTS_FALLBACK.map(mapEvent);
  }

  const data = await fetchFromTicketmaster('/events.json', {
    size: String(size),
    sort: 'relevance,desc',
  });

  const events = (data._embedded && data._embedded.events) || [];
  return events.map(mapEvent);
}

const CATEGORY_CLASSIFICATION_NAMES = {
  sports: 'Sports',
  concerts: 'Music',
  theatre: 'Arts & Theatre',
};

async function getEventsByCategory(slug, { size = 24, city, page = 0 } = {}) {
  const classificationName = CATEGORY_CLASSIFICATION_NAMES[slug];
  if (!classificationName) return [];

  if (!isConfigured()) {
    return require('./eventsApi').getEventsByCategory(slug);
  }

  const params = {
    classificationName,
    size: String(size),
    page: String(page),
    sort: 'date,asc',
  };
  if (city) params.city = city;

  const data = await fetchFromTicketmaster('/events.json', params);
  const events = (data._embedded && data._embedded.events) || [];
  return events.map(mapEvent);
}

async function getEventById(id) {
  const raw = await fetchFromTicketmaster(`/events/${id}.json`);
  return mapEvent(raw);
}

async function searchEvents(keyword, { size = 20 } = {}) {
  const data = await fetchFromTicketmaster('/events.json', {
    keyword,
    size: String(size),
    sort: 'relevance,desc',
  });
  const events = (data._embedded && data._embedded.events) || [];
  return events.map(mapEvent);
}

module.exports = {
  getPopularEvents,
  getEventsByCategory,
  getEventById,
  searchEvents,
};
