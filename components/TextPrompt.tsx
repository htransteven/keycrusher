import React, {
  ChangeEventHandler,
  KeyboardEventHandler,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import styled, { useTheme } from "styled-components";
import ResetIcon from "../assets/arrows-rotate-solid.svg";

const WORD_GAP = "0.35rem";
const FONT_SIZE = "1.5rem";

const Container = styled.div`
  position: relative;
`;

const Cursor = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.textPrompt.cursorColor};

  transition: 0.1s all;
`;

const TemplateBoxWrapper = styled.div`
  padding: 20px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  background-color: ${({ theme }) => theme.textPrompt.backgroundColor};
  margin-bottom: 10px;
  border-radius: 3px;
`;

const TemplateBox = styled.div`
  height: calc((2 * ${FONT_SIZE}) + 15px);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: ${WORD_GAP} calc(${WORD_GAP} * 1.5);
  color: ${({ theme }) => theme.textPrompt.textColor};
`;

const TemplateCharacter = styled.span<{ color: string }>`
  padding-left: 2px;
  transition: 0.15s all;
  font-size: ${FONT_SIZE};

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
  font-size: ${FONT_SIZE};
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
  font-size: ${FONT_SIZE};
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
  top: number | string;
  left: number | string;
  width: number | string;
  height: number | string;
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
  teleprompt: {
    elem: HTMLDivElement | null;
    scrollOffsetY: number;
    fetchWords: number;
    lineStartWordIndex: number;
    totalWords: number;
  };
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

const INITIAL_STATE: TextPromptState = {
  active: false,
  wpm: 0,
  timer: 60,
  teleprompt: {
    elem: null,
    scrollOffsetY: 0,
    fetchWords: 50,
    lineStartWordIndex: 0,
    totalWords: 0,
  },
  telemetry: {
    numCorrect: 0,
    numErrors: 0,
    history: {},
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
  ADD_WORDS = "ADD_WORDS",
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
  payload: {
    telepromptRef: HTMLDivElement;
  };
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

interface TextPromptAddWordsAction {
  type: TEXT_PROMPT_ACTIONS.ADD_WORDS;
  payload: {
    words: string[];
  };
}

interface TextPromptNextWordAction {
  type: TEXT_PROMPT_ACTIONS.NEXT_WORD;
  payload: {
    prevWordElem: HTMLSpanElement | null;
    nextWordElem: HTMLSpanElement | null;
  };
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
  | TextPromptAddWordsAction
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
      return {
        ...state,
        teleprompt: {
          ...state.teleprompt,
          elem: action.payload.telepromptRef,
        },
        active: true,
      };
    case TEXT_PROMPT_ACTIONS.RESET:
      return { ...INITIAL_STATE };
    case TEXT_PROMPT_ACTIONS.TIMER_TICK: {
      if (state.timer <= 0) {
        return {
          ...state,
          active: false,
        };
      }

      // subtract the number of errors for a harsher WPM
      return {
        ...state,
        wpm: Math.round(
          state.telemetry.numCorrect /
            5 /
            ((INITIAL_STATE.timer - state.timer) / 60)
        ),
        timer: state.timer - 1,
      };
    }
    case TEXT_PROMPT_ACTIONS.MOVE_CARET:
      return { ...state, currentCharIndex: action.payload.selectionIndex };
    case TEXT_PROMPT_ACTIONS.ADD_WORDS:
      const baseWordIndex = Object.keys(state.telemetry.history).length;
      return {
        ...state,
        teleprompt: {
          ...state.teleprompt,
          totalWords: state.teleprompt.totalWords + action.payload.words.length,
          fetchWords: 0,
        },
        telemetry: {
          ...state.telemetry,
          history: {
            ...state.telemetry.history,
            ...action.payload.words.reduce(
              (wordAcc, word, wordIndex) => ({
                ...wordAcc,
                [baseWordIndex + wordIndex]: word.split("").reduce(
                  (charAcc, char, charIndex) => ({
                    ...charAcc,
                    [charIndex]: { char },
                  }),
                  {}
                ),
              }),
              {}
            ),
          },
        },
      };
    case TEXT_PROMPT_ACTIONS.NEXT_WORD: {
      if (
        action.payload.nextWordElem &&
        action.payload.nextWordElem?.offsetTop !==
          action.payload.prevWordElem?.offsetTop
      ) {
        // new line
        return {
          ...state,
          teleprompt: {
            ...state.teleprompt,
            scrollOffsetY: action.payload.nextWordElem?.offsetTop,
            fetchWords: Math.floor(
              (state.currentWordIndex - state.teleprompt.lineStartWordIndex) *
                1.5
            ),
            lineStartWordIndex: state.currentWordIndex + 1,
          },
          userInput: "",
          currentWordIndex: state.currentWordIndex + 1,
          currentCharIndex: 0,
        };
      }

      return {
        ...state,
        userInput: "",
        currentWordIndex: state.currentWordIndex + 1,
        currentCharIndex: 0,
      };
    }
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

      const correctChar =
        state.telemetry.history[state.currentWordIndex][state.currentCharIndex]
          .char;
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
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [telepromptRef, setTelepromptRef] = useState<HTMLDivElement | null>(
    null
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [wordRef, setWordRef] = useState<HTMLSpanElement | null>(null);
  const [charRef, setCharRef] = useState<HTMLSpanElement | null>(null);
  const [nextWordRef, setNextWordRef] = useState<HTMLSpanElement | null>(null);
  const [startRTT, setStartRTT] = useState(0);
  const [resetSpinCounter, setResetSpinCounter] = useState(0);

  useEffect(() => {
    const handleGlobalReset = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;

      switch (e.key) {
        case " ": {
          dispatch({ type: TEXT_PROMPT_ACTIONS.RESET });
          setTimeout(() => inputRef?.current?.focus(), 100);
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
  }, [inputRef.current]);

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

  useEffect(() => {
    if (state.teleprompt.fetchWords === 0) return;

    const getMoreWords = async () => {
      const res = await fetch(
        `/api/words?count=${state.teleprompt.fetchWords}`
      );

      if (!res.ok) {
        console.log("failed to get more words");
        return;
      }

      dispatch({
        type: TEXT_PROMPT_ACTIONS.ADD_WORDS,
        payload: {
          words: (await res.json()) as string[],
        },
      });
    };

    getMoreWords();
  }, [state.teleprompt.fetchWords]);

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
        width:
          style === "block" ? (endOfWord ? WORD_GAP : elem.offsetWidth) : 2,
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
        if (!telepromptRef) return;
        dispatch({
          type: TEXT_PROMPT_ACTIONS.START,
          payload: { telepromptRef },
        });
        setStartRTT(window.performance.now());
      }
      const target = e.target as HTMLInputElement;
      const selectionStart = target.selectionStart || 0;

      if (target.value.charAt(target.value.length - 1) === " ") {
        if (target.value === " ") return;
        dispatch({
          type: TEXT_PROMPT_ACTIONS.NEXT_WORD,
          payload: {
            prevWordElem: wordRef,
            nextWordElem: nextWordRef,
          },
        });
      } else if (
        target.value.length >
        Object.keys(state.telemetry.history[state.currentWordIndex]).length
      ) {
        return;
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
    [state.active, nextWordRef]
  );

  const onWordRefChange = useCallback(
    (elem, wordIndex) => {
      if (state.currentWordIndex === wordIndex) {
        setWordRef(elem);
      }
      if (state.currentWordIndex + 1 === wordIndex) {
        setNextWordRef(elem);
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
      <TemplateBoxWrapper>
        <TemplateBox ref={(node) => setTelepromptRef(node)}>
          {cursorPosition && <Cursor style={cursorPosition} />}
          {Object.keys(state.telemetry.history).map((wKey, wIndex) =>
            wIndex >= state.teleprompt.lineStartWordIndex ? (
              <TemplateWord
                key={`template-${wIndex}`}
                ref={(elem) => onWordRefChange(elem, wIndex)}
              >
                {Object.keys(state.telemetry.history[wKey]).map(
                  (cKey, cIndex) => (
                    <TemplateCharacter
                      key={`template-${wIndex}-${cIndex}`}
                      ref={(elem) => onCharRefChange(elem, wIndex, cIndex)}
                      color={getCharacterCorrectness(wIndex, cIndex)}
                    >
                      {state.telemetry.history[wKey][cKey].char}
                    </TemplateCharacter>
                  )
                )}
              </TemplateWord>
            ) : null
          )}
        </TemplateBox>
      </TemplateBoxWrapper>
      <ControlBox>
        <InputWrapper>
          <StyledInput
            ref={inputRef}
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
          {state.wpm > 0 ? state.wpm : "0"} WPM
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
