import type { NextPage } from "next";
import Head from "next/head";
import styled from "styled-components";
import { Teleprompter } from "../components/Teleprompter";
import { BREAKPOINTS } from "../styles/breakpoints";

const PageWrapper = styled.div`
  padding: 0 15vw;
  padding-top: 10vh;

  @media only screen and (max-width: ${BREAKPOINTS.tabletLarge}) {
    padding: 0 10vw;
    padding-top: 5vh;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 0 10px;
    padding-top: 20px;
  }
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-flow: row;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const AlphaIndicator = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.alphaIndicatorColor};
  letter-spacing: 2px;
  font-weight: bold;
  opacity: 0.75;
`;

const Key = styled.span`
  font-size: 2rem;
  color: ${({ theme }) => theme.appTitle.keyColor};
  margin-right: 0.2rem;
`;
const Crusher = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.appTitle.crusherColor};
`;

const AppTitleWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
`;

const AppTitle = () => {
  return (
    <AppTitleWrapper>
      <Key>KEY</Key> <Crusher>CRUSHER</Crusher>
    </AppTitleWrapper>
  );
};

const Home: NextPage = () => {
  return (
    <PageWrapper>
      <Head>
        <title>Key Crusher</title>
        <meta
          name="description"
          content="A simple and fun speed typing application :)"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <HeaderContainer>
        <AppTitle />
        <AlphaIndicator>ALPHA</AlphaIndicator>
      </HeaderContainer>
      <Teleprompter />
    </PageWrapper>
  );
};

export default Home;
