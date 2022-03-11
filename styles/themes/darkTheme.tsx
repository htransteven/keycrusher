export const COLOR_PALLETE = {
  lightGrey: "#2f3943",
  midGrey: "#28303a",
  darkGrey: "#222831",
  grey: "#393E46",
  baseBlue: "#30475E",
  royalBlue: "#2A5AC7",
  error: "#FF4C29",
  correct: "#29C7AC",
  test: "#BFF2E9",
  white: "#f2f2f2",
  offwhite: "#DDDDDD",
  translucent: {
    blue: "rgba(130, 208, 255, 0.5)",
  },
};

export const DARK_THEME = {
  htmlBackgroundColor: COLOR_PALLETE.darkGrey,
  appTitle: {
    keyColor: COLOR_PALLETE.offwhite,
    keyBackgroundColor: COLOR_PALLETE.baseBlue,
    crusherColor: COLOR_PALLETE.correct,
  },
  alphaIndicatorColor: COLOR_PALLETE.error,
  betaIndicatorColor: COLOR_PALLETE.royalBlue,
  teleprompt: {
    backgroundColor: COLOR_PALLETE.baseBlue,
    textColor: COLOR_PALLETE.offwhite,
    correct: COLOR_PALLETE.correct,
    error: COLOR_PALLETE.error,
    cursorColor: COLOR_PALLETE.translucent.blue,
    input: {
      backgroundColor: COLOR_PALLETE.lightGrey,
      instructions: {
        textColor: COLOR_PALLETE.offwhite,
        keyCap: {
          textColor: COLOR_PALLETE.darkGrey,
          backgroundColor: COLOR_PALLETE.offwhite,
        },
      },
    },
  },
  graphs: {
    container: {
      backgroundColor: COLOR_PALLETE.midGrey,
    },
    data: {
      default: COLOR_PALLETE.baseBlue,
      active: COLOR_PALLETE.correct,
    },
    axis: {
      color: COLOR_PALLETE.offwhite,
    },
    referenceLineColor: COLOR_PALLETE.white,
  },
};
