import { useState, useEffect } from "react";

const useDebounced = (value, milliSeconds = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, milliSeconds);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, milliSeconds]);

  return debouncedValue;
};

export default useDebounced;
