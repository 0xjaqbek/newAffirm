// src/data/seedOrders.js
// Demo orders — loaded on first visit (or when affirm_orders is empty).
// Uses card IDs + images from seedCards so both lists stay in sync.

const d = (daysAgo) => Date.now() - daysAgo * 24 * 60 * 60 * 1000;

export const SEED_ORDERS = [
  {
    id: 'order-001',
    userId: 'customer',
    cardId: 'base1-4',
    cardName: 'Charizard',
    cardImage: 'https://images.pokemontcg.io/base1/4_hires.png',
    quantity: 1,
    price: 450,
    status: 'completed',
    notes: 'Paid via bank transfer. Holographic, shadowless print.',
    createdAt: d(21),
  },
  {
    id: 'order-002',
    userId: 'customer',
    cardId: 'base1-16',
    cardName: 'Zapdos',
    cardImage: 'https://images.pokemontcg.io/base1/16_hires.png',
    quantity: 1,
    price: 75,
    status: 'completed',
    notes: 'Gift wrap requested — sent with top loader.',
    createdAt: d(18),
  },
  {
    id: 'order-003',
    userId: 'customer',
    cardId: 'base1-2',
    cardName: 'Blastoise',
    cardImage: 'https://images.pokemontcg.io/base1/2_hires.png',
    quantity: 1,
    price: 180,
    status: 'shipped',
    notes: 'Tracked shipping — AU Post Express.',
    createdAt: d(7),
  },
  {
    id: 'order-004',
    userId: 'customer',
    cardId: 'base1-10',
    cardName: 'Mewtwo',
    cardImage: 'https://images.pokemontcg.io/base1/10_hires.png',
    quantity: 1,
    price: 95,
    status: 'confirmed',
    notes: '',
    createdAt: d(3),
  },
  {
    id: 'order-005',
    userId: 'customer',
    cardId: 'base1-58',
    cardName: 'Pikachu',
    cardImage: 'https://images.pokemontcg.io/base1/58_hires.png',
    quantity: 3,
    price: 35,
    status: 'pending',
    notes: '3 copies — wants extras for trading.',
    createdAt: d(1),
  },
];
