import type { AppProps } from "next/app";
import { FirebaseProvider } from "../contexts/FirebaseContext";
import { createGlobalStyle, ThemeProvider } from "styled-components";
import { DARK_THEME } from "../styles/themes/darkTheme";
import { BREAKPOINTS } from "../styles/breakpoints";
import { PageWrapper } from "../components/PageWrapper";
import { UserProvider } from "../contexts/UserContext";
import { NavHeightProvider } from "../contexts/NavHeightContext";

const GlobalStyle = createGlobalStyle`
  * {
    font-family: 'Roboto', sans-serif;
    box-sizing: border-box;
  }

  html {
    margin: 0;
    padding: 0;
    color: ${({ theme }) => theme.primaryTextColor};
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

  body {
    margin: 0;
    padding: 0;
  }

  input, button {
    border: none;
  }

  span, input {
    font-size: 1rem;
  }

  h2 {
    font-weight: 500;
    color: ${({ theme }) => theme.primaryTextColor};
  }
  h3 {
    font-weight: 500;
    color: ${({ theme }) => theme.primaryTextColor};
  }

  p, a {
    margin: 0;
  }
  p {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.tertiaryTextColor};
  }
  a {
    font-size: 1rem;
    text-decoration: none;
    color: ${({ theme }) => theme.green};
  }

  li {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.tertiaryTextColor};
  }
`;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <GlobalStyle theme={DARK_THEME} />
      <ThemeProvider theme={DARK_THEME}>
        <FirebaseProvider>
          <UserProvider>
            <NavHeightProvider>
              <PageWrapper>
                <Component {...pageProps} />
              </PageWrapper>
            </NavHeightProvider>
          </UserProvider>
        </FirebaseProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
