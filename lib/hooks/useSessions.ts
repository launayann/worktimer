'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session, NewSession } from '@/types/database';

export function useSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .order('start_time', { ascending: false });

      if (fetchError) throw fetchError;
      setSessions(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des sessions');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active session (session without end_time)
  const fetchActiveSession = async (): Promise<Session | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .is('end_time', null)
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      return data || null;
    } catch (err) {
      console.error('Erreur lors de la récupération de la session active:', err);
      return null;
    }
  };

  // Create a new session (start timer)
  const createSession = async (categoryId: string) => {
    try {
      const newSession: NewSession = {
        category_id: categoryId,
        start_time: new Date().toISOString(),
        pause_duration: 0,
      };

      // @ts-ignore - Supabase type inference issue
      const { data, error: insertError } = await supabase
        .from('sessions')
        .insert(newSession)
        .select()
        .single();

      if (insertError) throw insertError;
      if (data) {
        setSessions((prev) => [data, ...prev]);
      }
      return { data, error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la création de la session';
      return { data: null, error: errorMsg };
    }
  };

  // Update a session
  const updateSession = async (id: string, updates: Partial<NewSession>) => {
    try {
      // @ts-ignore - Supabase type inference issue
      const { data, error: updateError } = await supabase
        .from('sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      if (data) {
        setSessions((prev) =>
          prev.map((session) => (session.id === id ? data : session))
        );
      }
      return { data, error: null };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la session';
      return { data: null, error: errorMsg };
    }
  };

  // End a session (stop timer)
  const endSession = async (id: string, pauseDuration: number = 0) => {
    return updateSession(id, {
      end_time: new Date().toISOString(),
      pause_duration: pauseDuration,
    });
  };

  // Get sessions for a specific date range
  const getSessionsByDateRange = async (startDate: Date, endDate: Date): Promise<Session[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('sessions')
        .select('*')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true });

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      console.error('Erreur lors de la récupération des sessions par plage de dates:', err);
      return [];
    }
  };

  useEffect(() => {
    fetchSessions();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('sessions-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    sessions,
    loading,
    error,
    createSession,
    updateSession,
    endSession,
    fetchActiveSession,
    getSessionsByDateRange,
    refetch: fetchSessions,
  };
}
