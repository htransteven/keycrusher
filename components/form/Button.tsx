import { useCallback } from "react";
import styled, { useTheme } from "styled-components";

const StyledButton = styled.button<{
  variant: ButtonVariant;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  hover?: {
    textColor: string;
    backgroundColor: string;
  };
}>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  color: ${({ textColor }) => textColor};
  outline: 1px solid ${({ borderColor }) => borderColor};
  padding: ${({ variant }) => (variant === "helper" ? "2px" : "6px 12px")};
  border-radius: 3px;

  opacity: 0.9;
  transition: 0.2s all;

  &:hover {
    cursor: pointer;
    ${({ hover }) =>
      hover
        ? `
  background-color: ${hover.backgroundColor};
  color: ${hover.textColor};
    `
        : ""}
    opacity: 1;
  }

  &:disabled {
    opacity: 0.8;
    cursor: not-allowed;
    outline: 1px solid
      ${({ theme }) => theme.form.button.variants.disabled.borderColor};
    background-color: ${({ theme }) =>
      theme.form.button.variants.disabled.backgroundColor};
    color: ${({ theme }) => theme.form.button.variants.disabled.textColor};
  }
`;

export type ButtonVariant =
  | "default"
  | "default_inverse"
  | "neutral"
  | "neutral_inverse"
  | "negative"
  | "negative_inverse"
  | "helper";

export interface FormButtonProps {
  variant?: ButtonVariant;
}

export const Button: React.FC<
  FormButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>
> = ({ variant = "default", children, ...buttonProps }) => {
  const theme = useTheme();

  const getButtonProps = useCallback(
    (variant: ButtonVariant) => {
      switch (variant) {
        case "default":
          return theme.form.button.variants.default;
        case "default_inverse":
          return theme.form.button.variants.default_inverse;
        case "neutral":
          return theme.form.button.variants.neutral;
        case "neutral_inverse":
          return theme.form.button.variants.neutral_inverse;
        case "negative":
          return theme.form.button.variants.negative;
        case "negative_inverse":
          return theme.form.button.variants.negative_inverse;
        case "helper":
          return theme.form.button.variants.helper;
        default:
          return theme.form.button.variants.default;
      }
    },
    [theme]
  );

  return (
    <StyledButton
      variant={variant}
      {...getButtonProps(variant)}
      {...buttonProps}
      type={buttonProps.type || "button"}
    >
      {children}
    </StyledButton>
  );
};
