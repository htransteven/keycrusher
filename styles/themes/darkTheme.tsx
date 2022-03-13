export const COLOR_PALLETE = {
  lightGrey: "#2f3943",
  lighterGrey: "#c4c4c4",
  midGrey: "#28303a",
  darkGrey: "#222831",
  grey: "#393E46",
  baseBlue: "#30475E",
  royalBlue: "#2A5AC7",
  error: "#F05454",
  correct: "#29C7AC",
  test: "#BFF2E9",
  white: "#f2f2f2",
  offwhite: "#DDDDDD",
  translucent: {
    blue: "rgba(130, 208, 255, 0.5)",
  },
  transparent: "transparent",
};

export const DARK_THEME = {
  htmlBackgroundColor: COLOR_PALLETE.darkGrey,
  primaryTextColor: COLOR_PALLETE.white,
  secondaryTextColor: COLOR_PALLETE.offwhite,
  tertiaryTextColor: COLOR_PALLETE.lighterGrey,
  greenAccent: COLOR_PALLETE.correct,
  blueAccent: COLOR_PALLETE.baseBlue,
  redAccent: COLOR_PALLETE.error,
  navbar: {
    primaryTextColor: COLOR_PALLETE.white,
    accentColor: COLOR_PALLETE.correct,
    backgroundColor: COLOR_PALLETE.midGrey,
    appTitle: {
      keyColor: COLOR_PALLETE.offwhite,
      keyBackgroundColor: COLOR_PALLETE.baseBlue,
      crusherColor: COLOR_PALLETE.correct,
    },
    alphaIndicatorColor: COLOR_PALLETE.error,
    betaIndicatorColor: COLOR_PALLETE.royalBlue,
  },
  profile: {
    keycard: {
      backgroundColor: COLOR_PALLETE.lightGrey,
      labelColor: COLOR_PALLETE.offwhite,
      textColor: COLOR_PALLETE.white,
    },
    history: {
      backgroundColor: COLOR_PALLETE.midGrey,
      textColor: COLOR_PALLETE.white,
      secondaryTextColor: COLOR_PALLETE.offwhite,
      dividerColor: COLOR_PALLETE.correct,
      hover: {
        backgroundColor: COLOR_PALLETE.baseBlue,
      },
    },
  },
  tooltip: {
    backgroundColor: COLOR_PALLETE.baseBlue,
    textColor: COLOR_PALLETE.offwhite,
    borderColor: COLOR_PALLETE.offwhite,
  },
  form: {
    errorMessageColor: COLOR_PALLETE.error,
    input: {
      labelColor: COLOR_PALLETE.offwhite,
      textColor: COLOR_PALLETE.white,
      backgroundColor: COLOR_PALLETE.darkGrey,
      borderColor: COLOR_PALLETE.lightGrey,
      active: {
        labelColor: COLOR_PALLETE.correct,
        borderColor: COLOR_PALLETE.correct,
        backgroundColor: COLOR_PALLETE.midGrey,
      },
    },
    button: {
      variants: {
        disabled: {
          backgroundColor: COLOR_PALLETE.lightGrey,
          textColor: COLOR_PALLETE.lighterGrey,
          borderColor: COLOR_PALLETE.lighterGrey,
        },
        default: {
          backgroundColor: COLOR_PALLETE.correct,
          textColor: COLOR_PALLETE.white,
          borderColor: COLOR_PALLETE.transparent,
        },
        default_inverse: {
          backgroundColor: COLOR_PALLETE.transparent,
          textColor: COLOR_PALLETE.correct,
          borderColor: COLOR_PALLETE.correct,
          hover: {
            backgroundColor: COLOR_PALLETE.correct,
            textColor: COLOR_PALLETE.white,
          },
        },
        neutral: {
          backgroundColor: COLOR_PALLETE.lightGrey,
          textColor: COLOR_PALLETE.white,
          borderColor: COLOR_PALLETE.transparent,
        },
        neutral_inverse: {
          backgroundColor: COLOR_PALLETE.transparent,
          textColor: COLOR_PALLETE.white,
          borderColor: COLOR_PALLETE.lightGrey,
          hover: {
            backgroundColor: COLOR_PALLETE.lightGrey,
            textColor: COLOR_PALLETE.white,
          },
        },
        negative: {
          backgroundColor: COLOR_PALLETE.error,
          textColor: COLOR_PALLETE.white,
          borderColor: COLOR_PALLETE.transparent,
        },
        negative_inverse: {
          backgroundColor: COLOR_PALLETE.transparent,
          textColor: COLOR_PALLETE.error,
          borderColor: COLOR_PALLETE.error,
          hover: {
            backgroundColor: COLOR_PALLETE.error,
            textColor: COLOR_PALLETE.white,
          },
        },
        helper: {
          backgroundColor: COLOR_PALLETE.transparent,
          textColor: COLOR_PALLETE.offwhite,
          borderColor: COLOR_PALLETE.transparent,
        },
      },
    },
  },
  keyCap: {
    textColor: COLOR_PALLETE.darkGrey,
    backgroundColor: COLOR_PALLETE.offwhite,
    pressed: {
      backgroundColor: COLOR_PALLETE.correct,
    },
  },
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
      },
    },
  },
  graphs: {
    info: {
      title: {
        textColor: COLOR_PALLETE.white,
        accent: COLOR_PALLETE.correct,
      },
      description: {
        textColor: COLOR_PALLETE.lighterGrey,
      },
    },
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
  challengeSummary: {
    backgroundColor: COLOR_PALLETE.transparent,
    labelColor: COLOR_PALLETE.offwhite,
    valueColor: COLOR_PALLETE.correct,
    borderColor: COLOR_PALLETE.correct,
  },
};
