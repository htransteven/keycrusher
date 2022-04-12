import styled from "styled-components";
import { useNavHeight } from "../../contexts/NavHeightContext";
import { BREAKPOINTS } from "../../styles/breakpoints";

const PaddedContainerDiv = styled.div<{ navHeight: number }>`
  padding: calc(${({ navHeight }) => `${navHeight}px`} + 30px) 10vw 30px 10vw;

  @media only screen and (max-width: ${BREAKPOINTS.tabletLarge}) {
    padding: calc(${({ navHeight }) => `${navHeight}px`} + 20px) 5vw 20px 5vw;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: calc(${({ navHeight }) => `${navHeight}px`} + 10px) 10px 10px 10px;
  }
`;

const LessPaddedContainerDiv = styled.div<{ navHeight: number }>`
  padding: calc(${({ navHeight }) => `${navHeight}px`} + 20px) 20px 20px 20px;

  @media only screen and (max-width: ${BREAKPOINTS.tabletLarge}) {
    padding: calc(${({ navHeight }) => `${navHeight}px`} + 10px) 10px 10px 10px;
  }
`;

const MorePaddedContainerDiv = styled.div<{ navHeight: number }>`
  padding: calc(${({ navHeight }) => `${navHeight}px`} + 30px) 20vw 30px 20vw;

  @media only screen and (max-width: ${BREAKPOINTS.tabletLarge}) {
    padding: calc(${({ navHeight }) => `${navHeight}px`} + 20px) 15vw 20px 15vw;
  }

  @media only screen and (max-width: ${BREAKPOINTS.mobile}) {
    padding: calc(${({ navHeight }) => `${navHeight}px`} + 10px) 30px 10px 30px;
  }
`;

interface PaddedContainerProps {
  paddingSize?: "default" | "less" | "more";
  includeNavPadding?: boolean;
}

export const PaddedContainer: React.FC<
  React.HTMLAttributes<HTMLDivElement> & PaddedContainerProps
> = ({ paddingSize = "default", includeNavPadding, children, ...divProps }) => {
  const navHeight = useNavHeight();

  switch (paddingSize) {
    case "less":
      return (
        <LessPaddedContainerDiv
          {...divProps}
          navHeight={includeNavPadding ? navHeight : 0}
        >
          {children}
        </LessPaddedContainerDiv>
      );
    case "more":
      return (
        <MorePaddedContainerDiv
          {...divProps}
          navHeight={includeNavPadding ? navHeight : 0}
        >
          {children}
        </MorePaddedContainerDiv>
      );
    default:
      return (
        <PaddedContainerDiv
          {...divProps}
          navHeight={includeNavPadding ? navHeight : 0}
        >
          {children}
        </PaddedContainerDiv>
      );
  }
};
