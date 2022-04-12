export const COLOR_PALLETE = {
  offwhite: "#DDDDDD",
  offblack: "#0e0e0e",
  grey: "#a1a1a1",
  lightGrey: "##bcbcbc",
  lighterGrey: "#dadada",
  midGrey: "#222831",
  darkGrey: "#12141d",
  baseBlue: "#30475E",
  white: "#f2f2f2",
  red: "#F05454",
  green: "#29C7AC",
  blue: "#2a58ff",
  highlight: {
    red: "#ff8080",
    green: "#39ffde",
    blue: "#42baff",
    grey: "#c9c9c9",
  },
  translucent: {
    red: "rgba(255, 70, 70, 0.5)",
    green: "rgba(29, 255, 217, 0.5)",
    blue: "rgba(9, 157, 255, 0.5)",
    grey: "rgba(68, 68, 68, 0.5)",
  },
  transparent: "transparent",
  backgroundLayers: {
    one: "#111111",
    two: "#222222",
    three: "#2e2e2e",
    four: "#272d36",
    five: "#323c4e",
  },
  iconColors: {
    mode: "#ff6ad1",
    streak: "#F05454",
    wpm: "#a179ff",
    correctness: "#ffee79",
    accuracy: "#00cd05",
    responseTime: "#29C7AC",
    duration: "#47baff",
  },
};

export const DARK_THEME = {
  ...COLOR_PALLETE,
  htmlBackgroundColor: COLOR_PALLETE.backgroundLayers.one,
  primaryTextColor: COLOR_PALLETE.offwhite,
  secondaryTextColor: COLOR_PALLETE.lighterGrey,
  tertiaryTextColor: COLOR_PALLETE.grey,
  charts: {
    text: {
      primaryColor: COLOR_PALLETE.offwhite,
      secondaryColor: COLOR_PALLETE.lightGrey,
      tertiaryColor: COLOR_PALLETE.grey,
    },
    data: {
      primary: {
        mainColor: COLOR_PALLETE.green,
        highlightColor: COLOR_PALLETE.highlight.green,
        translucentColor: COLOR_PALLETE.translucent.green,
      },
      secondary: {
        mainColor: COLOR_PALLETE.backgroundLayers.three,
        highlightColor: COLOR_PALLETE.highlight.grey,
        translucentColor: COLOR_PALLETE.translucent.grey,
      },
    },
  },
  dividers: {
    color: COLOR_PALLETE.darkGrey,
  },
  generic: {
    container: {
      backgroundColor: COLOR_PALLETE.darkGrey,
    },
    grid: {
      borderColor: COLOR_PALLETE.grey,
      row: {
        hover: {
          backgroundColor: COLOR_PALLETE.grey,
        },
      },
    },
  },
  navbar: {
    primaryTextColor: COLOR_PALLETE.offwhite,
    accentColor: COLOR_PALLETE.green,
    backgroundColor: COLOR_PALLETE.offblack,
    appTitle: {
      keyColor: COLOR_PALLETE.offwhite,
      keyBackgroundColor: COLOR_PALLETE.baseBlue,
      crusherColor: COLOR_PALLETE.green,
    },
    alphaIndicatorColor: COLOR_PALLETE.red,
    betaIndicatorColor: COLOR_PALLETE.blue,
  },
  profile: {
    keycard: {
      backgroundColor: COLOR_PALLETE.grey,
      labelColor: COLOR_PALLETE.offwhite,
      textColor: COLOR_PALLETE.offwhite,
    },
    history: {
      backgroundColor: COLOR_PALLETE.midGrey,
      textColor: COLOR_PALLETE.offwhite,
      secondaryTextColor: COLOR_PALLETE.offwhite,
      dividerColor: COLOR_PALLETE.green,
      hover: {
        backgroundColor: COLOR_PALLETE.baseBlue,
      },
    },
    userNetwork: {
      userIcon: {
        backgroundColors: [
          "#7A0BC0",
          "#ECB365",
          "#FF4C29",
          "#ED6663",
          "#3282B8",
          "#AD62AA",
          "#8787A3",
        ],
      },
    },
  },
  tooltip: {
    backgroundColor: COLOR_PALLETE.baseBlue,
    textColor: COLOR_PALLETE.offwhite,
    borderColor: COLOR_PALLETE.offwhite,
  },
  form: {
    errorMessageColor: COLOR_PALLETE.red,
    input: {
      labelColor: COLOR_PALLETE.offwhite,
      textColor: COLOR_PALLETE.offwhite,
      backgroundColor: COLOR_PALLETE.darkGrey,
      borderColor: COLOR_PALLETE.grey,
      active: {
        labelColor: COLOR_PALLETE.green,
        borderColor: COLOR_PALLETE.green,
        backgroundColor: COLOR_PALLETE.midGrey,
      },
    },
    button: {
      variants: {
        disabled: {
          backgroundColor: COLOR_PALLETE.grey,
          textColor: COLOR_PALLETE.lightGrey,
          borderColor: COLOR_PALLETE.lightGrey,
        },
        default: {
          backgroundColor: COLOR_PALLETE.green,
          textColor: COLOR_PALLETE.offwhite,
          borderColor: COLOR_PALLETE.transparent,
        },
        default_inverse: {
          backgroundColor: COLOR_PALLETE.transparent,
          textColor: COLOR_PALLETE.green,
          borderColor: COLOR_PALLETE.green,
          hover: {
            backgroundColor: COLOR_PALLETE.green,
            textColor: COLOR_PALLETE.offwhite,
          },
        },
        neutral: {
          backgroundColor: COLOR_PALLETE.grey,
          textColor: COLOR_PALLETE.offwhite,
          borderColor: COLOR_PALLETE.transparent,
        },
        neutral_inverse: {
          backgroundColor: COLOR_PALLETE.transparent,
          textColor: COLOR_PALLETE.offwhite,
          borderColor: COLOR_PALLETE.grey,
          hover: {
            backgroundColor: COLOR_PALLETE.grey,
            textColor: COLOR_PALLETE.offwhite,
          },
        },
        negative: {
          backgroundColor: COLOR_PALLETE.red,
          textColor: COLOR_PALLETE.offwhite,
          borderColor: COLOR_PALLETE.transparent,
        },
        negative_inverse: {
          backgroundColor: COLOR_PALLETE.transparent,
          textColor: COLOR_PALLETE.red,
          borderColor: COLOR_PALLETE.red,
          hover: {
            backgroundColor: COLOR_PALLETE.red,
            textColor: COLOR_PALLETE.offwhite,
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
    textColor: COLOR_PALLETE.offblack,
    backgroundColor: COLOR_PALLETE.offwhite,
    pressed: {
      backgroundColor: COLOR_PALLETE.green,
    },
  },
  teleprompt: {
    backgroundColor: COLOR_PALLETE.backgroundLayers.two,
    textColor: COLOR_PALLETE.offwhite,
    correct: COLOR_PALLETE.green,
    error: COLOR_PALLETE.red,
    cursorColor: COLOR_PALLETE.translucent.blue,
    input: {
      backgroundColor: COLOR_PALLETE.backgroundLayers.two,
      instructions: {
        textColor: COLOR_PALLETE.offwhite,
      },
    },
  },
  graphs: {
    info: {
      title: {
        textColor: COLOR_PALLETE.offwhite,
        accent: COLOR_PALLETE.green,
      },
      description: {
        textColor: COLOR_PALLETE.lightGrey,
      },
    },
    container: {
      backgroundColor: COLOR_PALLETE.midGrey,
    },
    data: {
      default: COLOR_PALLETE.baseBlue,
      active: COLOR_PALLETE.green,
    },
    axis: {
      color: COLOR_PALLETE.offwhite,
    },
    referenceLineColor: COLOR_PALLETE.offwhite,
  },
  challengeSummary: {
    backgroundColor: COLOR_PALLETE.transparent,
    labelColor: COLOR_PALLETE.offwhite,
    valueColor: COLOR_PALLETE.green,
    borderColor: COLOR_PALLETE.green,
  },
};
