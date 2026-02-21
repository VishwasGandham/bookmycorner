import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../lib/supabase';

export const getVisitorId = () => {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
        visitorId = uuidv4();
        localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
};

export const trackSearch = async (query: string, budget?: string) => {
    const visitorId = getVisitorId();
    try {
        await supabase.from('visitors').upsert({
            visitor_id: visitorId,
            last_activity: new Date().toISOString(),
            city_interest: query || null,
            budget_range: budget || null
        }, { onConflict: 'visitor_id' });

        await supabase.from('activity_logs').insert({
            visitor_id: visitorId,
            action: 'search',
            details: { query, budget }
        });
    } catch (error) {
        console.error('Error tracking search:', error);
    }
};

export const trackClick = async (action: string, details: Record<string, unknown>) => {
    const visitorId = getVisitorId();
    try {
        await supabase.from('activity_logs').insert({
            visitor_id: visitorId,
            action: 'click',
            details: { action, ...details }
        });
    } catch (error) {
        console.error('Error tracking click:', error);
    }
};

const VisitorTracker = () => {
    useEffect(() => {
        const trackVisitor = async () => {
            const visitorId = getVisitorId();
            try {
                await supabase.from('visitors').upsert({
                    visitor_id: visitorId,
                    last_activity: new Date().toISOString(),
                    device: navigator.userAgent,
                }, { onConflict: 'visitor_id' });

                await supabase.from('activity_logs').insert({
                    visitor_id: visitorId,
                    action: 'visit_site',
                    details: {
                        path: window.location.pathname,
                        referrer: document.referrer
                    }
                });

            } catch (error) {
                console.error('Error tracking visitor:', error);
            }
        };

        trackVisitor();
    }, []);

    return null;
};

export default VisitorTracker;
