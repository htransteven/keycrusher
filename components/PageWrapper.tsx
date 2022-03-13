import styled from "styled-components";
import { BREAKPOINTS } from "../styles/breakpoints";
import { Navbar } from "./Navbar";

const Wrapper = styled.div`
  padding: 30px 15vw;
  min-height: 100vh;

  @media only screen and (max-width: ${BREAKPOINTS.tabletLarge}) {
    padding: 30px 10vw;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: 30px 10px;
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
