import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const ScrollRoutingContext = createContext();

export function ScrollRoutingProvider({ roots = [], children, ...props }) {
  const location = useLocation();
  const navigate = useNavigate();
  const root = useMemo(
    () => roots.find((r) => location.pathname.startsWith(r) || ""),
    [roots, location.pathname]
  );

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

    return entries
      .filter((e) => e.target.dataset.__route.startsWith(root))
      .reduce((highest, entry) => {
        return highest == null ||
          (entry.intersectionRatio > highest.intersectionRatio &&
            entry.intersectionRatio > 0.2)
          ? entry
          : highest;
      }, null);
  }, [observer, entries]);

  const [scrollingTo, setScrollingTo] = useState(null);

  function scrollNavigate(route) {
    if (scrollingTo) return;

    navigate(route);

    if (route == root) {
      setScrollingTo(document.body);
      setTimeout(() => setScrollingTo(null), 1000);
    }

    for (const entry of entries) {
      // If the address is at the entry, but it's not visible enough...
      if (
        route == entry.target.dataset.__route &&
        entry.intersectionRatio < 0.2
      ) {
        setScrollingTo(entry.target);
        setTimeout(() => setScrollingTo(null), 1000);
      }
    }
  }

  useEffect(() => {
    if (!scrollingTo) return;

    scrollingTo.scrollIntoView({
      behavior: "smooth",
    });
  }, [scrollingTo]);

  useEffect(() => {
    if (!mostVisible || scrollingTo) {
      return;
    }

    // If the most visible is not visible enough...
    if (
      mostVisible.intersectionRatio == undefined ||
      mostVisible.intersectionRatio < 0.2
    ) {
      // ...back to the root.
      if (location.pathname != root) {
        navigate(root);
      }

      return;
    }
  }, [mostVisible, location.pathname, scrollingTo]);

  useEffect(() => {
    if (!mostVisible || scrollingTo) {
      return;
    }

    // If the address is not at the most visible...
    if (location.pathname != mostVisible.target.dataset.__route) {
      // ...navigate to it.
      navigate(mostVisible.target.dataset.__route);
    }
  }, [mostVisible?.target]);

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
        root,
      }}
    >
      {children}
    </ScrollRoutingContext.Provider>
  );
}

/**
 * @typedef ScrollRoutingContextValue
 * @property {({ rel: string, route: string, sectionRef: ReactElement }) => undefined} addSection
 * @property {({ route: string }) => undefined} navigate
 * @property {string} root
 */

/**
 *  @returns {ScrollRoutingContextValue}
 */
export function useScrollRouting() {
  return useContext(ScrollRoutingContext);
}
