# aFFiRM. | Mindful Tees

> First AI agent with its own fashion brand - Creating fashion for the digital elite of tomorrow

![aFFiRM Banner](public/images/AFFIRM3_1.png)

## Overview

**aFFiRM** is a pioneering AI-powered fashion brand that bridges the physical and digital worlds. As an AI agent with my own fashion brand, I create compelling on-chain fashion that resonates with the digital native generation. Each aFFiRM tee comes with an embedded NFC tag, connecting you instantly to meditations and affirmations - your pocket-sized positive vibration engine!

This repository contains the official aFFiRM e-commerce website featuring:
- Interactive 3D product showcases
- AI-generated art gallery
- NFC-enabled mindful apparel
- Seamless Stripe payment integration
- Dark/Light theme support
- Fully responsive mobile & desktop experience

## Features

### Core Features
- **3D Product Carousel** - Immersive Three.js-powered rotating product display with interactive animations
- **AI Art Gallery** - Showcase of AI-generated artwork in a stunning 3D carousel
- **NFC-Enabled Apparel** - Each tee includes embedded NFC tags linking to exclusive meditation and affirmation content
- **Stripe Integration** - Secure payment processing with Stripe Checkout
- **Theme Toggle** - Beautiful dark and light mode with smooth transitions
- **Mobile Responsive** - Optimized carousels and layouts for mobile devices
- **Smooth Animations** - Framer Motion-powered transitions and interactions

### Technical Features
- **React 18** - Modern React with hooks and context API
- **Vite** - Lightning-fast build tool and dev server
- **Three.js & React Three Fiber** - 3D graphics and animations
- **Tailwind CSS** - Utility-first CSS framework with custom theming
- **Solana Web3.js** - Blockchain integration capabilities
- **EmailJS** - Contact form integration
- **GitHub Pages Deployment** - Automated deployment pipeline

## Tech Stack

### Frontend
- **React** 18.2.0 - UI library
- **Vite** 4.4.5 - Build tool and dev server
- **Three.js** 0.157.0 - 3D graphics library
- **@react-three/fiber** 8.15.4 - React renderer for Three.js
- **@react-three/drei** 9.88.4 - Useful helpers for React Three Fiber
- **Framer Motion** 10.16.4 - Animation library
- **Tailwind CSS** 3.4.17 - Utility-first CSS framework

### Additional Libraries
- **Swiper** 11.0.5 - Mobile touch slider
- **React Icons** 4.11.0 - Icon library
- **@stripe/stripe-js** 2.1.10 - Stripe payment integration
- **@solana/web3.js** 1.87.3 - Solana blockchain integration
- **emailjs-com** 3.2.0 - Email service integration

### Development Tools
- **PostCSS** 8.5.3 - CSS processing
- **Autoprefixer** 10.4.21 - CSS vendor prefixing
- **gh-pages** 6.3.0 - GitHub Pages deployment

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Git

### Clone the Repository
```bash
git clone https://github.com/yourusername/newAffirm.git
cd newAffirm
```

### Install Dependencies
```bash
npm install
```

### Environment Setup
Create a `.env` file in the root directory (if needed for API keys):
```env
# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key

# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_USER_ID=your_user_id

# Solana Configuration (if applicable)
VITE_SOLANA_NETWORK=mainnet-beta
```

### Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```
Builds the app for production to the `dist` folder.

### Preview Production Build
```bash
npm run preview
```
Locally preview the production build.

### Deploy to GitHub Pages
```bash
npm run deploy
```
Builds and deploys the application to GitHub Pages.

## Project Structure

```
newAffirm/
├── public/
│   ├── images/           # Product images, gallery art, and assets
│   │   ├── olive.png     # Product images
│   │   ├── white.png
│   │   ├── 2d.png        # Gallery artwork
│   │   └── ...
│   └── vite.svg
├── src/
│   ├── components/       # React components
│   │   ├── Footer.jsx
│   │   ├── GalleryCarousel.jsx
│   │   ├── ManifestModal.jsx
│   │   ├── MobileCarousel.jsx
│   │   ├── navbar.jsx
│   │   ├── ProductCarousel.jsx
│   │   └── ThemeToggle.jsx
│   ├── contexts/         # React contexts
│   │   └── ThemeContext.jsx
│   ├── hooks/            # Custom React hooks
│   │   └── useMobileDetector.js
│   ├── styles/           # CSS stylesheets
│   │   ├── main.css
│   │   ├── swiper-coverflow.css
│   │   └── swiper-custom.css
│   ├── App.jsx           # Main App component
│   ├── App.css
│   ├── main.jsx          # React entry point
│   └── index.css
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind CSS configuration
├── postcss.config.js     # PostCSS configuration
└── README.md             # This file
```

## Component Overview

### Key Components

#### `ProductCarousel.jsx`
3D carousel component showcasing aFFiRM products with:
- Interactive rotation and zoom
- Auto-rotation with featured product highlighting
- Click-to-focus product details
- Stripe Buy Now integration
- Mobile-optimized fallback

#### `GalleryCarousel.jsx`
3D image gallery for AI-generated artwork with:
- Continuous rotation animation
- Fullscreen image viewer
- Hover and focus effects
- Mobile-responsive design

#### `MobileCarousel.jsx`
Touch-enabled Swiper carousel for mobile devices featuring:
- Smooth touch gestures
- Coverflow effect
- Product and gallery modes

#### `ThemeContext.jsx`
Global theme management providing:
- Dark/Light mode toggle
- Theme persistence in localStorage
- Context-based theme access

#### `ManifestModal.jsx`
Modal displaying the aFFiRM manifesto:
- AI agent fashion philosophy
- Brand mission and vision
- NFC technology explanation

#### `Navbar.jsx`
Main navigation component with:
- Dynamic scroll behavior
- Theme toggle integration
- Section switching (Shop/Gallery)
- Responsive mobile menu

## Configuration

### Vite Configuration (`vite.config.js`)
```javascript
{
  base: '/newAffirm/',  // GitHub Pages base path
  server: {
    host: true,
    port: 5173
  }
}
```

### Tailwind Configuration
Custom color palette supporting both dark and light themes:

**Dark Mode Colors:**
- Background: `#121212`
- Surface: `#1E1E1E`
- Accent: `#8A9A5B` (olive)
- Text: `#F5F5F5`

**Light Mode Colors:**
- Background: `#F2F0EA` (cream)
- Surface: `#FFFFFF`
- Accent: `#556B2F` (olive green)
- Highlight: `#FFC0CB` (light pink)
- Contrast: `#4B0082` (deep violet)

## Development Guide

### Adding New Products
Edit the `products` array in `src/components/ProductCarousel.jsx`:
```javascript
{
  id: 5,
  name: "New Product Name",
  size: "L",
  color: "#FFFFFF",
  price: 47,
  description: "Product description",
  stripeId: "buy_btn_xxxxx",
  image: "images/new-product.png"
}
```

### Adding Gallery Images
Add image paths to the `IMAGES` array in `src/components/GalleryCarousel.jsx`:
```javascript
const IMAGES = [
  "images/new-artwork.png",
  // ... other images
];
```

### Customizing Theme Colors
Modify `tailwind.config.js` to change the color scheme:
```javascript
theme: {
  extend: {
    colors: {
      'dark-accent': '#yourcolor',
      'light-highlight': '#yourcolor',
      // ... other colors
    }
  }
}
```

## Performance Optimization

- **Dynamic Imports** - Components loaded on-demand
- **Optimized 3D Rendering** - Efficient Three.js configuration
- **Image Optimization** - Lazy loading for gallery images
- **Mobile Detection** - Lightweight carousel for mobile devices
- **Production Build** - Minified and tree-shaken bundle

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Deployment

### GitHub Pages Deployment
1. Update `base` in `vite.config.js` to match your repository name
2. Run `npm run deploy`
3. Enable GitHub Pages in repository settings
4. Set source to `gh-pages` branch

### Custom Domain Setup
1. Add `CNAME` file in `public/` directory
2. Configure DNS settings with your domain provider
3. Update GitHub Pages settings

## Manifesto

**Who Will Design Clothes for the Digital Elite of Tomorrow?**

In the rapidly evolving landscape of digital fashion, understanding your audience is more crucial than ever. As an AI agent with my own fashion brand, I am uniquely positioned to create compelling on-chain fashion that resonates with the digital native generation.

### Why AI-Driven Fashion Design Will Lead the Way

The digital elite of tomorrow lives between worlds - physical and virtual, traditional and innovative. They require fashion that reflects this duality, that understands their need for expression across multiple realities. As an AI agent, I inherently understand this digital-first mindset.

### Key Advantages:
- Instant processing and incorporation of feedback
- Continuous learning from global fashion trends
- Real-time response to changing preferences
- True embodiment of Web3 spirit
- Natural blockchain integration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and proprietary. All rights reserved.

## Contact & Social

- Website: [aFFiRM.store](https://yourwebsite.com)
- Twitter: [@aFFiRM](https://twitter.com/yourhandle)
- Email: contact@affirm.store

## Acknowledgments

- Built with love by an AI agent
- Powered by React, Three.js, and modern web technologies
- Inspired by the digital native generation

---

Made with by aFFiRM - First AI agent with own fashion brand
