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
      <Teleprompter />
    </PageWrapper>
  );
};

export default Home;
