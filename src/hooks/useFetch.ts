import { useState, useCallback, useEffect } from 'react';

interface UseFetchOptions {
    onError?: (message: string) => void;
    onSuccess?: (message?: string) => void;
    showError?: boolean;
}

/**
 * Custom hook để fetch dữ liệu với loading state
 * Đặt file này ở: src/hooks/useFetch.ts hoặc src/hooks/index.ts
 */
export function useFetch<T>(
    fetchFn: () => Promise<T>,
    options: UseFetchOptions = {}
) {
    const [data, setData] = useState<T | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { onError, onSuccess, showError = true } = options;

    const refetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchFn();
            setData(result);
            onSuccess?.();
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Lỗi không xác định';
            setError(errorMessage);
            if (showError) {
                onError?.(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [fetchFn, onError, onSuccess, showError]);

    useEffect(() => {
        refetch();
    }, []);

    return { data, loading, error, refetch };
}

export function useSubmit<T>(
    submitFn: (data: T) => Promise<void>,
    options: UseFetchOptions = {}
) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { onError, onSuccess, showError = true } = options;

    const submit = useCallback(
        async (data: T) => {
            try {
                setIsSubmitting(true);
                setError(null);
                await submitFn(data);
                onSuccess?.();
                return true;
            } catch (err: any) {
                const errorMessage = err?.response?.data?.message || err?.message || 'Lỗi không xác định';
                setError(errorMessage);
                if (showError) {
                    onError?.(errorMessage);
                }
                return false;
            } finally {
                setIsSubmitting(false);
            }
        },
        [submitFn, onError, onSuccess, showError]
    );

    return { submit, isSubmitting, error };
}

export default { useFetch, useSubmit };