# PNEUMOIA Frontend 2026

A modern React + Vite frontend application for PNEUMOIA with TypeScript, Tailwind CSS, and advanced build optimizations.

## Features

- ⚡ **Vite** - Lightning-fast build tool with Hot Module Replacement (HMR)
- ⚛️ **React 19** - Latest React with Suspense and hooks
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🎭 **Framer Motion** - Smooth animations
- 📊 **Recharts** - Beautiful data visualization
- 📱 **Lucide React** - Beautiful icon library
- 🗂️ **React Router v7** - Modern client-side routing
- 📄 **XLSX** - Spreadsheet data handling
- 🔍 **ESLint** - Code quality and linting
- 🎯 **Prettier** - Code formatting
- 🧪 **Vitest** - Unit testing framework
- 📋 **TypeScript** - Type safety support (optional)

## Quick Start

### Prerequisites

- Node.js 18+ or npm 9+

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server with HMR
npm run dev

# Lint code with auto-fix
npm run lint

# Format code with Prettier
npm run format

# Type check (when using TypeScript)
npm run type-check
```

### Testing

```bash
# Run tests
npm run test

# Generate coverage report
npm run test:coverage
```

### Production Build

```bash
# Build for production with optimizations
npm build

# Preview production build locally
npm run preview
```

## Project Structure

```
PNEUMOIA-Frontend2026/
├── public/                 # Static assets
├── src/                    # Source code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── styles/           # Global styles
│   ├── App.jsx           # Root component
│   └── main.jsx          # Entry point
├── index.html            # HTML entry point
├── vite.config.js        # Vite configuration
├── vitest.config.js      # Vitest configuration
├── tsconfig.json         # TypeScript configuration
├── eslint.config.js      # ESLint configuration
├── .prettierrc.json      # Prettier configuration
└── package.json          # Dependencies and scripts
```

## Build Optimizations

- ✅ **Code Splitting** - Vendor, charts, and animation bundles separated
- ✅ **Minification** - Terser with console removal in production
- ✅ **Tree Shaking** - Unused code elimination
- ✅ **Path Aliases** - Import using `@/` for src directory
- ✅ **CSS Optimization** - Tailwind CSS purging

## Code Quality Tools

### ESLint Rules

- React best practices and hooks validation
- Import sorting and organization
- No unused variables or debuggers
- Strict equality checks
- Accessibility rules

### Prettier Formatting

- 2-space indentation
- Single quotes for strings
- Trailing commas (ES5 compatible)
- 100-character line width
- LF line endings

## Configuration Files

- `vite.config.js` - Build tool configuration
- `vitest.config.js` - Testing framework setup
- `tsconfig.json` - TypeScript compiler options
- `eslint.config.js` - Code linting rules
- `.prettierrc.json` - Code formatting rules
- `tailwind.config.js` - Tailwind CSS customization

## Performance Tips

1. **Lazy Load Components** - Use React.lazy() for route-based code splitting
2. **Memoize Components** - Use React.memo() for expensive renders
3. **Optimize Images** - Use modern formats and compress where possible
4. **Monitor Bundle Size** - Check build output for bundle analysis
5. **Use Custom Hooks** - Extract reusable logic to custom hooks

## Environment Variables

Create a `.env.local` file for local configuration:

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=PNEUMOIA Frontend
```

Access in code:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

## Contributing

1. Create a feature branch
2. Follow ESLint and Prettier rules
3. Write tests for new features
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
