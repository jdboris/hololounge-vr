import { useCallback, useEffect, useRef, useState } from "react";

const useTimer = (milliSeconds) => {
  const [isTimeUp, setIsTimeUp] = useState(true);
  const timeoutIdRef = useRef(null);

  const restartTimer = useCallback(() => {
    setIsTimeUp(false);

    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }

    const id = setTimeout(() => {
      setIsTimeUp(true);
    }, milliSeconds);
    timeoutIdRef.current = id;
  }, [timeoutIdRef.current]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    };
  }, [timeoutIdRef.current]);

  return [isTimeUp, restartTimer];
};

export default useTimer;
