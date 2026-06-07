const path = require('path');
const express = require('express');
const session = require('express-session');

const { sequelize } = require('./models');
const { attachUser } = require('./middleware/auth');
const eventsApi = require('./services/eventsApi');
const ticketmaster = require('./services/ticketmaster');
const authRoutes = require('./routes/auth');
const pageRoutes = require('./routes/pages');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'viagogo-clone-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    httpOnly: true,
  },
}));

app.use(attachUser);

// Shared services exposed to routes via app.locals
app.locals.eventsApi = eventsApi;
app.locals.ticketmaster = ticketmaster;

app.use('/', authRoutes);
app.use('/', pageRoutes);

app.use((req, res) => {
  res.status(404).render('404', { title: 'Page Not Found | viagogo' });
});

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`viagogo-clone server running at http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to sync database:', err);
  process.exit(1);
});
