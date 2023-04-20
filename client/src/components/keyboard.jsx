import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactSimpleKeyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
// import en from "simple-keyboard-layouts/build/layouts/english";
// import jp from "simple-keyboard-layouts/build/layouts/japanese";
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

// {
//   "layout": {
//       "default": [
//           "1 2 3 4 5 6 7 8 9 0 - ^ ¥ {bksp}",
//           "{tab} た て い す か ん な に ら せ ゛ ゜ む",
//           "{lock} ち と し は き く ま の り れ け {enter}",
//           "{shift} つ さ そ ひ こ み も ね る め {shift}",
//           ".com @ {space}"
//       ],
//       "shift": [
//           "! \" # $ % & ' ( ) ́ = ~ | {bksp}",
//           "{tab} た て ぃ す か ん な に ら せ 「 」 む",
//           "{lock} ち と し は き く ま の り れ け {enter}",
//           "{shift} っ さ そ ひ こ み も 、 。 ・ {shift}",
//           ".com @ {space}"
//       ]
//   }
// }

// `
// わらやまはなたさかあ
// をり みひにちしきい
// んるゆむふぬつすくう
// ーれ めへねてせけえ
//  ろよもほのとそこお
// `;

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
  const [target, setTarget] = useState(null);
  const { language } = useLocalization();
  const [layout, setLayout] = useState(language == "en-US" ? en() : jp());

  useEffect(() => {
    keyboardRef.current.setOptions({
      layoutName: "default",
    });
    setLayout(language == "en-US" ? en() : jp());
  }, [language]);

  const onselectionchange = useCallback(() => {
    if (document.activeElement == target) {
      if (language == "ja-JP" && target.selectionStart) {
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
  }, [language, target, setLayout, jp]);

  useEffect(() => {
    document.addEventListener("selectionchange", onselectionchange);

    return () => {
      document.removeEventListener("selectionchange", onselectionchange);
    };
  }, [onselectionchange]);

  return (
    <div
      onFocus={(e) => {
        if (e.target.inputMode == "none") {
          setIsHidden(false);
          setTarget(e.target);
          keyboardRef.current.setInput(e.target.value, e.target.name);

          e.target.style.scrollMargin = `calc(100vh - ${keyboardRef.current.keyboardDOM.scrollHeight}px - 4em)`;
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
        className={`${className} ${isHidden && "hidden"} ${language}`}
        onFocus={() => setIsHidden(false)}
        // NOTE: Required to focus event
        tabIndex={"100"}
        onTouchStart={() => {
          // Refocus the textbox ASAP
          if (target) {
            target.focus();
            target.setSelectionRange(
              keyboardRef.current.getCaretPosition(),
              keyboardRef.current.getCaretPositionEnd()
            );
          }
        }}
      >
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
          }}
          onChange={(value, e) => {
            onChange(value, target);
          }}
          inputName={target ? target.name : "default"}
          onKeyReleased={() => {
            setTimeout(() => {
              target.focus();
              target.setSelectionRange(
                keyboardRef.current.getCaretPosition(),
                keyboardRef.current.getCaretPositionEnd()
              );
              onselectionchange();
            }, 200);
          }}
          {...props}
        />
      </div>
    </div>
  );
}
