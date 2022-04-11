import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import styled from "styled-components";
import { FlexColumn, FlexRow } from "../components/layout/FlexLayout";
import ProfileCard from "../components/ProfileCard";
import LockIcon from "../assets/lock-solid.svg";
import { PaddedContainer } from "../components/layout/Containers";
import Link from "next/link";

interface LargeCardTemplateProps {
  background?: string;
  locked?: boolean;
}

const LargeCardTemplate = styled.a<LargeCardTemplateProps>`
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 50px;
  height: 100%;
  font-size: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgb(10 10 10 / 20%);
  transition: 0.2s outline;
  white-space: nowrap;
  color: ${({ theme }) => theme.white};

  outline: 2px solid transparent;
  ${({ background }) =>
    !background
      ? ""
      : `
    background: ${background};
  `}

  &:hover {
    cursor: ${({ locked }) => (locked ? "not-allowed" : "pointer")};
    outline: 1.5px solid white;
  }
`;

const LockedCardOverlay = styled.div`
  z-index: 1;
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type LargeCardProps = React.HTMLAttributes<HTMLAnchorElement> &
  LargeCardTemplateProps;

const LargeCard: React.FC<LargeCardProps> = ({ children, ...props }) => {
  return <LargeCardTemplate {...props}>{children}</LargeCardTemplate>;
};

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
      <PaddedContainer includeNavPadding={true}>
        <FlexColumn style={{ gap: "0px" }}>
          <h2>Welcome Back!</h2>
          <ProfileCard />
        </FlexColumn>
        <FlexColumn style={{ gap: "0px" }}>
          <h2>Game Modes</h2>
          <FlexRow style={{ gap: "20px" }}>
            <Link href={"/challenges/classic"} passHref={true}>
              <LargeCard
                background={
                  "linear-gradient(45deg,rgba(42, 90, 199, 1) 0%,rgba(41, 199, 172, 1) 100%)"
                }
              >
                Classic
              </LargeCard>
            </Link>
            <Link href={"/challenges/daily"} passHref={true}>
              <LargeCard
                background={
                  "linear-gradient(45deg, rgba(42,90,199,1) 0%, rgba(240,84,84,1) 100%)"
                }
              >
                Daily Challenge
              </LargeCard>
            </Link>
            <LargeCard
              background={
                "linear-gradient(45deg, rgba(255,170,76,1) 25%, rgba(240,84,84,1) 100%)"
              }
              locked={true}
            >
              Online Battle
              <LockedCardOverlay>
                <LockIcon
                  style={{
                    height: "1.5rem",
                    width: "auto",
                  }}
                />
              </LockedCardOverlay>
            </LargeCard>
          </FlexRow>
        </FlexColumn>
      </PaddedContainer>
    </>
  );
};

export default HomePage;
