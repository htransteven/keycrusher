import styled from "styled-components";
import { useNavHeight } from "../../contexts/NavHeightContext";
import { BREAKPOINTS } from "../../styles/breakpoints";

const PaddedContainerDiv = styled.div<{ navHeight: number }>`
  padding: calc(${({ navHeight }) => `${navHeight}px`} + 30px) 15vw 30px 15vw;

  @media only screen and (max-width: ${BREAKPOINTS.tabletLarge}) {
    padding: calc(${({ navHeight }) => `${navHeight}px`} + 30px) 10vw 30px 10vw;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: calc(${({ navHeight }) => `${navHeight}px`} + 30px) 10px 30px 10px;
  }
`;

interface PaddedContainerProps {
  includeNavPadding?: boolean;
}

export const PaddedContainer: React.FC<PaddedContainerProps> = ({
  includeNavPadding,
  children,
}) => {
  const navHeight = useNavHeight();
  return (
    <PaddedContainerDiv navHeight={includeNavPadding ? navHeight : 0}>
      {children}
    </PaddedContainerDiv>
  );
};
