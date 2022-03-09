export const COLOR_PALLETE = {
  lightGrey: "#2f3943",
  darkGrey: "#222831",
  grey: "#393E46",
  navyBlue: "#162447",
  baseBlue: "#30475E",
  midnightBlue: "#1B1B2F",
  error: "#FF4C29",
  correct: "#29C7AC",
  white: "#f2f2f2",
  offwhite: "#DDDDDD",
  translucent: {
    blue: "rgba(130, 208, 255, 0.5)",
  },
};

export const DARK_THEME = {
  htmlBackgroundColor: COLOR_PALLETE.darkGrey,
  textPrompt: {
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
};
