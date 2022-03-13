import Link from "next/link";
import styled from "styled-components";
import ProfileIcon from "../assets/user-solid.svg";
import SettingsIcon from "../assets/gear-solid.svg";
import LeaderBoardIcon from "../assets/list-ol-solid.svg";
import AboutIcon from "../assets/question-solid.svg";
import { useRouter } from "next/router";

const NavbarContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const NavbarOptionsContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-end;
  justify-content: flex-end;
  gap: 10px;
`;

const NavbarTextOptionWrapper = styled.a<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 15px;
  border-radius: 3px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  background-color: ${({ theme }) => theme.navbar.backgroundColor};

  transition: 0.3s all;
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.navbar.accentColor : "transparent"};
  color: ${({ theme, active }) =>
    active ? theme.navbar.accentColor : theme.navbar.primaryTextColor};
`;

const NavbarTextOption = styled.span`
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavbarIconWrapper = styled.a<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border-radius: 3px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  background-color: ${({ theme }) => theme.navbar.backgroundColor};

  transition: 0.3s all;
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.navbar.accentColor : "transparent"};
  color: ${({ theme, active }) =>
    active ? theme.navbar.accentColor : theme.navbar.primaryTextColor};
`;

const AlphaIndicator = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.navbar.alphaIndicatorColor};
  letter-spacing: 2px;
  font-weight: bold;
  opacity: 0.75;
`;

const Key = styled.span`
  font-size: 2rem;
  color: ${({ theme }) => theme.navbar.appTitle.keyColor};
  margin-right: 0.2rem;
`;
const Crusher = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: ${({ theme }) => theme.navbar.appTitle.crusherColor};
`;

const AppTitleContainer = styled.a`
  display: flex;
  flex-flow: column nowrap;
`;

const AppTitleWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
`;

const AppTitle = () => {
  return (
    <Link href={"/"} passHref>
      <AppTitleContainer>
        <AlphaIndicator>ALPHA</AlphaIndicator>
        <AppTitleWrapper>
          <Key>KEY</Key> <Crusher>CRUSHER</Crusher>
        </AppTitleWrapper>
      </AppTitleContainer>
    </Link>
  );
};

export const Navbar = () => {
  const router = useRouter();
  return (
    <NavbarContainer>
      <NavbarOptionsContainer>
        <AppTitle />
      </NavbarOptionsContainer>
      <NavbarOptionsContainer>
        <Link href={"/daily"} passHref>
          <NavbarTextOptionWrapper active={router.asPath.includes("/daily")}>
            <NavbarTextOption>Daily Challenge</NavbarTextOption>
          </NavbarTextOptionWrapper>
        </Link>
        <NavbarIconWrapper style={{ opacity: 0.5, cursor: "not-allowed" }}>
          <LeaderBoardIcon
            style={{
              height: "1.5rem",
              width: "1.5rem",
            }}
          />
        </NavbarIconWrapper>
        <Link href={"/profile"} passHref>
          <NavbarIconWrapper active={router.asPath.includes("/profile")}>
            <ProfileIcon
              style={{
                height: "1.5rem",
                width: "1.5rem",
              }}
            />
          </NavbarIconWrapper>
        </Link>
        <NavbarIconWrapper style={{ opacity: 0.5, cursor: "not-allowed" }}>
          <SettingsIcon
            style={{
              height: "1.5rem",
              width: "1.5rem",
            }}
          />
        </NavbarIconWrapper>
        <Link href={"/about"} passHref>
          <NavbarIconWrapper active={router.asPath.includes("/about")}>
            <AboutIcon
              style={{
                height: "1.5rem",
                width: "1.5rem",
              }}
            />
          </NavbarIconWrapper>
        </Link>
      </NavbarOptionsContainer>
    </NavbarContainer>
  );
};
