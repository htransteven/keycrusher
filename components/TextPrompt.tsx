import { stat } from "fs";
import React, {
  ChangeEventHandler,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from "react";
import styled, { useTheme } from "styled-components";
import ResetIcon from "../assets/arrows-rotate-solid.svg";

const Container = styled.div`
  position: relative;
`;

const Cursor = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.textPrompt.cursorColor};

  transition: 0.15s all;
`;

const TemplateBox = styled.div`
  position: relative;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 0.35rem;
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 3px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  background-color: ${({ theme }) => theme.textPrompt.backgroundColor};
  color: ${({ theme }) => theme.textPrompt.textColor};
`;

const TemplateCharacter = styled.span<{ color: string }>`
  padding-left: 2px;
  transition: 0.15s all;
  font-size: 1.5rem;

  color: ${({ color }) => color};
`;

const TemplateWord = styled.span`
  & > ${TemplateCharacter}:last-of-type {
    padding-right: 2px;
  }
`;

const ControlBox = styled.div`
  display: grid;
  grid-template-columns: 1fr auto auto;
  grid-gap: 10px;
`;

const InputWrapper = styled.div`
  position: relative;
`;

const StyledInput = styled.input`
  font-size: 1.5rem;
  height: 100%;
  width: 100%;
  outline: none;
  border: none;
  padding: 20px;
  border-radius: 3px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;

  background-color: ${({ theme }) => theme.textPrompt.input.backgroundColor};
  color: ${({ theme }) => theme.textPrompt.textColor};

  &:disabled {
    opacity: 0.5;
  }
`;

const InputInstruction = styled.div`
  font-size: 0.8rem;
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: ${({ theme }) => theme.textPrompt.input.instructions.textColor};
`;

const KeyCap = styled.span`
  font-size: 0.8rem;
  padding: 4px 12px;
  border-radius: 3px;
  background-color: ${({ theme }) =>
    theme.textPrompt.input.instructions.keyCap.backgroundColor};
  color: ${({ theme }) => theme.textPrompt.input.instructions.keyCap.textColor};
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
`;

const Timer = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  padding: 20px;
  border-radius: 3px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;

  background-color: ${({ theme }) => theme.textPrompt.input.backgroundColor};
  color: ${({ theme }) => theme.textPrompt.textColor};
`;

const IconWrapper = styled.div`
  height: 100%;
  width: 100%;
  padding: 20px;
  border-radius: 3px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  color: ${({ theme }) => theme.textPrompt.textColor};
  background-color: ${({ theme }) => theme.textPrompt.input.backgroundColor};
`;

interface TextPrompt {}

type CursorStyle = "line" | "block";

interface CursorPosition {
  style: CursorStyle;
  top: number;
  left: number;
  width: number;
  height: number;
}

interface KeyTelemetry {
  char: string;
  rtt?: number;
  correct?: boolean;
}

interface TextPromptState {
  active: boolean;
  timer: number;
  words: string[];
  telemetry: KeyTelemetry[][];
  userInput: string;
  currentWordIndex: number;
  currentCharIndex: number;
  cursor: CursorPosition;
}

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum eget urna odio. Cras sed diam tortor. Maecenas arcu eros, bibendum vel urna ut, congue scelerisque diam. Nullam ac risus a magna porttitor posuere. Integer maximus auctor iaculis. Sed feugiat elit eget magna suscipit, mollis laoreet nunc bibendum. Integer congue est odio, efficitur eleifend libero molestie eu. Integer non sem nec massa consectetur mollis ac id risus. Nulla molestie vulputate eleifend. Aliquam ex tellus, tincidunt a urna vel, dictum mollis leo. Suspendisse a sapien ligula.";

const words = lorem.split(" ");

const initialState: TextPromptState = {
  active: false,
  timer: 60,
  words: words,
  telemetry: words.map((word) => word.split("").map((char) => ({ char }))),
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
  MOVE_CARET = "MOVE_CARET",
  NEXT_WORD = "NEXT_WORD",
  INPUT_CHANGE = "INPUT_CHANGE",
  TIMER_TICK = "TIMER_TICK",
  START = "START",
  RESET = "RESET",
}

interface TextPromptTimerTickAction {
  type: TEXT_PROMPT_ACTIONS.TIMER_TICK;
}

interface TextPromptStartAction {
  type: TEXT_PROMPT_ACTIONS.START;
}

interface TextPromptTimerResetAction {
  type: TEXT_PROMPT_ACTIONS.RESET;
}

interface TextPromptKeyPressAction {
  type: TEXT_PROMPT_ACTIONS.KEY_PRESS;
  payload: {
    key: string;
    rtt: number;
  };
}
interface TextPromptMoveCaretAction {
  type: TEXT_PROMPT_ACTIONS.MOVE_CARET;
  payload: {
    selectionIndex: number;
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
  | TextPromptStartAction
  | TextPromptTimerTickAction
  | TextPromptTimerResetAction
  | TextPromptKeyPressAction
  | TextPromptMoveCaretAction
  | TextPromptNextWordAction
  | TextPromptInputChangeAction;

const reducer = (
  state: TextPromptState,
  action: TextPromptAction
): TextPromptState => {
  switch (action.type) {
    case TEXT_PROMPT_ACTIONS.START:
      return { ...state, active: true };
    case TEXT_PROMPT_ACTIONS.RESET:
      return { ...initialState };
    case TEXT_PROMPT_ACTIONS.TIMER_TICK: {
      if (state.timer <= 0) {
        return {
          ...state,
          active: false,
        };
      }

      return { ...state, timer: state.timer - 1 };
    }
    case TEXT_PROMPT_ACTIONS.MOVE_CARET:
      return { ...state, currentCharIndex: action.payload.selectionIndex };
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
      const copy = [...state.telemetry];
      copy[state.currentWordIndex][state.currentCharIndex] = {
        ...copy[state.currentWordIndex][state.currentCharIndex],
        correct: action.payload.key === correctChar,
        rtt: action.payload.rtt,
      };
      return {
        ...state,
        telemetry: copy,
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
  const theme = useTheme();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [wordRef, setWordRef] = useState<HTMLSpanElement | null>(null);
  const [charRef, setCharRef] = useState<HTMLSpanElement | null>(null);
  const [startRTT, setStartRTT] = useState(0);
  const [resetSpinCounter, setResetSpinCounter] = useState(0);

  useEffect(() => {
    const handleGlobalReset = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;

      switch (e.key) {
        case " ": {
          dispatch({ type: TEXT_PROMPT_ACTIONS.RESET });
          setResetSpinCounter((prev) => prev + 1);
        }
        default: {
          return;
        }
      }
    };

    window.addEventListener("keydown", handleGlobalReset);

    return () => {
      window.removeEventListener("keydown", handleGlobalReset);
    };
  }, []);

  useEffect(() => {
    if (state.active) {
      const timerTick = setTimeout(
        () => dispatch({ type: TEXT_PROMPT_ACTIONS.TIMER_TICK }),
        1000
      );

      return () => {
        clearTimeout(timerTick);
      };
    }
  }, [state.active, state.timer]);

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
        width: style === "block" ? elem.offsetWidth : 2,
        height: elem.offsetHeight,
      };
    },
    []
  );

  const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight" &&
      e.key !== "ArrowUp" &&
      e.key !== "ArrowDown"
    ) {
      return;
    }

    const target = e.target as HTMLInputElement;
    const selectionStart = target.selectionStart || 0;

    dispatch({
      type: TEXT_PROMPT_ACTIONS.MOVE_CARET,
      payload: { selectionIndex: selectionStart },
    });
  };

  const handleKeyPress: KeyboardEventHandler<HTMLInputElement> = (e) => {
    dispatch({
      type: TEXT_PROMPT_ACTIONS.KEY_PRESS,
      payload: {
        key: e.key,
        rtt: window.performance.now() - startRTT,
      },
    });
  };

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const target = e.target as HTMLInputElement;
    const selectionStart = target.selectionStart || 0;

    if (!state.active) {
      dispatch({ type: TEXT_PROMPT_ACTIONS.START });
      setStartRTT(window.performance.now());
    }

    if (target.value.charAt(target.value.length - 1) === " ") {
      dispatch({ type: TEXT_PROMPT_ACTIONS.NEXT_WORD });
    } else {
      dispatch({
        type: TEXT_PROMPT_ACTIONS.INPUT_CHANGE,
        payload: { value: target.value, selectionIndex: selectionStart },
      });
    }
    // figure out a better place to start
    setStartRTT(window.performance.now());
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

  const getCharacterCorrectness = useCallback(
    (wordIndex: number, charIndex: number) => {
      if (
        wordIndex >= state.currentWordIndex &&
        charIndex >= state.currentCharIndex
      ) {
        return theme.textPrompt.textColor;
      }

      if (state.telemetry[wordIndex][charIndex].correct !== undefined) {
        return state.telemetry[wordIndex][charIndex].correct
          ? theme.textPrompt.correct
          : theme.textPrompt.error;
      }

      if (wordIndex < state.currentWordIndex) return theme.textPrompt.error;

      if (charIndex > state.currentCharIndex) {
        return theme.textPrompt.textColor;
      }

      return theme.textPrompt.textColor;
    },
    [state.currentWordIndex, state.currentCharIndex, state.telemetry]
  );

  return (
    <Container>
      <TemplateBox>
        {cursorPosition &&
          state.currentCharIndex <
            state.words[state.currentWordIndex].length && (
            <Cursor style={cursorPosition} />
          )}
        {state.words.map((word, wIndex) => (
          <TemplateWord
            key={`template-${wIndex}`}
            ref={(elem) => onWordRefChange(elem, wIndex)}
          >
            {word.split("").map((character, cIndex) => (
              <TemplateCharacter
                key={`template-${wIndex}-${cIndex}`}
                ref={(elem) => onCharRefChange(elem, wIndex, cIndex)}
                color={getCharacterCorrectness(wIndex, cIndex)}
              >
                {character}
              </TemplateCharacter>
            ))}
          </TemplateWord>
        ))}
      </TemplateBox>
      <ControlBox>
        <InputWrapper>
          <StyledInput
            onKeyUp={handleKeyUp}
            onKeyPress={handleKeyPress}
            onChange={handleChange}
            value={state.userInput}
            placeholder={state.active ? "" : "Type to start challenge!"}
            disabled={state.timer === 0}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            autoCapitalize="off"
          />
          <InputInstruction
            style={{
              display: !state.active ? "" : "none",
            }}
          >
            Press <KeyCap>Ctrl</KeyCap> + <KeyCap>Space</KeyCap> to restart
          </InputInstruction>
        </InputWrapper>
        <Timer>
          {state.timer < 10 ? "0" : ""}
          {state.timer}
        </Timer>
        <IconWrapper
          onClick={() => {
            dispatch({ type: TEXT_PROMPT_ACTIONS.RESET });
            setResetSpinCounter((prev) => prev + 1);
          }}
        >
          <ResetIcon
            style={{
              height: "100%",
              width: "100%",
              transition: "0.3s all",
              transform: `rotate(calc(180deg * ${resetSpinCounter}))`,
            }}
          />
        </IconWrapper>
      </ControlBox>
    </Container>
  );
};
