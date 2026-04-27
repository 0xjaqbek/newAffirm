// src/data/seedCards.js
// Demo inventory — loaded on first visit (or when affirm_cards is empty).
// All images use base1 (Base Set) _hires.png format — confirmed working on pokemontcg.io CDN.
// Covers all six TCG types and all four rarities for design showcase purposes.

const now = Date.now();

export const SEED_CARDS = [
  // ── Rare Holo ──────────────────────────────────────────────────────────────
  {
    id: 'base1-4',
    name: 'Charizard',
    image: 'https://images.pokemontcg.io/base1/4_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Rare Holo',
    types: ['Fire'], price: 450, condition: 'NM', stock: 1, addedAt: now,
  },
  {
    id: 'base1-2',
    name: 'Blastoise',
    image: 'https://images.pokemontcg.io/base1/2_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Rare Holo',
    types: ['Water'], price: 180, condition: 'LP', stock: 2, addedAt: now,
  },
  {
    id: 'base1-15',
    name: 'Venusaur',
    image: 'https://images.pokemontcg.io/base1/15_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Rare Holo',
    types: ['Grass'], price: 120, condition: 'NM', stock: 1, addedAt: now,
  },
  {
    id: 'base1-10',
    name: 'Mewtwo',
    image: 'https://images.pokemontcg.io/base1/10_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Rare Holo',
    types: ['Psychic'], price: 95, condition: 'LP', stock: 1, addedAt: now,
  },
  {
    id: 'base1-16',
    name: 'Zapdos',
    image: 'https://images.pokemontcg.io/base1/16_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Rare Holo',
    types: ['Lightning'], price: 75, condition: 'NM', stock: 2, addedAt: now,
  },
  {
    id: 'base1-7',
    name: 'Hitmonchan',
    image: 'https://images.pokemontcg.io/base1/7_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Rare Holo',
    types: ['Fighting'], price: 70, condition: 'NM', stock: 2, addedAt: now,
  },
  {
    id: 'base1-6',
    name: 'Gyarados',
    image: 'https://images.pokemontcg.io/base1/6_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Rare Holo',
    types: ['Water'], price: 65, condition: 'LP', stock: 1, addedAt: now,
  },
  {
    id: 'base1-14',
    name: 'Raichu',
    image: 'https://images.pokemontcg.io/base1/14_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Rare Holo',
    types: ['Lightning'], price: 60, condition: 'NM', stock: 2, addedAt: now,
  },
  {
    id: 'base1-12',
    name: 'Ninetales',
    image: 'https://images.pokemontcg.io/base1/12_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Rare Holo',
    types: ['Fire'], price: 55, condition: 'MP', stock: 2, addedAt: now,
  },
  {
    id: 'base1-9',
    name: 'Magneton',
    image: 'https://images.pokemontcg.io/base1/9_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Rare Holo',
    types: ['Lightning'], price: 45, condition: 'LP', stock: 3, addedAt: now,
  },
  // ── Rare (non-holo) ────────────────────────────────────────────────────────
  {
    id: 'base1-19',
    name: 'Electabuzz',
    image: 'https://images.pokemontcg.io/base1/19_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Rare',
    types: ['Lightning'], price: 25, condition: 'NM', stock: 4, addedAt: now,
  },
  {
    id: 'base1-17',
    name: 'Beedrill',
    image: 'https://images.pokemontcg.io/base1/17_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Rare',
    types: ['Grass'], price: 18, condition: 'LP', stock: 3, addedAt: now,
  },
  // ── Uncommon ───────────────────────────────────────────────────────────────
  {
    id: 'base1-42',
    name: 'Wartortle',
    image: 'https://images.pokemontcg.io/base1/42_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Uncommon',
    types: ['Water'], price: 14, condition: 'NM', stock: 5, addedAt: now,
  },
  {
    id: 'base1-24',
    name: 'Arcanine',
    image: 'https://images.pokemontcg.io/base1/24_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Uncommon',
    types: ['Fire'], price: 10, condition: 'NM', stock: 6, addedAt: now,
  },
  // ── Common ─────────────────────────────────────────────────────────────────
  {
    id: 'base1-58',
    name: 'Pikachu',
    image: 'https://images.pokemontcg.io/base1/58_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Common',
    types: ['Lightning'], price: 35, condition: 'NM', stock: 5, addedAt: now,
  },
  {
    id: 'base1-46',
    name: 'Charmander',
    image: 'https://images.pokemontcg.io/base1/46_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Common',
    types: ['Fire'], price: 15, condition: 'NM', stock: 8, addedAt: now,
  },
  {
    id: 'base1-63',
    name: 'Squirtle',
    image: 'https://images.pokemontcg.io/base1/63_hires.png',
    set: 'Base Set', series: 'Base', rarity: 'Common',
    types: ['Water'], price: 12, condition: 'NM', stock: 10, addedAt: now,
  },
];
