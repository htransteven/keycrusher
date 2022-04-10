import styled from "styled-components";

const Divider = styled.div<{ length: string | number }>`
  position: relative;

  &::after {
    position: absolute;
    background: ${({ theme }) => theme.dividers.color};
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

export const VerticleDivider = styled(Divider)`
  height: 100%;

  &::after {
    width: 1px;
    content: "";
    height: ${({ length }) =>
      typeof length === "string" ? length : `${length}px`};
  }
`;
export const HorizontalDivider = styled(Divider)`
  width: 100%;

  &::after {
    height: 1px;
    content: "";
    width: ${({ length }) =>
      typeof length === "string" ? length : `${length}px`};
  }
`;
