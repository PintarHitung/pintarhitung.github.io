import { useCallback, useState } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        // Safe merge for objects
        if (
          typeof initialValue === 'object' &&
          !Array.isArray(initialValue) &&
          initialValue !== null
        ) {
          return { ...initialValue, ...parsed };
        }
        return parsed;
      }
      return initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        setStoredValue((curr) => {
          const toStore = value instanceof Function ? value(curr) : value;
          window.localStorage.setItem(key, JSON.stringify(toStore));
          return toStore;
        });
      } catch (e) {
        console.error('LocalStorage write error:', e);
      }
    },
    [key]
  );

  return [storedValue, setValue];
};
