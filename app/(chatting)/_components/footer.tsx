import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-between">
          {/* Logo and Description */}
          <div className="w-full md:w-1/3 mb-8 md:mb-0">
            <img className="h-20 w-40 rounded-full mb-4" src="/logo.png" alt="MiningNiti Logo" />
            <p className="text-gray-400">
              MiningNiti is dedicated to providing 24/7 support for all your mining compliance needs.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="w-full md:w-1/3 mb-8 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul>
              <li className="mb-2"><a href="/" className="hover:underline focus:outline-none focus:ring-2 focus:ring-gray-500">Home</a></li>
              <li className="mb-2"><a href="/about" className="hover:underline focus:outline-none focus:ring-2 focus:ring-gray-500">About Us</a></li>
              <li className="mb-2"><a href="/services" className="hover:underline focus:outline-none focus:ring-2 focus:ring-gray-500">Services</a></li>
              <li className="mb-2"><a href="/contact" className="hover:underline focus:outline-none focus:ring-2 focus:ring-gray-500">Contact Us</a></li>
              <li className="mb-2"><a href="/chatting" className="hover:underline focus:outline-none focus:ring-2 focus:ring-gray-500">Get Started</a></li>
            </ul>
          </div>

          {/* Social Media Links */}
          <div className="w-full md:w-1/3 mb-8 md:mb-0">
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <img className="h-8 w-8" src="/icons/facebook.svg" alt="Facebook" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <img className="h-8 w-8" src="/icons/twitter.svg" alt="Twitter" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                <img className="h-8 w-8" src="/icons/linkedin.svg" alt="LinkedIn" />
              </a>
              <a href="https://www.instagram.com/iammilansoni/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <img className="h-8 w-8" src="/icons/instagram.svg" alt="Instagram" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-10 border-t border-gray-700 pt-6 text-center">
          <p className="text-gray-400">&copy; 2024 MiningNiti. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
