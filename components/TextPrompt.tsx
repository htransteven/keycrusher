import React, {
  ChangeEventHandler,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useReducer,
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

  transition: 0.1s all;
`;

const TemplateBox = styled.div`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.35rem;
`;

const TemplateWord = styled.span``;
const TemplateCharacter = styled.span<{ correct: boolean | null }>`
  background-color: ${({ correct }) =>
    correct === null
      ? "transparent"
      : correct
      ? "rgba(0,150,0,0.5)"
      : "rgba(150,0,0,0.2)"};
`;

const StyledInput = styled.input`
  height: 100%;
  width: 100%;
`;

interface TextPrompt {}

interface TextPromptState {
  words: string[];
  accuracyArray: (boolean | null)[][];
  userInput: string;
  currentWordIndex: number;
  currentCharIndex: number;
  cursor: CursorPosition;
}

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget urna odio. Cras sed diam tortor. Maecenas arcu eros, bibendum vel urna ut, congue scelerisque diam. Nullam ac risus a magna porttitor posuere. Integer maximus auctor iaculis. Sed feugiat elit eget magna suscipit, mollis laoreet nunc bibendum. Integer congue est odio, efficitur eleifend libero molestie eu. Integer non sem nec massa consectetur mollis ac id risus. Nulla molestie vulputate eleifend. Aliquam ex tellus, tincidunt a urna vel, dictum mollis leo. Suspendisse a sapien ligula.";

const words = lorem.split(" ");

const initialState: TextPromptState = {
  words: words,
  accuracyArray: words.map((word) => word.split("").map(() => null)),
  userInput: "",
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
  NEXT_WORD = "NEXT_WORD",
  INPUT_CHANGE = "INPUT_CHANGE",
}

interface TextPromptKeyPressAction {
  type: TEXT_PROMPT_ACTIONS.KEY_PRESS;
  payload: {
    key: string;
  };
}

interface TextPromptNextWordAction {
  type: TEXT_PROMPT_ACTIONS.NEXT_WORD;
}

interface TextPromptInputChangeAction {
  type: TEXT_PROMPT_ACTIONS.INPUT_CHANGE;
  payload: {
    value: string;
    selectionIndex: number;
  };
}
type TextPromptAction =
  | TextPromptKeyPressAction
  | TextPromptNextWordAction
  | TextPromptInputChangeAction;

const reducer = (
  state: TextPromptState,
  action: TextPromptAction
): TextPromptState => {
  switch (action.type) {
    case TEXT_PROMPT_ACTIONS.NEXT_WORD:
      return {
        ...state,
        userInput: "",
        currentWordIndex: state.currentWordIndex + 1,
        currentCharIndex: 0,
      };
    case TEXT_PROMPT_ACTIONS.KEY_PRESS: {
      const correctChar = state.words[state.currentWordIndex].charAt(
        state.currentCharIndex
      );
      const copy = [...state.accuracyArray];
      copy[state.currentWordIndex][state.currentCharIndex] =
        action.payload.key === correctChar;
      return {
        ...state,
        accuracyArray: copy,
      };
    }
    case TEXT_PROMPT_ACTIONS.INPUT_CHANGE: {
      return {
        ...state,
        userInput: action.payload.value,
        currentCharIndex: action.payload.selectionIndex,
      };
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

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  const extractCursorRefPosition = useCallback(
    (
      elem: HTMLSpanElement,
      style: CursorStyle,
      endOfWord = false
    ): CursorPosition => {
      return {
        style,
        top: elem.offsetTop,
        left: endOfWord ? elem.offsetWidth + elem.offsetLeft : elem.offsetLeft,
        width: style === "block" ? elem.offsetWidth : 1,
        height: elem.offsetHeight,
      };
    },
    []
  );

  const handleKeyPress: KeyboardEventHandler<HTMLInputElement> = (e) => {
    console.log(e);
    const target = e.target as HTMLInputElement;
    dispatch({
      type: TEXT_PROMPT_ACTIONS.KEY_PRESS,
      payload: {
        key: e.key,
      },
    });
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const target = e.target as HTMLInputElement;
    const selectionStart = target.selectionStart || 0;
    if (target.value.charAt(target.value.length - 1) === " ") {
      dispatch({ type: TEXT_PROMPT_ACTIONS.NEXT_WORD });
    } else {
      dispatch({
        type: TEXT_PROMPT_ACTIONS.INPUT_CHANGE,
        payload: { value: target.value, selectionIndex: selectionStart },
      });
    }
  };

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

  const cursorPosition = charRef
    ? extractCursorRefPosition(charRef, state.cursor.style)
    : wordRef
    ? extractCursorRefPosition(wordRef, state.cursor.style, true)
    : null;

  console.log(state);
  //   console.log(wordRef, charRef);
  //   console.log(cursorPosition);

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
                correct={
                  wIndex > state.currentWordIndex
                    ? null
                    : wIndex === state.currentWordIndex &&
                      cIndex >= state.currentCharIndex
                    ? null
                    : state.accuracyArray[wIndex][cIndex]
                }
              >
                {character}
              </TemplateCharacter>
            ))}
          </TemplateWord>
        ))}
      </TemplateBox>
      <form>
        <StyledInput
          onKeyPress={handleKeyPress}
          onChange={handleChange}
          value={state.userInput}
        />
      </form>
    </Container>
  );
};
