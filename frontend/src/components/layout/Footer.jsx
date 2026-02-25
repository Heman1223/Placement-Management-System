import React from 'react';
import { Mail, MapPin, Phone, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="global-footer">
            <div className="footer-container">
                <div className="footer-main">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <img src="/logo.jpeg" alt="Avani Enterprises Logo" />
                            <div className="footer-logo-text">
                                <h3>AVANI</h3>
                                <h3>ENTERPRISES</h3>
                            </div>
                        </div>
                        <p className="footer-tagline">
                            Empowering sales teams with trust & technology.
                            Simplifying Sales, One Deal at a Time.
                        </p>
                        <div className="footer-contact">
                            <div className="contact-item">
                                <MapPin size={18} />
                                <span>Tower B, 3rd Floor, Unitech Cyber Park, Sector 39, Gurugram, Haryana 122002</span>
                            </div>
                        </div>
                        <div className="footer-social">
                            <a href="#"><Instagram size={20} /></a>
                            <a href="#"><Facebook size={20} /></a>
                            <a href="#"><Twitter size={20} /></a>
                            <a href="#"><Linkedin size={20} /></a>
                            <a href="#"><Mail size={20} /></a>
                        </div>
                    </div>

                    <div className="footer-links">
                        <h4>Sales Portal</h4>
                        <div className="footer-hr-line"></div>
                        <h5>Key Features</h5>
                        <ul>
                            <li>• Sales & Leads</li>
                            <li>• Commission Tracking</li>
                            <li>• Commission Withdrawal</li>
                            <li>• Target Monitoring</li>
                        </ul>
                    </div>

                    <div className="footer-links footer-projects">
                        <h4>Other Projects</h4>
                        <div className="footer-hr-line"></div>
                        <ul className="external-links">
                            <li>• <a href="https://Hrportal.avanienterprises.in" target="_blank" rel="noopener noreferrer">HR Portal</a></li>
                            <li>• <a href="https://Projectmanagement.avanienterprises.in" target="_blank" rel="noopener noreferrer">Project & Leads Management system</a></li>
                            <li>• <a href="https://placement-management-system-eight.vercel.app/login" target="_blank" rel="noopener noreferrer">Placement Management System</a></li>
                            <li>• <a href="https://placement-management-system-six.vercel.app" target="_blank" rel="noopener noreferrer">College students management with placement agency</a></li>
                            <li>• <a href="https://shoes-ecommerce-iota.vercel.app" target="_blank" rel="noopener noreferrer">Customised Ecommerce Solutions</a></li>
                        </ul>
                    </div>

                    <div className="footer-map">
                        <h4>Visit Us</h4>
                        <div className="footer-hr-line"></div>
                        <div className="map-wrapper">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3509.013444983088!2d77.0543633150777!3d28.433946282496!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390d195c898c6d3f%3A0xe37852c00d436c64!2sUnitech%20Cyber%20Park!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                                width="100%"
                                height="150"
                                style={{ border: 0, borderRadius: '12px' }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2025 Avani Sales CRM. All rights reserved. | <a href="#">Privacy Policy</a> | Made with <span className="heart">❤</span> by Heman</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
