# Referral Hub

A Next.js application for managing patient referrals in a medical ministry setting.

## Project Setup

This project is initialized with:
- **Next.js 16** with TypeScript
- **ShadCN UI** components with medical-friendly theme
- **Tailwind CSS** with custom medical color palette (calming blues/greens)
- **ESLint** for code linting
- **Prettier** for code formatting
- **Accessibility-first design** with high-contrast text and proper touch targets

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Design System

### Medical-Friendly Theme
The application uses a carefully designed color palette optimized for medical environments:
- **Primary Colors**: Calming teal-blue for trust and professionalism
- **Secondary Colors**: Soft greens for positive actions
- **High Contrast**: WCAG AA compliant text for readability
- **Touch Targets**: Minimum 44x44px for mobile accessibility

### Typography
- Font: Geist Sans (optimized by Next.js)
- Base size: 16px (prevents iOS zoom)
- Line height: 1.6 for readability

## Project Structure

See [docs/FOLDER_STRUCTURE.md](./docs/FOLDER_STRUCTURE.md) for detailed folder structure conventions.

Key directories:
- `src/app/` - Next.js App Router pages and layouts
- `src/components/` - React components (UI, forms, features)
- `src/lib/` - Utility functions and configurations
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions
- `docs/` - Project documentation and wireframes

## UX Wireframes

Wireframes for the five critical screens are available in `docs/wireframes/`:
1. [Login Screen](./docs/wireframes/01-login.md)
2. [Referral Form](./docs/wireframes/02-referral-form.md)
3. [Triage Board](./docs/wireframes/03-triage-board.md)
4. [Liaison Dashboard](./docs/wireframes/04-liaison-dashboard.md)
5. [Ministry Analytics](./docs/wireframes/05-ministry-analytics.md)

## Code Quality

### Linting
ESLint is configured with Next.js recommended rules. Run `npm run lint` to check for issues.

### Formatting
Prettier is configured for consistent code formatting. Run `npm run format` to format all files.

### Editor Configuration
`.editorconfig` is included for consistent formatting across different editors.

## Technologies

- [Next.js](https://nextjs.org) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [ShadCN UI](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Lucide React](https://lucide.dev/) - Icon library

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
