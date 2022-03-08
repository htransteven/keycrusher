import React, {
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  overflow: hidden;
  padding: 10px;
`;

type CursorStyle = "line" | "block";

interface CursorPosition {
  style: CursorStyle;
  top: number;
  left: number;
  width: number;
  height: number;
}

const Cursor = styled.div`
  position: absolute;
  background-color: red;
`;

const TemplateBox = styled.div`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px;
`;

const TemplateWord = styled.span``;
const TemplateCharacter = styled.span``;

const StyledInput = styled.input`
  height: 100%;
  width: 100%;
`;

interface TextPrompt {}

interface TextPromptState {
  words: string[];
  currentWordIndex: number;
  currentCharIndex: number;
  cursor: CursorPosition;
}

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget urna odio. Cras sed diam tortor. Maecenas arcu eros, bibendum vel urna ut, congue scelerisque diam. Nullam ac risus a magna porttitor posuere. Integer maximus auctor iaculis. Sed feugiat elit eget magna suscipit, mollis laoreet nunc bibendum. Integer congue est odio, efficitur eleifend libero molestie eu. Integer non sem nec massa consectetur mollis ac id risus. Nulla molestie vulputate eleifend. Aliquam ex tellus, tincidunt a urna vel, dictum mollis leo. Suspendisse a sapien ligula.";

const initialState: TextPromptState = {
  words: lorem.split(" "),
  currentWordIndex: 0,
  currentCharIndex: 0,
  cursor: {
    style: "line",
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
};

enum TEXT_PROMPT_ACTIONS {
  KEY_PRESS = "KEY_PRESS",
}

interface TextPromptKeyPressAction {
  type: TEXT_PROMPT_ACTIONS;
  payload: {
    key: string;
  };
}

type TextPromptAction = TextPromptKeyPressAction;

const reducer = (
  state: TextPromptState,
  action: TextPromptAction
): TextPromptState => {
  switch (action.type) {
    case TEXT_PROMPT_ACTIONS.KEY_PRESS:
      switch (action.payload.key) {
        case " ": {
          return {
            ...state,
            currentWordIndex: state.currentWordIndex + 1,
            currentCharIndex: 0,
          };
        }
        case "Backspace": {
          return {
            ...state,
            currentWordIndex:
              state.currentCharIndex > 0
                ? state.currentWordIndex
                : state.currentWordIndex > 0
                ? state.currentWordIndex - 1
                : 0,
            currentCharIndex:
              state.currentCharIndex > 0
                ? state.currentCharIndex - 1
                : state.currentWordIndex > 0
                ? state.words[state.currentWordIndex - 1].length
                : 0,
          };
        }
        default: {
          return {
            ...state,
            currentCharIndex: state.currentCharIndex + 1,
          };
        }
      }
    default:
      throw new Error();
  }
};

export const TextPrompt: React.FC<TextPrompt> = () => {
  const [_, setMounted] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [wordRef, setWordRef] = useState<HTMLSpanElement | null>(null);
  const [charRef, setCharRef] = useState<HTMLSpanElement | null>(null);
  const nextCharRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  const extractCursorRefPosition = useCallback(
    (elem: HTMLSpanElement, style: CursorStyle): CursorPosition => {
      return {
        style,
        top: elem.offsetTop,
        left: elem.offsetLeft,
        width: style === "block" ? elem.offsetWidth : 1,
        height: elem.offsetHeight,
      };
    },
    []
  );

  const handleInputChange: KeyboardEventHandler<HTMLInputElement> = (e) => {
    console.log(e);
    dispatch({
      type: TEXT_PROMPT_ACTIONS.KEY_PRESS,
      payload: { key: e.key },
    });
  };

  console.log(state);
  console.log(wordRef, charRef);

  const cursorPosition = charRef
    ? extractCursorRefPosition(charRef, state.cursor.style)
    : null;

  console.log(cursorPosition);

  const onWordRefChange = useCallback(
    (elem, wordIndex) => {
      if (state.currentWordIndex === wordIndex) {
        setWordRef(elem);
      }
    },
    [state.currentWordIndex]
  );

  const onCharRefChange = useCallback(
    (elem, wordIndex, charIndex) => {
      if (
        state.currentWordIndex === wordIndex &&
        state.currentCharIndex === charIndex
      ) {
        setCharRef(elem);
      }
    },
    [state.currentWordIndex, state.currentCharIndex]
  );

  return (
    <Container>
      <TemplateBox>
        {cursorPosition && <Cursor style={cursorPosition} />}
        {state.words.map((word, wIndex) => (
          <TemplateWord
            key={`template-${wIndex}`}
            ref={(elem) => onWordRefChange(elem, wIndex)}
          >
            {word.split("").map((character, cIndex) => (
              <TemplateCharacter
                key={`template-${wIndex}-${cIndex}`}
                ref={(elem) => onCharRefChange(elem, wIndex, cIndex)}
              >
                {character}
              </TemplateCharacter>
            ))}
          </TemplateWord>
        ))}
      </TemplateBox>
      <StyledInput onKeyDown={handleInputChange} />
    </Container>
  );
};
