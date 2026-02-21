import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CookieConsent from '../features/CookieConsent';
import VisitorTracker from '../features/VisitorTracker';

const Layout = () => {
    return (
        <div className="flex min-h-screen flex-col bg-background font-sans text-foreground">
            <VisitorTracker />
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <CookieConsent />
        </div>
    );
};

export default Layout;
