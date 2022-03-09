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
  max-height: 300px;
  overflow: auto;
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
  grid-template-columns: 1fr auto auto auto;
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
  wpm: number;
  timer: number;
  words: string[];
  telemetry: {
    numCorrect: number;
    numErrors: number;
    history: {
      [wordIndex: string | number]: {
        [charIndex: string | number]: KeyTelemetry;
      };
    };
  };
  userInput: string;
  currentWordIndex: number;
  currentCharIndex: number;
  cursor: CursorPosition;
}

const lorem =
  "Studying is the main source of knowledge. Books are indeed never failing friends of man. For a mature mind, reading is the greatest source of pleasure and solace to distressed minds. The study of good books ennobles us and broadens our outlook. Therefore, the habit of reading should be cultivated. A student should never confine himself to his schoolbooks only. He should not miss the pleasure locked in the classics, poetry, drama, history, philosophy etc. We can derive benefit from other’s experiences with the help of books. The various sufferings, endurance and joy described in books enable us to have a closer look at human life. They also inspire us to face the hardships of life courageously. Nowadays there are innumerable books and time is scarce. So we should read only the best and the greatest among them. With the help of books we shall be able to make our thinking mature and our life more meaningful and worthwhile.";

const words = lorem.split(" ");

const initialState: TextPromptState = {
  active: false,
  wpm: 0,
  timer: 60,
  words: words,
  telemetry: {
    numCorrect: 0,
    numErrors: 0,
    history: words.reduce(
      (wordAcc, word, wordIndex) => ({
        ...wordAcc,
        [wordIndex]: word
          .split("")
          .reduce(
            (charAcc, char, charIndex) => ({ ...charAcc, [charIndex]: char }),
            {}
          ),
      }),
      {}
    ),
  },
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
    key?: string;
    rtt?: number;
  };
}

type TextPromptAction =
  | TextPromptStartAction
  | TextPromptTimerTickAction
  | TextPromptTimerResetAction
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

      return {
        ...state,
        wpm:
          (state.telemetry.numCorrect / 5 - state.telemetry.numErrors) /
          ((initialState.timer - state.timer) / 60),
        timer: state.timer - 1,
      };
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
    case TEXT_PROMPT_ACTIONS.INPUT_CHANGE: {
      if (!action.payload.key) {
        //assume backspace
        const currentCharCorrect =
          state.telemetry.history[state.currentWordIndex][
            action.payload.selectionIndex
          ].correct;

        if (currentCharCorrect === undefined) {
          return {
            ...state,
            userInput: action.payload.value,
            currentCharIndex: action.payload.selectionIndex,
          };
        } else {
          const numCorrect = currentCharCorrect
            ? state.telemetry.numCorrect - 1
            : state.telemetry.numCorrect;

          const numErrors = !currentCharCorrect
            ? state.telemetry.numErrors - 1
            : state.telemetry.numErrors;

          return {
            ...state,
            userInput: action.payload.value,
            currentCharIndex: action.payload.selectionIndex,
            telemetry: {
              numCorrect,
              numErrors,
              history: { ...state.telemetry.history },
            },
          };
        }
      }
      const correctChar = state.words[state.currentWordIndex].charAt(
        state.currentCharIndex
      );
      const history = { ...state.telemetry.history };
      history[state.currentWordIndex][state.currentCharIndex] = {
        ...history[state.currentWordIndex][state.currentCharIndex],
        correct: action.payload.key === correctChar,
        rtt: action.payload.rtt,
      };

      const numCorrect =
        action.payload.key === correctChar
          ? state.telemetry.numCorrect + 1
          : state.telemetry.numCorrect;

      const numErrors =
        action.payload.key !== correctChar
          ? state.telemetry.numErrors + 1
          : state.telemetry.numErrors;
      return {
        ...state,
        userInput: action.payload.value,
        currentCharIndex: action.payload.selectionIndex,
        telemetry: {
          numCorrect,
          numErrors,
          history,
        },
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
      const timerTick = setInterval(
        () => dispatch({ type: TEXT_PROMPT_ACTIONS.TIMER_TICK }),
        1000
      );

      return () => {
        clearInterval(timerTick);
      };
    }
  }, [state.active]);

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

  const handleKeyUp: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (
        e.key !== "ArrowLeft" &&
        e.key !== "ArrowRight" &&
        e.key !== "ArrowUp" &&
        e.key !== "ArrowDown"
      ) {
        return;
      }

      dispatch({
        type: TEXT_PROMPT_ACTIONS.MOVE_CARET,
        payload: {
          selectionIndex: (e.target as HTMLInputElement).selectionStart || 0,
        },
      });
    },
    []
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      const key = (e.nativeEvent as InputEvent).data;

      if (!state.active) {
        dispatch({ type: TEXT_PROMPT_ACTIONS.START });
        setStartRTT(window.performance.now());
      }
      const target = e.target as HTMLInputElement;
      const selectionStart = target.selectionStart || 0;

      if (target.value.charAt(target.value.length - 1) === " ") {
        dispatch({ type: TEXT_PROMPT_ACTIONS.NEXT_WORD });
      } else {
        dispatch({
          type: TEXT_PROMPT_ACTIONS.INPUT_CHANGE,
          payload: {
            value: target.value,
            selectionIndex: selectionStart,
            key: key === null ? undefined : key,
            rtt: window.performance.now() - startRTT,
          },
        });
        setStartRTT(window.performance.now());
      }
    },
    [state.active]
  );

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
      if (wordIndex > state.currentWordIndex) {
        // upcoming words
        return theme.textPrompt.textColor;
      } else if (wordIndex < state.currentWordIndex) {
        // previous words
        return state.telemetry.history[wordIndex][charIndex].correct
          ? theme.textPrompt.correct
          : theme.textPrompt.error;
      } else {
        //current word
        if (charIndex > state.currentCharIndex) {
          // upcoming characters
          return theme.textPrompt.textColor;
        } else if (charIndex < state.currentCharIndex) {
          // previous characters
          return state.telemetry.history[wordIndex][charIndex].correct
            ? theme.textPrompt.correct
            : theme.textPrompt.error;
        } else {
          //current character
          return theme.textPrompt.textColor;
        }
      }
    },
    [state.telemetry.history, state.currentWordIndex, state.currentCharIndex]
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
          {state.wpm < 100 ? "0" : ""}
          {state.wpm < 10 ? "0" : ""}
          {state.wpm > 0 ? state.wpm.toFixed(0) : "0"} WPM
        </Timer>
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
