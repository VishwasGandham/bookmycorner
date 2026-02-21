import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button'; // Fixed path
import { X } from 'lucide-react';

const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookie-consent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-4 shadow-lg md:p-6">
            <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold">We use cookies</h3>
                    <p className="text-sm text-muted-foreground">
                        We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleDecline}>Decline</Button>
                    <Button onClick={handleAccept}>Accept All</Button>
                    <button onClick={() => setIsVisible(false)} className="md:hidden">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsent;
