"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi(apiFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const executedRef = useRef(false);
  const timeoutRef = useRef(null);

  const executeApi = useCallback(async () => {
    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce API calls
    timeoutRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction();
        setData(result);
        executedRef.current = true;
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    }, 100); // 100ms debounce
  }, dependencies); // Remove apiFunction from dependencies to prevent infinite calls

  const refetch = useCallback(() => {
    executedRef.current = false;
    executeApi();
  }, [executeApi]);

  useEffect(() => {
    if (!executedRef.current) {
      executeApi();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [executeApi]);

  return {
    data,
    loading,
    error,
    refetch
  };
}