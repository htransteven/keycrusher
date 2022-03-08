import "../styles/globals.css";
import type { AppProps } from "next/app";
import { FirebaseProvider } from "./contexts/FirebaseContext";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { DARK_THEME } from "../styles/themes/darkTheme";

const GlobalStyle = createGlobalStyle`
  html {
    box-sizing: border-box;
    margin:0;
    padding: 0;
  }

  * {
    font-family: 'Roboto', sans-serif;
  }

  span, textarea {
    font-size: 14px;
  }

  textarea {
    padding: 0;
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
