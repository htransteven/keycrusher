import styled from "styled-components";
import { useNavHeight } from "../contexts/NavHeightContext";
import { Navbar } from "./Navbar";

const Wrapper = styled.div<{ navHeight: number }>`
  padding: 0;
  min-height: 100vh;
  margin-top: -${({ navHeight }) => navHeight}px;
`;

export const PageWrapper: React.FC = ({ children }) => {
  const navHeight = useNavHeight();
  return (
    <>
      <Navbar />
      <Wrapper navHeight={navHeight}>{children}</Wrapper>
    </>
  );
};
