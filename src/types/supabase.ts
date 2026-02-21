export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    role: 'buyer' | 'seller' | 'admin'
                    full_name: string | null
                    avatar_url: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    role?: 'buyer' | 'seller' | 'admin'
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    role?: 'buyer' | 'seller' | 'admin'
                    full_name?: string | null
                    avatar_url?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            properties: {
                Row: {
                    id: string
                    owner_id: string
                    title: string
                    description: string | null
                    price: number
                    area: number
                    location: string
                    city: string
                    type: 'plot' | 'apartment' | 'house'
                    status: 'available' | 'sold' | 'pending'
                    images: string[]
                    features: Json
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    title: string
                    description?: string | null
                    price: number
                    area: number
                    location: string
                    city: string
                    type: 'plot' | 'apartment' | 'house'
                    status?: 'available' | 'sold' | 'pending'
                    images?: string[]
                    features?: Json
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    title?: string
                    description?: string | null
                    price?: number
                    area?: number
                    location?: string
                    city?: string
                    type?: 'plot' | 'apartment' | 'house'
                    status?: 'available' | 'sold' | 'pending'
                    images?: string[]
                    features?: Json
                    created_at?: string
                    updated_at?: string
                }
            }
            leads: {
                Row: {
                    id: string
                    property_id: string | null
                    user_id: string | null
                    visitor_id: string | null
                    name: string
                    email: string | null
                    phone: string
                    message: string | null
                    type: 'callback' | 'site_visit' | 'best_price' | 'whatsapp'
                    status: 'new' | 'contacted' | 'closed'
                    created_at: string
                }
                Insert: {
                    id?: string
                    property_id?: string | null
                    user_id?: string | null
                    visitor_id?: string | null
                    name: string
                    email?: string | null
                    phone: string
                    message?: string | null
                    type: 'callback' | 'site_visit' | 'best_price' | 'whatsapp'
                    status?: 'new' | 'contacted' | 'closed'
                    created_at?: string
                }
                Update: {
                    id?: string
                    property_id?: string | null
                    user_id?: string | null
                    visitor_id?: string | null
                    name?: string
                    email?: string | null
                    phone?: string
                    message?: string | null
                    type?: 'callback' | 'site_visit' | 'best_price' | 'whatsapp'
                    status?: 'new' | 'contacted' | 'closed'
                    created_at?: string
                }
            }
            favorites: {
                Row: {
                    user_id: string
                    property_id: string
                    created_at: string
                }
                Insert: {
                    user_id: string
                    property_id: string
                    created_at?: string
                }
                Update: {
                    user_id?: string
                    property_id?: string
                    created_at?: string
                }
            }
            activity_logs: {
                Row: {
                    id: string
                    user_id: string | null
                    visitor_id: string | null
                    action: string
                    details: Json
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    visitor_id?: string | null
                    action: string
                    details?: Json
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    visitor_id?: string | null
                    action?: string
                    details?: Json
                    created_at?: string
                }
            }
        }
    }
}
