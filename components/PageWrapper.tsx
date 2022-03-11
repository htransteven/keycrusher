import styled from "styled-components";
import { BREAKPOINTS } from "../styles/breakpoints";
import { Navbar } from "./Navbar";

const Wrapper = styled.div`
  padding-left: 15vw;
  padding-right: 15vw;
  padding-top: 30px;

  @media only screen and (max-width: ${BREAKPOINTS.tabletLarge}) {
    padding-left: 10vw;
    padding-right: 10vw;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding-left: 10px;
    padding-right: 10px;
  }
`;

export const PageWrapper: React.FC = ({ children }) => {
  return (
    <Wrapper>
      <Navbar />
      {children}
    </Wrapper>
  );
};
