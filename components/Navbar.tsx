import Link from "next/link";
import styled from "styled-components";
import { useRouter } from "next/router";
import Image from "next/image";
import logo_src from "../assets/logo.png";
import { BREAKPOINTS } from "../styles/breakpoints";
import { useLayoutEffect, useRef, useState } from "react";
import { useSetNavHeight } from "../contexts/NavHeightContext";

const NavbarContainer = styled.div<{ hasScrolled: boolean }>`
  position: sticky;
  z-index: 1000;
  top: 0;
  left: 0;
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 10px;
  background-color: ${({ hasScrolled, theme }) =>
    hasScrolled ? theme.navbar.backgroundColor : "transparent"};
  padding: 20px 30px;

  transition: 0.2s background-color;

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    justify-content: center;
  }
`;

const NavbarSectionContainer = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const NavbarTextOptionWrapper = styled.a<{ active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 500;

  transition: 0.3s all;
  border-bottom: 2px solid
    ${({ theme, active }) =>
      active ? theme.navbar.accentColor : "transparent"};
  color: ${({ theme, active }) =>
    active ? theme.navbar.accentColor : theme.primaryTextColor};
`;

const AppTitleWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const AlphaIndicator = styled.span`
  font-size: 0.6rem;
  color: ${({ theme }) => theme.navbar.alphaIndicatorColor};
  letter-spacing: 2px;
  font-weight: bold;
  opacity: 0.75;
`;

const Key = styled.span`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.navbar.appTitle.keyColor};
  margin-right: 0.2rem;
`;
const Crusher = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${({ theme }) => theme.navbar.appTitle.crusherColor};
`;

const AppTitleContainer = styled.a`
  display: flex;
  flex-flow: column nowrap;
`;

const AppTitleTextWrapper = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: flex-start;
`;

const NavLogoWrapper = styled.div`
  position: relative;
  display: flex;
  height: 2.5rem;
  width: 2.5rem;
`;

const AppTitle = () => {
  return (
    <Link href={"/"} passHref>
      <AppTitleWrapper>
        <NavLogoWrapper>
          <Image src={logo_src} alt={"Key Crusher Logo"} layout={"fill"} />
        </NavLogoWrapper>
        <AppTitleContainer>
          <AlphaIndicator>ALPHA</AlphaIndicator>
          <AppTitleTextWrapper>
            <Key>KEY</Key> <Crusher>CRUSHER</Crusher>
          </AppTitleTextWrapper>
        </AppTitleContainer>
      </AppTitleWrapper>
    </Link>
  );
};

export const Navbar = () => {
  const setNavHeight = useSetNavHeight();
  const router = useRouter();
  const [hasScrolled, setHasScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const onResize = () => {
      if (!navRef.current) return;
      setNavHeight(navRef.current.offsetHeight);
    };

    const onScroll = () => {
      if (!navRef.current) return;
      if (window.scrollY >= navRef.current.offsetHeight) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll);

    onResize();
    onScroll();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [setNavHeight]);

  return (
    <NavbarContainer ref={navRef} hasScrolled={hasScrolled}>
      <NavbarSectionContainer>
        <AppTitle />
      </NavbarSectionContainer>
      <NavbarSectionContainer>
        <Link href={"/"} passHref>
          <NavbarTextOptionWrapper active={router.asPath === "/"}>
            Home
          </NavbarTextOptionWrapper>
        </Link>
        <Link href={"/challenges/classic"} passHref>
          <NavbarTextOptionWrapper
            active={router.asPath.includes("/challenges/classic")}
          >
            Classic
          </NavbarTextOptionWrapper>
        </Link>
        <Link href={"/challenges/daily"} passHref>
          <NavbarTextOptionWrapper active={router.asPath.includes("/daily")}>
            Daily
          </NavbarTextOptionWrapper>
        </Link>
        <Link href={"/profile"} passHref>
          <NavbarTextOptionWrapper active={router.asPath.includes("/profile")}>
            Profile
          </NavbarTextOptionWrapper>
        </Link>
        <Link href={"/about"} passHref>
          <NavbarTextOptionWrapper active={router.asPath.includes("/about")}>
            About
          </NavbarTextOptionWrapper>
        </Link>
      </NavbarSectionContainer>
    </NavbarContainer>
  );
};
