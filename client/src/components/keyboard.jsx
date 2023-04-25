import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactSimpleKeyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
// import en from "simple-keyboard-layouts/build/layouts/english";
// import jp from "simple-keyboard-layouts/build/layouts/japanese";
import { useLocalization } from "../contexts/localization";
import "../css/react-simple-keyboard.scss";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const SIZES = {
  や: "ゃ",
  ゆ: "ゅ",
  よ: "ょ",
};

const DAKUTENS = {
  か: "が",
  き: "ぎ",
  く: "ぐ",
  け: "げ",
  こ: "ご",
  さ: "ざ",
  し: "じ",
  す: "ず",
  せ: "ぜ",
  そ: "ぞ",
  た: "だ",
  ち: "ぢ",
  つ: "づ",
  て: "で",
  と: "ど",
  は: "ば",
  ひ: "び",
  ふ: "ぶ",
  へ: "べ",
  ほ: "ぼ",
};

const TENTENS = {
  ば: "ぱ",
  び: "ぴ",
  ぶ: "ぷ",
  へ: "ぺ",
  ぼ: "ぽ",

  ぱ: "は",
  ぴ: "ひ",
  ぷ: "ふ",
  ぺ: "へ",
  ぽ: "ほ",
};

function en() {
  return {
    layout: {
      default: [
        "` 1 2 3 4 5 6 7 8 9 0 - =",
        "q w e r t y u i o p [ ] \\",
        "a s d f g h j k l ; '",
        "{shift} z x c v b n m , . /",
        ".com @ {space} {backspace}",
      ],
      shift: [
        "~ ! @ # $ % ^ & * ( ) _ +",
        "Q W E R T Y U I O P { } |",
        'A S D F G H J K L : "',
        "{shift} Z X C V B N M < > ?",
        ".com @ {space} {backspace}",
      ],
      tel: ["1 2 3", "4 5 6", "7 8 9", " 0 {backspace}"],
    },
    display: {
      "{backspace}": "⌫",
      "{shift}": "⇧",
      "{space}": " ",
    },
  };
}

function jp({ size = false, contraction = false } = {}) {
  return {
    layout: {
      default: [
        "わ ら や ま は な た さ か あ",
        "を り  み ひ に ち し き い",
        "ん る ゆ む ふ ぬ つ す く う",
        " れ  め へ ね て せ け え",
        " ろ よ も ほ の と そ こ お",
        `{size${!size ? "-disabled" : ""}} {contraction${
          !contraction ? "-disabled" : ""
        }} {space} {abc} {other} {backspace}`,
      ],
      other: [
        "1 2 3 4 5 6 7 8 9 0",
        "! @ # $ % ^ & * ( )",
        "' \" = _ ` : ; ? ~ |",
        "+ - \\ / [ ] { } < >",
        ". , 、 。 ・ ー 「 」 ¥ ",
        `{default} {space} {abc} {backspace}`,
      ],
      abc: [
        "q w e r t y u i o p",
        "a s d f g h j k l",
        "{shift} z x c v b n m",
        `{default} {space} {other} {backspace}`,
      ],
      shift: [
        "Q W E R T Y U I O P",
        "A S D F G H J K L",
        "{shift} Z X C V B N M",
        `{default} {space} {other} {backspace}`,
      ],
      tel: ["1 2 3", "4 5 6", "7 8 9", " 0 {backspace}"],
    },
    display: {
      "{default}": "あ",
      "{other}": "1?#",
      "{backspace}": "⌫",
      "{shift}": "⇧",
      "{contraction}": "゛゜",
      "{contraction-disabled}": "゛゜",
      "{size}": "大/小",
      "{size-disabled}": "大/小",
      "{abc}": "ABC",
      "{space}": " ",
    },
  };
}

function toggle(string, button) {
  if (button == "{size}") {
    const temp = {
      ...SIZES,
      ...Object.fromEntries(
        Object.entries(SIZES).map(([key, value]) => [value, key])
      ),
    };

    return temp[string] || string;
  }

  if (button == "{contraction}") {
    const temp = {
      ...DAKUTENS,
      ...Object.fromEntries(
        Object.entries(DAKUTENS).map(([key, value]) => [value, key])
      ),
      ...TENTENS,
    };

    return temp[string] || string;
  }
}

export default function Keyboard({ children, className, onChange, ...props }) {
  const keyboardRef = useRef();
  const [isHidden, setIsHidden] = useState(true);
  // NOTE: target is guaranteed to be a valid target
  const [target, setTarget] = useState(null);
  const { language } = useLocalization();
  const [layout, setLayout] = useState(language == "en-US" ? en() : jp());
  const [compStart, setCompStart] = useState(null);
  const [compEnd, setCompEnd] = useState(null);
  const [composition, setComposition] = useState(null);
  const [kanjis, setKanjis] = useState([]);
  const [kanjiPage, setKanjiPage] = useState(1);

  useEffect(() => {
    if (compStart === null) {
      return;
    }

    if (compStart >= compEnd) {
      setCompStart(null);
      setCompEnd(null);
      setComposition(null);
      setKanjis([]);
      setKanjiPage(1);
      return;
    }

    const composition = target.value.substring(compStart, compEnd);
    setComposition(composition);

    // setup AbortController
    const controller = new AbortController();
    // signal to pass to fetch
    const signal = controller.signal;

    (async () => {
      try {
        const response = await fetch(`/api/language/kanji/${composition}`, {
          signal,
        });

        if (!response.ok) {
          console.error("API fetch error: ");
          console.error(await response.text());
          return;
        }
        setKanjis(await response.json());
      } catch (error) {
        if (error.name !== "AbortError") {
          throw error;
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [compStart, compEnd, target && target.value]);

  useEffect(() => {
    keyboardRef.current.setOptions({
      layoutName: "default",
    });
    setLayout(language == "en-US" ? en() : jp());
  }, [language]);

  const onselectionchange = useCallback(() => {
    if (document.activeElement == target) {
      if (compEnd != target.selectionEnd) {
        setCompStart(null);
        setCompEnd(null);
        setKanjis([]);
        setKanjiPage(1);
      }

      if (language == "ja-JP") {
        if (target.selectionStart) {
          const options = {};

          if (
            target.value[target.selectionStart - 1].match(
              new RegExp(`[${Object.entries(SIZES).flat().join()}]`)
            )
          ) {
            options.size = true;
          }
          if (
            target.value[target.selectionStart - 1].match(
              new RegExp(
                `[${
                  Object.entries(DAKUTENS).flat().join() +
                  Object.entries(TENTENS).flat().join()
                }]`
              )
            )
          ) {
            options.contraction = true;
          }

          setLayout(jp(options));
        }
      }
    }
  }, [language, target, setLayout, jp, compEnd]);

  useEffect(() => {
    document.addEventListener("selectionchange", onselectionchange);

    return () => {
      document.removeEventListener("selectionchange", onselectionchange);
    };
  }, [onselectionchange]);

  return (
    <div
      onFocus={(e) => {
        setIsHidden(false);

        if (e.target.inputMode == "none") {
          e.preventDefault();
          setTarget(e.target);
          keyboardRef.current.setInput(e.target.value, e.target.name);

          if (e.target.inputMode == "tel") {
            keyboardRef.current.setOptions({
              layoutName: "tel",
            });
          } else if (keyboardRef.current.options.layoutName == "tel") {
            keyboardRef.current.setOptions({
              layoutName: "default",
            });
          }

          e.target.style.scrollMargin = `calc(100vh - ${keyboardRef.current.keyboardDOM.scrollHeight}px - 4.5em)`;
          e.target.scrollIntoView({ behavior: "smooth" });
          e.target.style.removeProperty("scroll-margin");
        }
      }}
      onBlur={() => {
        setIsHidden(true);
      }}
    >
      {children}
      <div
        className={`${className} ${
          isHidden && "hidden"
        } ${language} keyboard-wrapper`}
        onFocus={() => {
          if (target) {
            setIsHidden(false);
          }
        }}
        // NOTE: Required to focus event
        tabIndex={"100"}
        onTouchStart={() => {
          // Refocus the textbox ASAP
          if (target) {
            const start = keyboardRef.current.getCaretPosition();
            const end = keyboardRef.current.getCaretPositionEnd();
            target.focus();
            target.setSelectionRange(start, end);
          }
        }}
      >
        {kanjis.length > 0 && (
          <div className="kanjis">
            {kanjis.map((kanji, i) => (
              <button
                key={"kanji-" + i}
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(
                    target.value.substring(0, compStart) +
                      kanji +
                      target.value.substring(compEnd),
                    target
                  );
                  setCompStart(null);
                  setCompEnd(null);
                  setKanjis([]);
                  setKanjiPage(1);
                }}
              >
                {kanji}
              </button>
            ))}
          </div>
        )}
        <ReactSimpleKeyboard
          keyboardRef={(x) => (keyboardRef.current = x)}
          {...layout}
          onKeyPress={(button) => {
            if (language == "en-US") {
              if (button === "{shift}") {
                const currentLayout = keyboardRef.current.options.layoutName;
                const newLayoutName =
                  currentLayout === "default" ? "shift" : "default";

                keyboardRef.current.setOptions({
                  layoutName: newLayoutName,
                });
                return;
              }
            }

            if (language == "ja-JP") {
              if (button === "{size}" || button === "{contraction}") {
                const value = keyboardRef.current.getInput(target.name);
                const start = keyboardRef.current.getCaretPosition();
                const newValue =
                  value.substring(0, start - 1) +
                  toggle(value[start - 1], button) +
                  value.substring(start);

                keyboardRef.current.setInput(newValue);
                return;
              }

              if (button === "{default}") {
                keyboardRef.current.setOptions({
                  layoutName: "default",
                });
                return;
              }

              if (button === "{other}") {
                keyboardRef.current.setOptions({
                  layoutName: "other",
                });
                return;
              }

              if (button === "{abc}") {
                const currentLayout = keyboardRef.current.options.layoutName;

                if (currentLayout != "shift") {
                  keyboardRef.current.setOptions({
                    layoutName: "abc",
                  });
                }
                return;
              }

              if (button === "{shift}") {
                const currentLayout = keyboardRef.current.options.layoutName;
                const newLayoutName = currentLayout === "abc" ? "shift" : "abc";

                keyboardRef.current.setOptions({
                  layoutName: newLayoutName,
                });
                return;
              }
            }

            const offset = button === "{backspace}" ? -1 : 1;

            if (
              compStart === null ||
              target.selectionStart < compStart ||
              target.selectionEnd + offset > compEnd + offset
            ) {
              setCompStart(target.selectionStart);
            }

            setCompEnd((old) =>
              Math.max(old + offset, target.selectionStart + offset)
            );
          }}
          onChange={(value, e) => {
            onChange(value, target);

            if (target) {
              setTimeout(() => {
                target.focus();
                target.setSelectionRange(
                  keyboardRef.current.getCaretPosition(),
                  keyboardRef.current.getCaretPositionEnd()
                );
              }, 200);
            }
          }}
          inputName={target ? target.name : "default"}
          {...props}
        />
      </div>
    </div>
  );
}
