import { useCallback, useEffect, useRef, useState } from "react";

const useTimer = (milliSeconds) => {
  const [isTimeUp, setIsTimeUp] = useState(true);
  const [timeoutId, setTimeoutId] = useState(null);

  const restartTimer = useCallback(() => {
    setIsTimeUp(false);

    setTimeoutId(
      setTimeout(() => {
        setIsTimeUp(true);
      }, milliSeconds)
    );
  }, [timeoutId]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return [isTimeUp, restartTimer];
};

export default useTimer;
