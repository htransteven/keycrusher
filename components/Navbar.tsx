import Link from "next/link";
import styled from "styled-components";
import ProfileIcon from "../assets/user-solid.svg";
import SettingsIcon from "../assets/gear-solid.svg";
import LeaderBoardIcon from "../assets/list-ol-solid.svg";

const NavbarContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const NavbarOptionsContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: flex-end;
  justify-content: center;
  gap: 10px;
`;

const NavbarIconWrapper = styled.a`
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 3px;
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  color: ${({ theme }) => theme.teleprompt.textColor};
  background-color: ${({ theme }) => theme.teleprompt.input.backgroundColor};
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
  return (
    <NavbarContainer>
      <NavbarOptionsContainer>
        <AppTitle />
      </NavbarOptionsContainer>
      <NavbarOptionsContainer>
        <NavbarIconWrapper style={{ opacity: 0.5, cursor: "not-allowed" }}>
          <LeaderBoardIcon
            style={{
              height: "1.5rem",
              width: "1.5rem",
            }}
          />
        </NavbarIconWrapper>
        <Link href={"/profile"} passHref>
          <NavbarIconWrapper>
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
      </NavbarOptionsContainer>
    </NavbarContainer>
  );
};
