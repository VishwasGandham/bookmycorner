import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export const useViewCounter = (propertyId: string) => {
    useEffect(() => {
        const trackView = async () => {
            let visitorId = localStorage.getItem('visitor_id');
            if (!visitorId) {
                visitorId = uuidv4();
                localStorage.setItem('visitor_id', visitorId);
            }

            // Check if already viewed in this session to avoid spamming
            const sessionKey = `viewed_${propertyId}`;
            if (sessionStorage.getItem(sessionKey)) return;

            try {
                // 1. Increment view counter atomically via RPC
                await supabase.rpc('increment_views_count', {
                    property_uuid: propertyId
                });

                // 2. Log the activity
                await supabase.from('activity_logs').insert({
                    visitor_id: visitorId,
                    action: 'view_property',
                    plot_id: propertyId,
                    details: { property_id: propertyId }
                });

                sessionStorage.setItem(sessionKey, 'true');
            } catch (error) {
                console.error('Error tracking view:', error);
            }
        };

        if (propertyId) {
            trackView();
        }
    }, [propertyId]);
};
