import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const ScrollRoutingContext = createContext();

export function ScrollRoutingProvider({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * @type {[{}, Function]}
   * */
  const [entryRefs, setEntryRefs] = useState({});

  /**
   * @type {[IntersectionObserverEntry[], Function]}
   * */
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    setEntries(
      Object.entries(entryRefs)
        // Filter out null refs
        .filter(([, ref]) => ref.current)
        // Map refs to IntersectionObserverEntry's, copying the old one if present
        .map(([route, ref]) => {
          const entry = entries.find((e) => e.target.dataset.__route == route);

          return {
            target: ref.current,
            intersectionRatio: entry && entry.intersectionRatio,
          };
        })
    );

    Object.values(entryRefs)
      .filter((ref) => ref.current)
      .forEach((ref) => observer.observe(ref.current));

    return () => observer && observer.disconnect();
  }, [entryRefs]);

  /**
   * @type {IntersectionObserver}
   */
  const observer = useMemo(
    () =>
      new IntersectionObserver(
        (newEntries) => {
          // Add/update these entries on the list
          setEntries((old) => [
            ...old.filter(
              (oldEntry) =>
                !newEntries.find(
                  (newEntry) =>
                    newEntry.target.dataset.__route ==
                    oldEntry.target.dataset.__route
                )
            ),
            // NOTE: Must make a copy
            ...newEntries.map(({ intersectionRatio, target }) => ({
              intersectionRatio,
              target,
            })),
          ]);
        },
        { threshold: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] }
      ),
    []
  );

  const mostVisible = useMemo(() => {
    if (!entries.length) return null;

    return entries.reduce((highest, entry) => {
      return highest == null ||
        entry.intersectionRatio > highest.intersectionRatio
        ? entry
        : highest;
    }, null);
  }, [observer, entries]);

  const [scrollingTo, setScrollingTo] = useState(false);

  function scrollNavigate(route) {
    if (scrollingTo) return;

    navigate(route);

    for (const entry of entries) {
      // If the address is at the entry, but it's not visible enough...
      if (
        route == entry.target.dataset.__route &&
        entry.intersectionRatio < 0.2
      ) {
        entry.target.scrollIntoView({
          behavior: "smooth",
        });

        setScrollingTo(true);
        setTimeout(() => setScrollingTo(false), 1000);
      }
    }
  }

  useEffect(() => {
    if (!mostVisible || scrollingTo) {
      return;
    }

    // If the most visible is not visible enough...
    if (
      mostVisible.intersectionRatio == undefined ||
      mostVisible.intersectionRatio < 0.2
    ) {
      // ...strip all routes from the address.
      const newPath = entries.reduce(
        (path, entry) =>
          path.replace(
            new RegExp(`\\${entry.target.dataset.__route}$`, "g"),
            "/"
          ),
        location.pathname
      );

      if (location.pathname != newPath) {
        navigate(newPath);
      }

      return;
    }

    // If the address is not at the most visible...
    if (location.pathname != mostVisible.target.dataset.__route) {
      // ...navigate to it.
      navigate(mostVisible.target.dataset.__route);
    }
  }, [mostVisible, location.pathname, scrollingTo]);

  function addSection({ route, ref }) {
    if (ref.current) {
      ref.current.dataset.__route = route;
      setEntryRefs((old) => ({
        ...old,
        [route]: ref,
      }));

      if (location.pathname == ref.current.dataset.__route) {
        ref.current.scrollIntoView();
      }
    }
  }

  return (
    <ScrollRoutingContext.Provider
      value={{
        addSection,
        navigate: scrollNavigate,
      }}
    >
      {children}
    </ScrollRoutingContext.Provider>
  );
}

/**
 * @typedef ScrollRoutingContextValue
 * @property {({ route: string, sectionRef: ReactElement }) => undefined} addSection
 */

/**
 *  @returns {ScrollRoutingContextValue}
 */
export function useScrollRouting() {
  return useContext(ScrollRoutingContext);
}
