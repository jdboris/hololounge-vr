import theme from "@jdboris/css-themes/space-station";
import Game from "dtos/game";
import { useEffect, useRef, useState } from "react";
import {
  FaCheckCircle,
  FaCircle,
  FaCircleNotch,
  FaImage,
  FaNetworkWired,
  FaPlay,
  FaPlus,
  FaQuestionCircle,
  FaRegCheckCircle,
  FaRegCircle,
  FaRegQuestionCircle,
  FaUserAlt,
  FaVideo,
  FaVrCardboard,
  FaWifi,
} from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { Link } from "react-router-dom";

function GameForm({
  mode: defaultMode,
  game: defaultGame,
  tags,
  error,
  setError,
  isLoading,
  saveGame,
  onCreate,
  onUpdate,
  currentUser,
}) {
  const [sucess, setSuccess] = useState(null);
  const [mode, setMode] = useState(defaultMode);
  const [game, setGameRaw] = useState(defaultGame || new Game());
  function setGame(data) {
    setGameRaw((old) => new Game({ ...old, ...data }));
  }
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
    <form
      className={theme.card + " " + (isOpen ? theme.open : "")}
      onClick={() => !isOpen && setIsOpen(true)}
      onSubmit={async (e) => {
        e.preventDefault();

        setSuccess(null);
        setError(null);

        if (mode === "create" || mode === "update") {
          const { title } = (await saveGame(game)) || {};

          if (title) {
            if (mode === "create") {
              setGame(new Game());
              onCreate();
            }

            if (mode === "update") {
              setMode("read");
              onUpdate();
            }

            setSuccess({ message: `Game "${title}" created.` });
          }

          return;
        }
      }}
    >
      {!isOpen &&
        (game.posterUrl ? (
          <img
            style={{ ...(!game.isEnabled ? { filter: "grayscale(1)" } : {}) }}
            src={game.posterUrl}
          />
        ) : (
          <FaPlus />
        ))}
      {isOpen && (
        <>
          <div
            className={theme.overlay}
            style={{
              position: "fixed",
            }}
            onClick={() => setIsOpen(false)}
          ></div>
          <div
            className={theme.videoPlayer}
            onClick={(e) => (e.target.paused ? playVideo() : pauseVideo())}
          >
            <video
              ref={videoRef}
              poster={game.posterUrl}
              src={game.trailerUrl}
            />
            {isPaused && <FaPlay />}

            {(mode == "create" || mode == "update") && (
              <>
                <label>
                  <FaImage />
                  <input
                    type="url"
                    value={game.posterUrl}
                    placeholder="Poster URL"
                    onChange={(e) => setGame({ posterUrl: e.target.value })}
                  />
                </label>
                <label>
                  <FaVideo />
                  <input
                    type="url"
                    value={game.trailerUrl}
                    placeholder="Trailer URL"
                    onChange={(e) =>
                      setGame({
                        trailerUrl: e.target.value,
                      })
                    }
                  />
                </label>
              </>
            )}
          </div>
        </>
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
                onChange={(e) => setGame({ title: e.target.value })}
              />
            </label>
          ) : (
            game.title
          )}
        </span>
        {isOpen && (
          <button className={theme.alt} onClick={() => setIsOpen(false)}>
            <MdClose />
          </button>
        )}
      </header>
      {isOpen && (
        <main>
          {mode == "create" || mode == "update" ? (
            <ul className={theme.badges}>
              {tags?.map((tag) => (
                <li key={`game-${game.id}-tag-${tag.id}`}>
                  <label className={theme.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={Boolean(
                        game.tags?.find((gameTag) => gameTag.id === tag.id)
                      )}
                      onChange={(e) =>
                        setGameRaw((old) => {
                          const copy = new Game(old);
                          const gameTag = old.tags?.find(
                            (gameTag) => gameTag.id === tag.id
                          );

                          if (e.target.checked) {
                            if (!gameTag) {
                              copy.tags.push({ ...tag });
                            }
                          } else {
                            copy.tags = copy.tags.filter(
                              (tag) => tag.id != gameTag.id
                            );
                          }

                          return copy;
                        })
                      }
                    />
                    <span className={theme.badge}>{tag.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <div className={theme.row}>
              <ul className={theme.badges}>
                {game.tags?.map((tag) => (
                  <li
                    key={`game-${game.id}-tag-${tag.id}`}
                    className={theme.badge}
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
              <Link to={`/help/${game.id}`}>
                <FaRegQuestionCircle />
                HELP
              </Link>
            </div>
          )}

          <ul>
            <li>
              <FaUserAlt />{" "}
              {isOpen &&
                (mode == "create" || mode == "update" ? (
                  <>
                    <input
                      type="number"
                      className={theme.small}
                      value={game.playerMinimum}
                      placeholder="Min."
                      onChange={(e) =>
                        setGame({
                          playerMinimum: Number(e.target.value),
                        })
                      }
                    />
                    -
                    <input
                      type="number"
                      className={theme.small}
                      value={game.playerMaximum}
                      placeholder="Max."
                      onChange={(e) =>
                        setGameRaw((old) => ({
                          ...old,
                          playerMaximum: Number(e.target.value),
                        }))
                      }
                      onBlur={() => setGame({})}
                    />
                  </>
                ) : (
                  <>
                    {game.playerMinimum}
                    {game.playerMaximum > 1 && <> - {game.playerMaximum}</>}
                  </>
                ))}
              {(game.playerMinimum > 1 || game.playerMaximum > 1) && (
                <>
                  {" "}
                  ({" "}
                  {mode == "create" || mode == "update" ? (
                    <label className={theme.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={game.hasLocalMultiplayer}
                        onChange={(e) =>
                          setGame({
                            hasLocalMultiplayer: e.target.checked,
                          })
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
                          setGame({
                            hasOnlineMultiplayer: e.target.checked,
                          })
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
              {isOpen && (mode == "create" || mode == "update") && (
                <label>
                  Sort Order:
                  <input
                    type="number"
                    placeholder="Sort order (1-XXX)"
                    value={game.sortOrder}
                    onChange={(e) => setGame({ sortOrder: e.target.value })}
                  />
                </label>
              )}
            </li>
          </ul>
          {mode == "create" || mode == "update" ? (
            <label>
              <textarea
                value={game.summary}
                placeholder="Summary..."
                onChange={(e) =>
                  setGame({
                    summary: e.target.value,
                  })
                }
              ></textarea>
            </label>
          ) : (
            <p>{game.summary}</p>
          )}

          {mode == "read" && currentUser?.isAdmin == true && (
            <button onClick={(e) => e.preventDefault() || setMode("update")}>
              EDIT
            </button>
          )}

          {(mode == "create" || mode == "update") && <button>SAVE</button>}
          {(mode == "create" || mode == "update") && (
            <label
              className={
                (!game.isEnabled ? theme.red : "") + " " + theme.checkboxLabel
              }
            >
              <input
                type="checkbox"
                checked={game.isEnabled}
                onChange={(e) => setGame({ isEnabled: e.target.checked })}
              />
              {!game.isEnabled && <FaRegCircle />}
              {game.isEnabled && <FaRegCheckCircle />}
              Enabled
            </label>
          )}
        </main>
      )}
    </form>
  );
}

export default GameForm;
