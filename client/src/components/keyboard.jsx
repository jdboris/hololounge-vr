import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import ReactSimpleKeyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { useLocalization } from "../contexts/localization";
import "../css/react-simple-keyboard.scss";

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

function jp({ size = false, contraction = false, kanjiChoices = false } = {}) {
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
        }} ${kanjiChoices ? "{select}" : "{space}"} {abc} {other} {backspace}`,
      ],
      other: [
        "1 2 3 4 5 6 7 8 9 0",
        "! @ # $ % ^ & * ( )",
        "' \" = _ ` : ; ? ~ |",
        "+ - \\ / [ ] { } < >",
        ". , 、 。 ・ ー 「 」 ¥ ",
        `{default} ${kanjiChoices ? "{select}" : "{space}"} {abc} {backspace}`,
      ],
      abc: [
        "q w e r t y u i o p",
        "a s d f g h j k l",
        "{shift} z x c v b n m",
        `{default} ${
          kanjiChoices ? "{select}" : "{space}"
        } {other} {backspace}`,
      ],
      shift: [
        "Q W E R T Y U I O P",
        "A S D F G H J K L",
        "{shift} Z X C V B N M",
        `{default} ${
          kanjiChoices ? "{select}" : "{space}"
        } {other} {backspace}`,
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
      "{select}": "変換",
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

export default function Keyboard({
  children,
  className,
  disabled,
  onChange,
  ...props
}) {
  const wrapperRef = useRef();
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
  const [layoutOptions, setLayoutOptions] = useState({});
  const [kanjiIndex, setKanjiIndex] = useState(null);
  const selectedKanjiRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          setIsHidden(true);
        }
      });
    });

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => observer.disconnect();
  }, [wrapperRef.current]);

  useEffect(() => {
    if (disabled) return;

    resetComposition();
  }, [target]);

  useEffect(() => {
    if (disabled) return;
    if (language == "ja-JP") {
      setLayoutOptions({ ...layoutOptions, kanjiChoices: kanjis.length > 0 });
    }
  }, [kanjis.length > 0]);

  useEffect(() => {
    if (kanjiIndex !== null) {
      selectKanji(kanjis[kanjiIndex]);
    }
  }, [kanjis, kanjiIndex]);

  useEffect(() => {
    if (disabled) return;
    if (selectedKanjiRef.current) {
      selectedKanjiRef.current.scrollIntoView();
    }
  }, [kanjiIndex, selectedKanjiRef.current]);

  useEffect(() => {
    if (kanjiIndex === null && target) {
      setComposition(target.value.substring(compStart, compEnd));
    }
  }, [compStart, compEnd, kanjiIndex, target && target.value]);

  useEffect(() => {
    if (disabled) return;
    setLayout(language == "en-US" ? en(layoutOptions) : jp(layoutOptions));
  }, [layoutOptions]);

  useEffect(() => {
    if (disabled) return;
    if (!target) {
      return;
    }
    if (!composition) {
      return;
    }

    if (compStart >= compEnd) {
      resetComposition();
      return;
    }

    if (
      compStart === null ||
      target.selectionStart < compStart ||
      target.selectionEnd > compEnd
    ) {
      return;
    }

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
  }, [compStart, compEnd, composition, target, target && target.value]);

  useEffect(() => {
    if (disabled) return;
    keyboardRef.current.setOptions({
      layoutName: "default",
    });
    setLayout(language == "en-US" ? en() : jp());
    resetComposition();
  }, [language]);

  const onselectionchange = useCallback(() => {
    if (document.activeElement == target) {
      if (language == "ja-JP") {
        setLayoutOptions((old) => {
          const options = { ...old };

          options.size = target.value[target.selectionStart - 1]?.match(
            new RegExp(`[${Object.entries(SIZES).flat().join()}]`)
          );

          options.contraction = target.value[target.selectionStart - 1]?.match(
            new RegExp(
              `[${
                Object.entries(DAKUTENS).flat().join() +
                Object.entries(TENTENS).flat().join()
              }]`
            )
          );

          return options;
        });
      }
    }
  }, [
    language,
    target,
    target && target.value,
    setLayout,
    jp,
    compStart,
    compEnd,
  ]);

  useEffect(() => {
    if (disabled) return;
    document.addEventListener("selectionchange", onselectionchange);

    return () => {
      document.removeEventListener("selectionchange", onselectionchange);
    };
  }, [onselectionchange]);

  const resetComposition = useCallback(() => {
    setCompStart(null);
    setCompEnd(null);
    setComposition(null);
    setKanjis([]);
    setKanjiIndex(null);
  });

  useEffect(() => {
    if (disabled) return;
    if (!target) {
      return;
    }

    target.focus();
    target.setSelectionRange(
      keyboardRef.current.getCaretPosition(),
      keyboardRef.current.getCaretPositionEnd()
    );
  }, [target && target.value]);

  const selectKanji = useCallback(
    (kanji) => {
      const newValue =
        target.value.substring(0, compStart) +
        kanji +
        target.value.substring(compEnd);
      const caretPos = (target.value.substring(0, compStart) + kanji).length;

      // WARNING: HACK
      target.value = newValue;
      keyboardRef.current.setInput(newValue, target.name);
      keyboardRef.current.setCaretPosition(caretPos, caretPos);

      setCompEnd(caretPos);

      onChange(newValue, target);
    },
    [
      onChange,
      target,
      target && target.value,
      target && target.name,
      compStart,
      compEnd,
    ]
  );

  if (disabled) {
    return <div>{children}</div>;
  }

  return (
    <div
      ref={wrapperRef}
      onFocus={(e) => {
        if (e.target.inputMode == "none") {
          setIsHidden(false);
          e.preventDefault();
          setTarget(e.target);

          if (keyboardRef.current.getInput(e.target.name) != e.target.value) {
            resetComposition();
          }

          keyboardRef.current.setInput(e.target.value, e.target.name);

          // if (e.target.inputMode == "tel") {
          //   keyboardRef.current.setOptions({
          //     layoutName: "tel",
          //   });
          // } else if (keyboardRef.current.options.layoutName == "tel") {
          //   keyboardRef.current.setOptions({
          //     layoutName: "default",
          //   });
          // }

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
                {...(kanjiIndex === i ? { ref: selectedKanjiRef } : {})}
                className={i === kanjiIndex ? "selected" : ""}
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  selectKanji(kanji);
                  resetComposition();
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
              const currentLayout = keyboardRef.current.options.layoutName;

              if (button === "{shift}") {
                const newLayoutName =
                  currentLayout === "default" ? "shift" : "default";

                keyboardRef.current.setOptions({
                  layoutName: newLayoutName,
                });
                return;
              } else {
                if (currentLayout == "shift") {
                  keyboardRef.current.setOptions({
                    layoutName: "default",
                  });
                }
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

              if (button === "{select}") {
                setKanjiIndex((old) => {
                  const kanjiIndex =
                    old === null ? 0 : (old + 1) % kanjis.length;
                  return kanjiIndex;
                });
                return;
              }

              const offset = button === "{backspace}" ? -1 : 1;

              if (kanjiIndex !== null) {
                resetComposition();

                setCompStart(keyboardRef.current.getCaretPosition());
                setCompEnd(keyboardRef.current.getCaretPositionEnd() + offset);
                return;
              }

              // if (offset > 0 && kanjiIndex !== null) {
              //   setCompStart(keyboardRef.current.getCaretPosition());
              //   setCompEnd(keyboardRef.current.getCaretPositionEnd() + offset);
              //   return;
              // }

              setCompStart((compStart) => {
                if (
                  compStart === null ||
                  target.selectionStart < compStart ||
                  target.selectionEnd > compEnd
                ) {
                  return target.selectionStart;
                }

                return compStart;
              });

              setCompEnd((compEnd) => {
                return Math.max(target.selectionEnd, compEnd) + offset;
              });
            }
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
