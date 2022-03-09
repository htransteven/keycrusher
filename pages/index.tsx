import type { NextPage } from "next";
import Head from "next/head";
import styled from "styled-components";
import { TextPrompt } from "../components/TextPrompt";

const PageWrapper = styled.div`
  padding: 0 15vw;
  padding-top: 10vh;
`;

const Home: NextPage = () => {
  return (
    <PageWrapper>
      <Head>
        <title>Speed Typer</title>
        <meta
          name="description"
          content="A simple and fun speed typing application :)"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TextPrompt />
    </PageWrapper>
  );
};

export default Home;
