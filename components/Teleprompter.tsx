import Link from "next/link";
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
import { useFirebase } from "../contexts/FirebaseContext";
import {
  ChallengeMode,
  ChallengeSummary,
  ChallengeTimeData,
} from "../models/ChallengeSummary";
import { Telemetry } from "../models/Telemetry";
import { BREAKPOINTS } from "../styles/breakpoints";
import { KeyCap } from "./Keycap";

const WORD_GAP = "0.35rem";
const FONT_SIZE = "1.5rem";

const Container = styled.div`
  position: relative;
`;

const Cursor = styled.div`
  position: absolute;
  background-color: ${({ theme }) => theme.teleprompt.cursorColor};

  transition: 0.1s all;
`;

const TeleprompterWrapper = styled.div`
  position: relative;
  padding: 20px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  background-color: ${({ theme }) => theme.teleprompt.backgroundColor};
  margin-bottom: 10px;
  border-radius: 3px;
  overflow: hidden;
`;

const TeleprompterCover = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  padding: 20px;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.teleprompt.textColor};
  font-size: ${FONT_SIZE};

  background-color: ${({ theme }) => theme.teleprompt.backgroundColor};
`;

const TeleprompterBox = styled.div`
  height: calc((2 * ${FONT_SIZE}) + 15px);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: flex-start;
  gap: ${WORD_GAP} calc(${WORD_GAP} * 1.5);
  color: ${({ theme }) => theme.teleprompt.textColor};
`;

const TelepromptCharacter = styled.span<{ color: string }>`
  padding-left: 2px;
  transition: 0.15s all;
  font-size: ${FONT_SIZE};

  color: ${({ color }) => color};
`;

const TelepromptWord = styled.span`
  & > ${TelepromptCharacter}:last-of-type {
    padding-right: 2px;
  }
`;

const ControlBox = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const TelepromptStatus = styled.span`
  display: flex;
  flex-flow: row wrap;
  gap: 10px;
`;

const TelepromptStatusData = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  padding: 5px 10px;
  border-radius: 3px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;

  color: ${({ theme }) => theme.teleprompt.textColor};
  background-color: ${({ theme }) => theme.teleprompt.input.backgroundColor};
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
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

  background-color: ${({ theme }) => theme.teleprompt.input.backgroundColor};
  color: ${({ theme }) => theme.teleprompt.textColor};

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
  color: ${({ theme }) => theme.teleprompt.input.instructions.textColor};

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    display: none;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-radius: 3px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  color: ${({ theme }) => theme.teleprompt.textColor};
  background-color: ${({ theme }) => theme.teleprompt.input.backgroundColor};
`;

type CursorStyle = "line" | "block";

interface CursorPosition {
  style: CursorStyle;
  top: number | string;
  left: number | string;
  width: number | string;
  height: number | string;
}

export interface TeleprompterState {
  mode: ChallengeMode;
  challengeDuration: number; // seconds
  active: boolean;
  wpm: number;
  time: ChallengeTimeData;
  teleprompter: {
    fetchWords: number;
    lineStartWordIndex: number;
  };
  telemetry: Telemetry;
  userInput: string;
  currentWordIndex: number;
  currentCharIndex: number;
  prevPerformanceTime: number;
  cursor: CursorPosition;
}

const INITIAL_STATE: TeleprompterState = {
  mode: "default",
  active: false,
  wpm: 0,
  challengeDuration: 30,
  time: {
    unix: {
      startTime: 0,
      endTime: 0,
    },
    performance: {
      startTime: 0,
      endTime: 0,
    },
  },
  teleprompter: {
    fetchWords: 50,
    lineStartWordIndex: 0,
  },
  telemetry: {
    numCorrect: 0,
    numErrors: 0,
    history: {},
  },
  userInput: "",
  currentWordIndex: 0,
  currentCharIndex: 0,
  prevPerformanceTime: 0,
  cursor: {
    style: "line",
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  },
};

enum TEXT_PROMPT_ACTIONS {
  START = "START",
  END = "END",
  UPDATE_WPM = "UPDATE_WPM",
  ADD_WORDS = "ADD_WORDS",
  MOVE_CARET = "MOVE_CARET",
  NEXT_WORD = "NEXT_WORD",
  INPUT_CHANGE = "INPUT_CHANGE",
  TIMER_TICK = "TIMER_TICK",
  RESET = "RESET",
}

interface TeleprompteStartAction {
  type: TEXT_PROMPT_ACTIONS.START;
}

interface TeleprompteEndAction {
  type: TEXT_PROMPT_ACTIONS.END;
}

interface TeleprompteUpdateWPMAction {
  type: TEXT_PROMPT_ACTIONS.UPDATE_WPM;
}

interface TeleprompterTimerTickAction {
  type: TEXT_PROMPT_ACTIONS.TIMER_TICK;
}

interface TeleprompterTimerResetAction {
  type: TEXT_PROMPT_ACTIONS.RESET;
}

interface TeleprompterMoveCaretAction {
  type: TEXT_PROMPT_ACTIONS.MOVE_CARET;
  payload: {
    selectionIndex: number;
  };
}

interface TeleprompterAddWordsAction {
  type: TEXT_PROMPT_ACTIONS.ADD_WORDS;
  payload: {
    words: string[];
  };
}

interface TeleprompterNextWordAction {
  type: TEXT_PROMPT_ACTIONS.NEXT_WORD;
  payload: {
    prevWordElem: HTMLSpanElement | null;
    nextWordElem: HTMLSpanElement | null;
  };
}

interface TeleprompterInputChangeAction {
  type: TEXT_PROMPT_ACTIONS.INPUT_CHANGE;
  payload: {
    value: string;
    selectionIndex: number;
    key?: string;
    currentPerformanceTime: number;
  };
}

type TeleprompterAction =
  | TeleprompteStartAction
  | TeleprompteEndAction
  | TeleprompteUpdateWPMAction
  | TeleprompterAddWordsAction
  | TeleprompterTimerTickAction
  | TeleprompterTimerResetAction
  | TeleprompterMoveCaretAction
  | TeleprompterNextWordAction
  | TeleprompterInputChangeAction;

const reducer = (
  state: TeleprompterState,
  action: TeleprompterAction
): TeleprompterState => {
  switch (action.type) {
    case TEXT_PROMPT_ACTIONS.START:
      const performanceNow = window.performance.now();
      return {
        ...state,
        active: true,
        teleprompter: {
          ...state.teleprompter,
        },
        time: {
          unix: {
            startTime: Date.now(),
            endTime: 0,
          },
          performance: {
            startTime: performanceNow,
            endTime: 0,
          },
        },
        prevPerformanceTime: performanceNow,
      };
    case TEXT_PROMPT_ACTIONS.RESET:
      return { ...INITIAL_STATE, mode: state.mode };
    case TEXT_PROMPT_ACTIONS.END: {
      const performanceNow = window.performance.now();
      return {
        ...state,
        active: false,
        userInput: "",
        time: {
          unix: {
            startTime: state.time.unix.startTime,
            endTime: Date.now(),
          },
          performance: {
            startTime: state.time.performance.startTime,
            endTime: performanceNow,
          },
        },
        challengeDuration:
          state.mode === "daily"
            ? performanceNow - state.time.performance.startTime
            : state.challengeDuration,
      };
    }
    case TEXT_PROMPT_ACTIONS.UPDATE_WPM:
      return {
        ...state,
        wpm: Math.round(
          state.telemetry.numCorrect /
            5 /
            ((Date.now() - state.time.unix.startTime) / 1000 / 60) //convert milliseconds to minute
        ),
      };
    case TEXT_PROMPT_ACTIONS.MOVE_CARET:
      return { ...state, currentCharIndex: action.payload.selectionIndex };
    case TEXT_PROMPT_ACTIONS.ADD_WORDS:
      const baseWordIndex = Object.keys(state.telemetry.history).length;
      return {
        ...state,
        teleprompter: {
          ...state.teleprompter,
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
                    [charIndex]: { char, correct: false, rtt: 0 },
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
          teleprompter: {
            ...state.teleprompter,
            fetchWords: Math.floor(
              (state.currentWordIndex - state.teleprompter.lineStartWordIndex) *
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
              history: {
                ...state.telemetry.history,
                [state.currentWordIndex]: {
                  ...state.telemetry.history[state.currentWordIndex],
                  [state.currentCharIndex]: {
                    ...state.telemetry.history[state.currentWordIndex][
                      state.currentCharIndex
                    ],
                    correct: false,
                    rtt: 0,
                  },
                },
              },
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
        rtt: Math.round(
          action.payload.currentPerformanceTime - state.prevPerformanceTime
        ),
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
        prevPerformanceTime: action.payload.currentPerformanceTime,
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

interface Teleprompter extends Partial<TeleprompterState> {
  onMoreWords: (wordCount: number) => Promise<string[] | null>;
  onComplete: (state: ChallengeSummary) => void;
  onReset: () => void;
  coverText?: string;
}

export const Teleprompter: React.FC<Teleprompter> = ({
  mode = "default",
  challengeDuration = 30,
  coverText = "Ready for the challenge?",
  onMoreWords,
  onComplete,
  onReset,
  ...stateOverride
}) => {
  const theme = useTheme();
  const { firebaseUser } = useFirebase();
  const [state, dispatch] = useReducer(reducer, {
    ...INITIAL_STATE,
    mode,
    challengeDuration: mode === "daily" ? -1 : challengeDuration,
    ...stateOverride,
  });
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [wordRef, setWordRef] = useState<HTMLSpanElement | null>(null);
  const [charRef, setCharRef] = useState<HTMLSpanElement | null>(null);
  const [nextWordRef, setNextWordRef] = useState<HTMLSpanElement | null>(null);
  const [coverTimer, setCoverTimer] = useState(4);
  const [challengeTimer, setChallengeTimer] = useState(state.challengeDuration);
  const [resetSpinCounter, setResetSpinCounter] = useState(0);

  const handleReset = useCallback(() => {
    // do not allow resetting on daily challenge
    if (state.mode === "daily") return;
    dispatch({ type: TEXT_PROMPT_ACTIONS.RESET });
    setWordRef(null);
    setCharRef(null);
    setNextWordRef(null);
    setChallengeTimer(INITIAL_STATE.challengeDuration);
    setCoverTimer(4);
    setResetSpinCounter((prev) => prev + 1);
    setTimeout(() => inputRef?.current?.focus(), 100);
    onReset();
  }, [onReset, state.mode]);

  useEffect(() => {
    const handleGlobalReset = (e: KeyboardEvent) => {
      switch (e.key) {
        case " ": {
          if (e.ctrlKey) {
            handleReset();
          } else {
            if (state.time.unix.endTime !== 0 || coverTimer !== 4) return;
            setCoverTimer(3);
            setTimeout(() => inputRef?.current?.focus(), 100);
          }
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
  }, [coverTimer, handleReset]);

  // Teleprompt cover interval timer
  useEffect(() => {
    if (coverTimer >= 4 || coverTimer <= 0) return;
    const interval = setInterval(() => {
      if (coverTimer === 1) {
        dispatch({
          type: TEXT_PROMPT_ACTIONS.START,
        });
      }
      setCoverTimer((prev) => --prev);
    }, 1000);

    return () => clearInterval(interval);
  }, [state.active, coverTimer]);

  // Challenge interval timer, update WPM
  // Even if mode is set to "daily", the interval timer is still used to update WPM
  useEffect(() => {
    if (!state.active) return;
    const timerTick = setInterval(() => {
      if (challengeTimer === 0) {
        dispatch({
          type: TEXT_PROMPT_ACTIONS.END,
        });
        return;
      }
      dispatch({
        type: TEXT_PROMPT_ACTIONS.UPDATE_WPM,
      });
      setChallengeTimer((prev) => --prev);
    }, 1000);

    return () => {
      clearInterval(timerTick);
    };
  }, [challengeTimer, state.active, state.mode]);

  // Fetch words
  useEffect(() => {
    if (state.mode === "default" && state.teleprompter.fetchWords === 0) {
      return;
    }
    if (
      state.mode === "daily" &&
      Object.keys(state.telemetry.history).length > 0
    ) {
      return;
    }

    const loadWords = async () => {
      const newWords = await onMoreWords(state.teleprompter.fetchWords);
      if (!newWords) {
        return;
      }

      dispatch({
        type: TEXT_PROMPT_ACTIONS.ADD_WORDS,
        payload: {
          words: newWords,
        },
      });
    };

    loadWords();
  }, [
    onMoreWords,
    state.mode,
    state.telemetry.history,
    state.teleprompter.fetchWords,
  ]);

  // use onComplete
  useEffect(() => {
    if (state.time.performance.endTime !== 0) {
      onComplete({
        mode: state.mode,
        challengeDuration: state.challengeDuration,
        telemetry: state.telemetry,
        time: state.time,
        wpm: state.wpm,
      });
    }
  }, [
    onComplete,
    state.challengeDuration,
    state.mode,
    state.telemetry,
    state.time,
    state.time.performance.endTime,
    state.wpm,
  ]);

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
      const target = e.target as HTMLInputElement;
      const selectionStart = target.selectionStart || 0;

      if (target.value.charAt(target.value.length - 1) === " ") {
        if (target.value === " ") {
          // begin countdown if not yet started
          if (coverTimer !== 4) return;
          setCoverTimer(3);
          return;
        }
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
        if (!state.active) return;
        dispatch({
          type: TEXT_PROMPT_ACTIONS.INPUT_CHANGE,
          payload: {
            value: target.value,
            selectionIndex: selectionStart,
            key: key === null ? undefined : key,
            currentPerformanceTime: window.performance.now(),
          },
        });
        // detect end of daily challenge
        if (
          state.mode === "daily" &&
          !nextWordRef &&
          target.value.length ===
            Object.keys(state.telemetry.history[state.currentWordIndex]).length
        ) {
          dispatch({
            type: TEXT_PROMPT_ACTIONS.END,
          });
        }
      }
    },
    [
      coverTimer,
      nextWordRef,
      state.active,
      state.currentWordIndex,
      state.mode,
      state.telemetry.history,
      wordRef,
    ]
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
        return theme.teleprompt.textColor;
      } else if (wordIndex < state.currentWordIndex) {
        // previous words
        return state.telemetry.history[wordIndex][charIndex].correct
          ? theme.teleprompt.correct
          : theme.teleprompt.error;
      } else {
        //current word
        if (charIndex > state.currentCharIndex) {
          // upcoming characters
          return theme.teleprompt.textColor;
        } else if (charIndex < state.currentCharIndex) {
          // previous characters
          return state.telemetry.history[wordIndex][charIndex].correct
            ? theme.teleprompt.correct
            : theme.teleprompt.error;
        } else {
          //current character
          return theme.teleprompt.textColor;
        }
      }
    },
    [
      state.currentWordIndex,
      state.telemetry.history,
      state.currentCharIndex,
      theme.teleprompt.textColor,
      theme.teleprompt.correct,
      theme.teleprompt.error,
    ]
  );

  const getPlaceHolderText = () => {
    if (state.active) {
      return "";
    } else {
      if (state.mode === "default") {
        if (state.time.unix.endTime !== 0) {
          return "Press CTRL + SPACE to restart";
        } else {
          return "Press SPACE to start";
        }
      } else {
        if (state.time.unix.endTime === 0) {
          return "Press SPACE to start";
        }
      }
      return "";
    }
  };

  return (
    <Container>
      <TeleprompterWrapper>
        <TeleprompterBox>
          {cursorPosition && <Cursor style={cursorPosition} />}
          {Object.keys(state.telemetry.history).map((wKey, wIndex) =>
            wIndex >= state.teleprompter.lineStartWordIndex ? (
              <TelepromptWord
                key={`teleprompt-${wIndex}`}
                ref={(elem) => onWordRefChange(elem, wIndex)}
              >
                {Object.keys(state.telemetry.history[wKey]).map(
                  (cKey, cIndex) => (
                    <TelepromptCharacter
                      key={`teleprompt-${wIndex}-${cIndex}`}
                      ref={(elem) => onCharRefChange(elem, wIndex, cIndex)}
                      color={getCharacterCorrectness(wIndex, cIndex)}
                    >
                      {state.telemetry.history[wKey][cKey].char}
                    </TelepromptCharacter>
                  )
                )}
              </TelepromptWord>
            ) : null
          )}
        </TeleprompterBox>
        {coverTimer > 0 && (
          <TeleprompterCover>
            {coverTimer > 3 ? coverText : `Start in ${coverTimer}...`}
          </TeleprompterCover>
        )}
      </TeleprompterWrapper>
      <ControlBox>
        <InputWrapper>
          <StyledInput
            ref={inputRef}
            onKeyUp={handleKeyUp}
            onChange={handleChange}
            value={state.userInput}
            placeholder={getPlaceHolderText()}
            disabled={state.time.unix.endTime !== 0}
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            autoCapitalize="off"
          />
          <InputInstruction
            style={{
              display: state.active ? "none" : "",
            }}
          >
            {state.time.unix.endTime === 0 && coverTimer > 3 ? (
              <>
                Press <KeyCap value="Space" /> to start
              </>
            ) : (
              state.mode !== "daily" && (
                <>
                  Press <KeyCap value="Ctrl" /> + <KeyCap value="Space" /> to
                  restart
                </>
              )
            )}
          </InputInstruction>
        </InputWrapper>
        <IconWrapper
          onClick={handleReset}
          style={state.mode === "daily" ? { opacity: 0.5 } : {}}
        >
          <ResetIcon
            style={{
              height: "2rem",
              width: "2rem",
              transition: "0.3s all",
              transform: `rotate(calc(180deg * ${resetSpinCounter}))`,
            }}
          />
        </IconWrapper>
      </ControlBox>
      <TelepromptStatus>
        {state.active && (
          <>
            <TelepromptStatusData>
              {state.wpm < 100 ? "0" : ""}
              {state.wpm < 10 ? "0" : ""}
              {isFinite(state.wpm) ? state.wpm : "0"} WPM
            </TelepromptStatusData>
            {state.mode === "default" && (
              <TelepromptStatusData>
                {challengeTimer < 10 ? "0" : ""}
                {challengeTimer}s left
              </TelepromptStatusData>
            )}
          </>
        )}
        {!firebaseUser && (
          <Link href={"/profile"} passHref>
            <TelepromptStatusData
              style={{
                backgroundColor: theme.teleprompt.error,
                cursor: "pointer",
                whiteSpace: "normal",
              }}
            >
              Click here to login and save your attempts!
            </TelepromptStatusData>
          </Link>
        )}
      </TelepromptStatus>
    </Container>
  );
};
