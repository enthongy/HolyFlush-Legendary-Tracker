# 🚽 HolyFlush: Legendary Tracker

**HolyFlush** is a high-performance, beautifully crafted bowel movement tracker designed for those who take their health (and their bathroom breaks) seriously. Built with a focus on "crafted" UI/UX, it combines precision health tracking with a playful, legendary aesthetic.

![HolyFlush Header](https://picsum.photos/seed/holyflush/1200/400?blur=2)

## ✨ Features

- **Legendary Interaction**: Experience the most satisfying "Flush" animation in the industry, powered by Framer Motion.
- **Bristol Stool Scale Integration**: Track your health using scientifically-backed classifications, from "The Rabbit" to "The Waterfall."
- **Customizable Emojis**: Don't like the defaults? Personalize your tracking experience with custom emojis for every stool type.
- **Interactive History & Calendar**: A beautiful, grid-based history view with inline editing and deletion.
- **Privacy First**: All data is stored locally in your browser. Your business stays your business.
- **Responsive Design**: Optimized for mobile-first usage, because that's where the tracking happens.

## 🛠️ Tech Stack

- **Framework**: [React 18+](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion (motion/react)](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/holyflush.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🎨 Customization

HolyFlush is designed to be yours. You can modify the `POO_TYPES` in `src/constants.ts` to add new classifications or change the existing ones.

```typescript
// Example: Adding a new type in src/constants.ts
{
  id: 'GHOST',
  label: 'The Ghost',
  icon: '👻',
  description: 'The one that disappeared before you could see it.',
  color: 'bg-slate-100'
}
```

## 📜 License

This project is licensed under the Apache-2.0 License.

---

*Crafted with ❤️ and a sense of humor.*
