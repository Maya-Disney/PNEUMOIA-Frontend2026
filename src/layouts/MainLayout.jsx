// src/layouts/MainLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
// import Footer from '../components/layout/Footer';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--t1)] transition-colors duration-300">
      <Navbar />
      <main>
        <Outlet />
      </main>
      {/* <Footer /> */}
    </div>
  );
}