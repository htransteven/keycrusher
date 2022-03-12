import type { NextPage } from "next";
import Head from "next/head";
import { Teleprompter } from "../components/Teleprompter";

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Key Crusher | Daily Challenge</title>
        <meta
          name="description"
          content="The daily typing challenge for Key Crusher."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Teleprompter mode="daily" />
    </>
  );
};

export default HomePage;
