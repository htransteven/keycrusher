import type { NextPage } from "next";
import Head from "next/head";
import { Teleprompter } from "../components/Teleprompter";

const HomePage: NextPage = () => {
  return (
    <>
      <Head>
        <title>Key Crusher</title>
        <meta
          name="description"
          content="A simple and fun speed typing application :)"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Teleprompter />
    </>
  );
};

export default HomePage;
