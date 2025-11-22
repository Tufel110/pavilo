import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Business type enum matching the database
export type BusinessType = 'shoe_shop' | 'mini_dmart' | 'anaj_vyapari' | null;

// User profile from the database
export interface UserProfile {
    id: string;
    business_type: BusinessType;
    business_name?: string;
    phone?: string;
    email?: string;
    preferred_language?: string;
    created_at?: string;
    updated_at?: string;
}

type AuthContextType = {
    user: User | null;
    profile: UserProfile | null;
    businessType: BusinessType;
    loading: boolean;
    error: string | null;
    refreshProfile: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError);
                setError(profileError.message);
                return null;
            }

            return data as UserProfile;
        } catch (err) {
            console.error('Unexpected error fetching profile:', err);
            setError('Failed to fetch user profile');
            return null;
        }
    };

    const refreshProfile = async () => {
        if (!user) return;

        const profileData = await fetchProfile(user.id);
        if (profileData) {
            setProfile(profileData);
            setError(null);
        }
    };

    useEffect(() => {
        // Get initial session
        const initializeAuth = async () => {
            try {
                setLoading(true);
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                    const profileData = await fetchProfile(session.user.id);
                    setProfile(profileData);
                }
            } catch (err) {
                console.error('Error initializing auth:', err);
                setError('Failed to initialize authentication');
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event);

                if (session?.user) {
                    setUser(session.user);
                    const profileData = await fetchProfile(session.user.id);
                    setProfile(profileData);
                } else {
                    setUser(null);
                    setProfile(null);
                }

                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setProfile(null);
            setError(null);
        } catch (err) {
            console.error('Error signing out:', err);
            setError('Failed to sign out');
        }
    };

    const businessType = profile?.business_type || null;

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                businessType,
                loading,
                error,
                refreshProfile,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
