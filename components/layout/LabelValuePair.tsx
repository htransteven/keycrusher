import React from "react";
import styled from "styled-components";
import { GridLayout, GridLayoutProps } from "./GridLayout";

const Label = styled.span`
  font-weight: normal;
  font-size: 0.65rem;
  color: ${({ theme }) => theme.tertiaryTextColor};
  white-space: nowrap;
`;

const Value = styled.span`
  font-weight: normal;
  font-size: 1rem;
  color: ${({ theme }) => theme.primaryTextColor};
  white-space: nowrap;
`;

export interface LabelValuePair
  extends Pick<GridLayoutProps, "direction" | "gap"> {
  label: string;
  value: React.ReactNode;
  containerStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
  valueStyle?: React.CSSProperties;
}

export const LabelValuePair: React.FC<LabelValuePair> = ({
  label,
  value,
  direction,
  containerStyle,
  labelStyle,
  valueStyle,
  ...rest
}) => {
  return (
    <GridLayout
      direction={direction}
      gap={direction === "row" ? 10 : 5}
      {...rest}
      containerStyle={{ alignItems: "center", ...containerStyle }}
    >
      <Label style={labelStyle}>{label}</Label>
      <Value style={valueStyle}>{value}</Value>
    </GridLayout>
  );
};
