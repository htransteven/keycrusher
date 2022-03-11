import "../styles/globals.css";
import type { AppProps } from "next/app";
import { FirebaseProvider } from "../contexts/FirebaseContext";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { DARK_THEME } from "../styles/themes/darkTheme";
import { BREAKPOINTS } from "../styles/breakpoints";

const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
    margin:0;
    padding: 0;
    background-color: ${({ theme }) => theme.htmlBackgroundColor};
    @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
      font-size: 12px;
    }
    
    @media only screen and (min-width: ${BREAKPOINTS.mobile}) {
      font-size: 13px;
    }

    @media only screen and (min-width: ${BREAKPOINTS.tablet}) {
      font-size: 14px;
    }

    @media only screen and (min-width: ${BREAKPOINTS.tabletLarge}) {
      font-size: 15px;
    }

    @media only screen and (min-width: ${BREAKPOINTS.desktop}) {
      font-size: 16px;
    }
  }

  * {
    font-family: 'Roboto', sans-serif;
  }

  span, input {
    font-size: 1rem;
  }
`;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalStyle theme={DARK_THEME} />
      <ThemeProvider theme={DARK_THEME}>
        <FirebaseProvider>
          <Component {...pageProps} />
        </FirebaseProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
