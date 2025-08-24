
import { useEffect, useRef } from 'react';

function useAutosave<T>(key: string, data: T, delay = 2000) {
  const timeoutId = useRef<number | null>(null);

  useEffect(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    timeoutId.current = window.setTimeout(() => {
      try {
        const serializedData = JSON.stringify(data);
        localStorage.setItem(key, serializedData);
      } catch (error) {
        console.error(`Failed to save data to localStorage for key "${key}":`, error);
      }
    }, delay);

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
    };
  }, [key, data, delay]);
}

export default useAutosave;
