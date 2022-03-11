import styled from "styled-components";
import { useState, useEffect } from "react";

const horizontalPadding = 10;
const verticalPaddingNoLabel = 12;
const verticalPadding = 16;
const labelTopOffset = 8;

const Container = styled.div`
  position: relative;
  width: 100%;
`;

export const InputLabel = styled.label<{
  hideLabel: boolean;
  emptyInput: boolean;
}>`
  order: -1;
  display: ${({ hideLabel }) => (hideLabel ? "none" : "block")};
  color: ${({ theme }) => theme.form.input.labelColor};
  font-size: 1rem;
  transition: 0.2s all;
  position: absolute;
  left: ${horizontalPadding}px;
  top: ${verticalPadding}px;

  ${({ emptyInput }) =>
    !emptyInput
      ? `
      top: calc(${labelTopOffset}px);
      font-size: 0.8rem;`
      : ""}
`;

export const Input = styled.input<{ hasLabel: boolean }>`
  width: 100%;
  padding: ${({ hasLabel }) =>
      hasLabel ? verticalPadding : verticalPaddingNoLabel}px
    ${horizontalPadding}px;
  ${({ hasLabel }) =>
    hasLabel
      ? `
  padding-top: calc(${verticalPadding}px + ${labelTopOffset}px);
  padding-bottom: calc(${verticalPadding}px - ${labelTopOffset}px);`
      : ""}
  border-radius: 3px;
  font-size: 1rem;
  transition: 0.2s all;
  color: ${({ theme }) => theme.form.input.textColor};
  outline: 1px solid ${({ theme }) => theme.form.input.borderColor};
  background-color: ${({ theme }) => theme.form.input.backgroundColor};

  &:focus {
    outline: 1px solid ${({ theme }) => theme.form.input.active.borderColor};
    background-color: ${({ theme }) => theme.form.input.active.backgroundColor};

    & + label {
      color: ${({ theme }) => theme.form.input.labelColor};
      top: calc(${labelTopOffset}px);
      font-size: 0.8rem;
    }
  }
`;

export interface TextInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  hideLabel?: boolean;
  labelStyle?: React.CSSProperties;
}

export const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  value,
  hideLabel = false,
  labelStyle = {},
  ...inputProps
}) => {
  return (
    <Container>
      <Input hasLabel={!!label} autoComplete={"off"} {...inputProps} />

      {label && (
        <InputLabel
          hideLabel={hideLabel}
          htmlFor={label}
          style={labelStyle}
          emptyInput={!inputProps.placeholder && value?.toString().length === 0}
        >
          {label}
        </InputLabel>
      )}
    </Container>
  );
};
