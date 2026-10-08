const restaurants = [
  {
    id: 'rest-1',
    name: 'Gourmet Burger Kitchen',
    cuisine: 'American • Burgers • Fast Food',
    rating: 4.8,
    deliveryTime: '20-30 min',
    deliveryFee: '₹49',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    location: { lat: 37.7749, lng: -122.4194 },
    menu: [
      { id: 'item-101', name: 'Smash Bacon Cheeseburger', price: 249, description: 'Double beef patty, aged cheddar, crispy smoked bacon, secret sauce', image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&auto=format&fit=crop&q=80' },
      { id: 'item-102', name: 'Truffle Parmesan Fries', price: 129, description: 'Hand-cut fries tossed with black truffle oil and freshly grated parmesan', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&auto=format&fit=crop&q=80' },
      { id: 'item-103', name: 'Artisan Salted Caramel Shake', price: 99, description: 'Rich vanilla ice cream infused with sea salt caramel and whipped cream', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'rest-2',
    name: 'Bella Napoli Woodfired Pizza',
    cuisine: 'Italian • Pizza • Pasta',
    rating: 4.9,
    deliveryTime: '25-35 min',
    deliveryFee: '₹39',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    location: { lat: 37.7833, lng: -122.4167 },
    menu: [
      { id: 'item-201', name: 'Margherita D.O.P.', price: 299, description: 'San Marzano tomatoes, fresh buffalo mozzarella, fresh basil, extra virgin olive oil', image: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=400&auto=format&fit=crop&q=80' },
      { id: 'item-202', name: 'Diavola Spicy Pepperoni', price: 349, description: 'Spicy calabrese salami, crushed red chili, mozzarella, rich tomato base', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&auto=format&fit=crop&q=80' },
      { id: 'item-203', name: 'Creamy Truffle Tagliatelle', price: 329, description: 'Fresh egg pasta with wild mushrooms, white truffle cream sauce', image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=400&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'rest-3',
    name: 'Sakura Zen Sushi & Ramen',
    cuisine: 'Japanese • Sushi • Asian',
    rating: 4.9,
    deliveryTime: '30-40 min',
    deliveryFee: '₹49',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
    location: { lat: 37.7694, lng: -122.4467 },
    menu: [
      { id: 'item-301', name: 'Dragon Roll Deluxe', price: 379, description: 'Eel, avocado, cucumber topped with sliced salmon, spicy mayo, unagi sauce', image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400&auto=format&fit=crop&q=80' },
      { id: 'item-302', name: 'Tonkotsu Black Garlic Ramen', price: 349, description: 'Rich 18-hr pork bone broth, chashu pork, nitamago egg, scallions, black garlic oil', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&auto=format&fit=crop&q=80' },
      { id: 'item-303', name: 'Crispy Salmon Gyoza (6 pcs)', price: 179, description: 'Pan-seared Japanese dumplings served with ponzu dipping glaze', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=400&auto=format&fit=crop&q=80' }
    ]
  },
  {
    id: 'rest-4',
    name: 'Verde Green Bowls & Salads',
    cuisine: 'Healthy • Vegan • Organic',
    rating: 4.7,
    deliveryTime: '15-25 min',
    deliveryFee: '₹29',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&auto=format&fit=crop&q=80',
    location: { lat: 37.7600, lng: -122.4140 },
    menu: [
      { id: 'item-401', name: 'Avo-Green Goddess Bowl', price: 269, description: 'Quinoa, Hass avocado, kale, edamame, roasted chickpeas with tahini green goddess dressing', image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80' },
      { id: 'item-402', name: 'Wild Berries Acai Crunch', price: 219, description: 'Organic Amazonian acai topped with chia seeds, banana, strawberries, homemade granola', image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&auto=format&fit=crop&q=80' }
    ]
  }
];

module.exports = { restaurants };
