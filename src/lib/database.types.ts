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
                    created_at: string
                    email: string
                    full_name: string | null
                    role: 'buyer' | 'seller' | 'admin'
                    phone: string | null
                }
                Insert: {
                    id: string
                    created_at?: string
                    email?: string
                    full_name?: string | null
                    role?: 'buyer' | 'seller' | 'admin'
                    phone?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    email?: string
                    full_name?: string | null
                    role?: 'buyer' | 'seller' | 'admin'
                    phone?: string | null
                }
                Relationships: []
            }
            properties: {
                Row: {
                    id: string
                    created_at: string
                    owner_id: string
                    title: string
                    description: string | null
                    price: number
                    area: number
                    location: string
                    city: string
                    landmark: string | null
                    latitude: number | null
                    longitude: number | null
                    length: number | null
                    width: number | null
                    facing: string | null
                    corner_plot: boolean
                    road_width_front: number | null
                    road_width_back: number | null
                    layout_approval_status: string
                    registration_available: boolean
                    documents_available: boolean
                    price_per_sqft: number | null
                    negotiable: boolean
                    views_count: number
                    leads_count: number
                    is_featured: boolean
                    is_verified: boolean
                    type: 'plot' | 'house' | 'apartment'
                    status: 'available' | 'sold' | 'pending' | 'rejected'
                    images: string[]
                    features: Json
                }
                Insert: {
                    id?: string
                    created_at?: string
                    owner_id: string
                    title: string
                    description?: string | null
                    price: number
                    area: number
                    location: string
                    city: string
                    landmark?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    length?: number | null
                    width?: number | null
                    facing?: string | null
                    corner_plot?: boolean
                    road_width_front?: number | null
                    road_width_back?: number | null
                    layout_approval_status?: string
                    registration_available?: boolean
                    documents_available?: boolean
                    negotiable?: boolean
                    is_featured?: boolean
                    is_verified?: boolean
                    type: 'plot' | 'house' | 'apartment'
                    status?: 'available' | 'sold' | 'pending' | 'rejected'
                    images?: string[]
                    features?: Json
                }
                Update: {
                    id?: string
                    created_at?: string
                    owner_id?: string
                    title?: string
                    description?: string | null
                    price?: number
                    area?: number
                    location?: string
                    city?: string
                    landmark?: string | null
                    latitude?: number | null
                    longitude?: number | null
                    length?: number | null
                    width?: number | null
                    facing?: string | null
                    corner_plot?: boolean
                    road_width_front?: number | null
                    road_width_back?: number | null
                    layout_approval_status?: string
                    registration_available?: boolean
                    documents_available?: boolean
                    negotiable?: boolean
                    views_count?: number
                    leads_count?: number
                    type?: 'plot' | 'house' | 'apartment'
                    status?: 'available' | 'sold' | 'pending' | 'rejected'
                    images?: string[]
                    features?: Json
                    is_verified?: boolean
                    is_featured?: boolean
                }
                Relationships: [
                    {
                        foreignKeyName: 'properties_owner_id_fkey'
                        columns: ['owner_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    }
                ]
            }
            visitors: {
                Row: {
                    visitor_id: string
                    ip: string | null
                    device: string | null
                    last_activity: string
                    city_interest: string | null
                    budget_range: string | null
                    created_at: string
                }
                Insert: {
                    visitor_id: string
                    ip?: string | null
                    device?: string | null
                    last_activity?: string
                    city_interest?: string | null
                    budget_range?: string | null
                    created_at?: string
                }
                Update: {
                    visitor_id?: string
                    ip?: string | null
                    device?: string | null
                    last_activity?: string
                    city_interest?: string | null
                    budget_range?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            leads: {
                Row: {
                    id: string
                    created_at: string
                    property_id: string
                    user_id: string | null
                    visitor_id: string | null
                    name: string
                    phone: string
                    email: string | null
                    message: string | null
                    type: 'callback' | 'site_visit' | 'best_price' | 'whatsapp'
                    status: 'new' | 'contacted' | 'closed'
                }
                Insert: {
                    id?: string
                    created_at?: string
                    property_id: string
                    user_id?: string | null
                    visitor_id?: string | null
                    name: string
                    phone: string
                    email?: string | null
                    message?: string | null
                    type: 'callback' | 'site_visit' | 'best_price' | 'whatsapp'
                    status?: 'new' | 'contacted' | 'closed'
                }
                Update: {
                    id?: string
                    created_at?: string
                    property_id?: string
                    user_id?: string | null
                    visitor_id?: string | null
                    name?: string
                    phone?: string
                    email?: string | null
                    message?: string | null
                    type?: 'callback' | 'site_visit' | 'best_price' | 'whatsapp'
                    status?: 'new' | 'contacted' | 'closed'
                }
                Relationships: [
                    {
                        foreignKeyName: 'leads_property_id_fkey'
                        columns: ['property_id']
                        referencedRelation: 'properties'
                        referencedColumns: ['id']
                    }
                ]
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
                Relationships: [
                    {
                        foreignKeyName: 'favorites_user_id_fkey'
                        columns: ['user_id']
                        referencedRelation: 'profiles'
                        referencedColumns: ['id']
                    },
                    {
                        foreignKeyName: 'favorites_property_id_fkey'
                        columns: ['property_id']
                        referencedRelation: 'properties'
                        referencedColumns: ['id']
                    }
                ]
            }
            activity_logs: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string | null
                    visitor_id: string | null
                    action: string
                    details: Json
                    plot_id: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id?: string | null
                    visitor_id?: string | null
                    action: string
                    details?: Json
                    plot_id?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string | null
                    visitor_id?: string | null
                    action?: string
                    details?: Json
                    plot_id?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_popular_areas: {
                Args: Record<string, never>
                Returns: {
                    area: string
                    count: number
                }[]
            }
            increment_views_count: {
                Args: { property_uuid: string }
                Returns: undefined
            }
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
