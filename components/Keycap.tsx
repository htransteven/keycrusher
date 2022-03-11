import styled from "styled-components";

const StyledKeyCap = styled.span<{
  pressed?: boolean;
  isSingleCharacter?: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 500;
  padding: 4px 12px;
  ${({ isSingleCharacter }) =>
    isSingleCharacter
      ? `
    width: 1.5rem;
    height: 1.5rem;
  `
      : ""}
  border-radius: 3px;
  background-color: ${({ theme }) => theme.keyCap.backgroundColor};
  color: ${({ theme }) => theme.keyCap.textColor};
  box-shadow: rgba(14, 30, 37, 0.12) 0px 2px 4px 0px,
    rgba(14, 30, 37, 0.32) 0px 2px 16px 0px;
  transition: 0.35s all ease-out;

  ${({ theme, pressed }) =>
    pressed
      ? `
        transition: 0.15s all ease-in;
        box-shadow: none;
        transform: scale(0.9);
        background-color: ${theme.keyCap.pressed.backgroundColor};
    `
      : ""}
`;

export const KeyCap: React.FC<{ value: string; pressed?: boolean }> = ({
  value,
  pressed,
}) => {
  return (
    <StyledKeyCap pressed={pressed} isSingleCharacter={value.length === 1}>
      {value}
    </StyledKeyCap>
  );
};
