import React from 'react';
import { Mail, Phone, MapPin, Activity } from 'lucide-react';
import logo from '../../assets/images/logo.png';

/**
 * Footer avec les liens de navigation et les informations de contact
 */
const Footer = () => {
  const productLinks = ['Accueil', 'À propos', 'Fonctionnalités', 'Cas clinique'];
  const legalLinks = ['Mentions légales', 'CGU', 'Cookies'];

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src={logo} 
                alt="PneumoDiag" 
                className="w-30 h-30 items-center overflow-hidden object-contain"
              />
            </div>
            <p className="text-sm">
              Intelligence artificielle au service du diagnostic pulmonaire.
            </p>
          </div>

          {/* Produit */}
          <div>
            <h3 className="font-semibold text-white mb-4">Produit</h3>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Légal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm hover:text-blue-400 transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4" />
                <span>Contact@hpa.com</span>
              </li>
              <li className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4" />
                <span>077-545-45-54</span>
              </li>
              <li className="flex items-center space-x-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>Douala, Cameroun</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 PneumoIA. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;