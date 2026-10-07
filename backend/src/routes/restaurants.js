const express = require('express');
const router = express.Router();
const { restaurants } = require('../data/mockData');

// GET /api/restaurants - list all restaurants
router.get('/', (req, res) => {
  const { cuisine, search } = req.query;
  let results = [...restaurants];

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(r => 
      r.name.toLowerCase().includes(q) || 
      r.cuisine.toLowerCase().includes(q) ||
      r.menu.some(m => m.name.toLowerCase().includes(q))
    );
  }

  if (cuisine) {
    results = results.filter(r => r.cuisine.toLowerCase().includes(cuisine.toLowerCase()));
  }

  res.json({
    success: true,
    count: results.length,
    data: results
  });
});

// GET /api/restaurants/:id - get single restaurant details with menu
router.get('/:id', (req, res) => {
  const restaurant = restaurants.find(r => r.id === req.params.id);
  if (!restaurant) {
    return res.status(404).json({ success: false, error: 'Restaurant not found' });
  }
  res.json({ success: true, data: restaurant });
});

module.exports = router;
