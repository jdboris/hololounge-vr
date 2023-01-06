import theme from "@jdboris/css-themes/space-station";
import { useEffect, useRef, useState } from "react";
import {
  FaNetworkWired,
  FaUserAlt,
  FaWifi,
  FaPlay,
  FaPlus,
  FaImage,
  FaVideo,
  FaVrCardboard,
} from "react-icons/fa";
import { MdClose } from "react-icons/md";

function GameForm({
  mode: defaultMode,
  game: defaultGame,
  tags,
  error,
  setError,
  isLoading,
  saveGame,
  onCreate,
}) {
  const [mode, setMode] = useState(defaultMode);
  const [game, setGame] = useState({ ...defaultGame });
  const [isOpen, setIsOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const videoRef = useRef();

  useEffect(() => {
    if (videoRef.current) {
      if (isOpen) {
        videoRef.current.scrollIntoView({
          alignToTop: true,
          behavior: "smooth",
        });
        playVideo();
      } else {
        pauseVideo();
      }
    }
  }, [isOpen]);

  const playVideo = () => {
    if (videoRef.current) {
      if (videoRef.current.ended) {
        videoRef.current.currentTime = 0;
      }

      videoRef.current.play();
      setIsPaused(false);

      videoRef.current.onended = () => setIsPaused(true);
    }
  };

  const pauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPaused(true);
    }
  };

  return (
    <div
      className={theme.card + " " + (isOpen ? theme.open : "")}
      onClick={() => !isOpen && setIsOpen(true)}
    >
      <div className={theme.overlay} onClick={() => setIsOpen(false)}></div>
      {!isOpen && (game.posterUrl ? <img src={game.posterUrl} /> : <FaPlus />)}
      {isOpen && (
        <div
          className={theme.videoPlayer}
          onClick={(e) => (e.target.paused ? playVideo() : pauseVideo())}
        >
          <video ref={videoRef} poster={game.posterUrl} src={game.trailerUrl} />
          {isPaused && <FaPlay />}

          {(mode == "create" || mode == "update") && (
            <>
              <label>
                <FaImage />
                <input
                  type="url"
                  value={game.posterUrl}
                  placeholder="Poster URL"
                  onChange={(e) =>
                    setGame((old) => ({ ...old, posterUrl: e.target.value }))
                  }
                />
              </label>
              <label>
                <FaVideo />
                <input
                  type="url"
                  value={game.trailerUrl}
                  placeholder="Trailer URL"
                  onChange={(e) =>
                    setGame((old) => ({ ...old, trailerUrl: e.target.value }))
                  }
                />
              </label>
            </>
          )}
        </div>
      )}

      <header>
        <span onClick={() => setIsOpen(true)}>
          {isOpen && (mode == "create" || mode == "update") ? (
            <label>
              <FaVrCardboard />
              <input
                type="text"
                value={game.title}
                placeholder="Title"
                onChange={(e) =>
                  setGame((old) => ({ ...old, title: e.target.value }))
                }
              />
            </label>
          ) : (
            game.title
          )}
        </span>
        {isOpen && (
          <button className={theme.altButton} onClick={() => setIsOpen(false)}>
            <MdClose />
          </button>
        )}
      </header>
      {isOpen && (
        <main>
          {mode == "create" || mode == "update" ? (
            <ul className={theme.badges}>
              {tags?.map((tag) => (
                <li>
                  <label className={theme.checkboxLabel}>
                    <input
                      type="checkbox"
                      // checked={game.hasLocalMultiplayer}
                      // onChange={(e) =>
                      //   setGame((old) => ({
                      //     ...old,
                      //     hasLocalMultiplayer: e.target.checked,
                      //   }))
                      // }
                    />
                    <span className={theme.badge}>{tag.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <ul className={theme.badges}>
              {game.tags?.map((tag) => (
                <li className={theme.badge}>{tag.name}</li>
              ))}
            </ul>
          )}

          <ul>
            <li>
              <FaUserAlt />{" "}
              {isOpen && (mode == "create" || mode == "update") ? (
                <input
                  type="number"
                  className={theme.small}
                  value={game.playerMinimum}
                  placeholder="Min."
                  onChange={(e) =>
                    setGame((old) => ({
                      ...old,
                      playerMinimum: e.target.value,
                    }))
                  }
                />
              ) : (
                game.playerMinimum
              )}
              -
              {isOpen && (mode == "create" || mode == "update") ? (
                <input
                  type="number"
                  className={theme.small}
                  value={game.playerMaximum}
                  placeholder="Max."
                  onChange={(e) =>
                    setGame((old) => ({
                      ...old,
                      playerMaximum: e.target.value,
                    }))
                  }
                />
              ) : (
                game.playerMaximum
              )}
              {(game.playerMinimum > 1 || game.playerMaximum > 1) && (
                <>
                  ({" "}
                  {mode == "create" || mode == "update" ? (
                    <label className={theme.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={game.hasLocalMultiplayer}
                        onChange={(e) =>
                          setGame((old) => ({
                            ...old,
                            hasLocalMultiplayer: e.target.checked,
                          }))
                        }
                      />
                      <FaNetworkWired />
                    </label>
                  ) : (
                    game.hasLocalMultiplayer && <FaNetworkWired />
                  )}
                  {mode == "create" || mode == "update" ? (
                    <label className={theme.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={game.hasOnlineMultiplayer}
                        onChange={(e) =>
                          setGame((old) => ({
                            ...old,
                            hasOnlineMultiplayer: e.target.checked,
                          }))
                        }
                      />
                      <FaWifi />
                    </label>
                  ) : (
                    game.hasOnlineMultiplayer && <FaWifi />
                  )}
                  )
                </>
              )}
            </li>
          </ul>
          {mode == "create" || mode == "update" ? (
            <label>
              <textarea
                value={game.summary}
                placeholder="Summary..."
                onChange={(e) =>
                  setGame((old) => ({
                    ...old,
                    summary: e.target.value,
                  }))
                }
              ></textarea>
            </label>
          ) : (
            <p>{game.summary}</p>
          )}

          {(mode == "create" || mode == "update") && <button>Save</button>}
        </main>
      )}
    </div>
  );
}

export default GameForm;
