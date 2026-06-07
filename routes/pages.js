const express = require('express');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const CATEGORY_META = {
  sports: {
    title: 'Sports Tickets',
    tagline: 'From courtside seats to season finals — get closer to the action.',
    heroImage: '/img/category-sports.jpg',
  },
  concerts: {
    title: 'Concert Tickets',
    tagline: 'Live music from the world’s biggest artists, all in one place.',
    heroImage: '/img/category-concerts.jpg',
  },
  theatre: {
    title: 'Theatre Tickets',
    tagline: 'Broadway hits, West End classics and everything in between.',
    heroImage: '/img/category-theatre.jpg',
  },
};

router.get('/', (req, res) => {
  res.render('main', { title: 'Tickets - Concert, Sport & Theatre Tickets | viagogo' });
});

router.get('/category/:slug', async (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  const meta = CATEGORY_META[slug];
  if (!meta) return next();

  try {
    const events = await req.app.locals.eventsApi.getEventsByCategory(slug);
    res.render('category', {
      title: `${meta.title} | viagogo`,
      slug,
      meta,
      events,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/explore/cities', async (req, res, next) => {
  try {
    const cities = await req.app.locals.eventsApi.getTopCities();
    res.render('cities', { title: 'Top Cities | viagogo', cities });
  } catch (err) {
    next(err);
  }
});

router.get('/artist/:slug', async (req, res, next) => {
  try {
    const artist = await req.app.locals.eventsApi.getArtistBySlug(req.params.slug);
    if (!artist) return next();
    res.render('artist', { title: `${artist.name} Tickets | viagogo`, artist });
  } catch (err) {
    next(err);
  }
});

router.get('/event/:slug', async (req, res, next) => {
  try {
    const event = await req.app.locals.eventsApi.getEventBySlug(req.params.slug);
    if (!event) return next();
    res.render('ticket', { title: `${event.name} Tickets | viagogo`, event });
  } catch (err) {
    next(err);
  }
});

router.get('/my-tickets', requireAuth, (req, res) => {
  res.render('my-tickets', { title: 'My Tickets | viagogo' });
});

module.exports = router;
