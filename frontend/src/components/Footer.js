// frontend/src/components/Footer.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa';
import axios from 'axios';

const Footer = () => {
  const [year] = useState(new Date().getFullYear());
  const [links, setLinks] = useState([
    { name: 'Home', to: '/' },
    { name: 'About', to: '/about' },
    { name: 'Contact', to: '/contact' },
    { name: 'Privacy Policy', to: '/privacy-policy' },
  ]);

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get('http://localhost:5000/api/v1/quick-links', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(data)) {
          setLinks(data);
        }
      } catch (err) {
        console.warn('Could not load footer links:', err.message);
      }
    };
    fetchLinks();
  }, []);

  return (
    <footer className="bg-dark text-white mt-3 py-2">
      <div className="container text-center text-md-start">
        <div className="row">
          {/* Brand / Description */}
          <div className="col-md-4 mb-2">
            <h6 className="text-uppercase mb-2">Learning Dashboard</h6>
            <p className="small mb-2">
              Empowering learners and educators with a streamlined platform for education, collaboration, and growth.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-2">
            <h6 className="text-uppercase mb-2">Quick Links</h6>
            <ul className="list-unstyled mb-0">
              {links.map((link, index) => (
                <li key={index} className="mb-1">
                  {link.to ? (
                    <Link to={link.to} className="text-white text-decoration-none small">
                      {link.name}
                    </Link>
                  ) : (
                    <a href={link.url} className="text-white text-decoration-none small">
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div className="col-md-4 mb-2">
            <h6 className="text-uppercase mb-2">Connect With Us</h6>
            <div>
              <a href="https://facebook.com" className="text-white me-3" target="_blank" rel="noopener noreferrer">
                <FaFacebook size={18} />
              </a>
              <a href="https://twitter.com" className="text-white me-3" target="_blank" rel="noopener noreferrer">
                <FaTwitter size={18} />
              </a>
              <a href="https://linkedin.com" className="text-white me-3" target="_blank" rel="noopener noreferrer">
                <FaLinkedin size={18} />
              </a>
              <a href="https://github.com" className="text-white" target="_blank" rel="noopener noreferrer">
                <FaGithub size={18} />
              </a>
            </div>
          </div>
        </div>

        <hr className="bg-white my-2" />

        <div className="text-center">
          <small>© {year} Learning Dashboard. All rights reserved.</small>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
