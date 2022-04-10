import styled from "styled-components";

export interface GridLayoutProps {
  direction?: "row" | "column";
  gap?: number;
  containerStyle?: React.CSSProperties;
}

const Container = styled.div<
  Required<Pick<GridLayoutProps, "direction" | "gap">>
>`
  height: max-content;
  width: max-content;
  display: grid;
  grid-gap: ${({ gap }) => gap}px;
  ${({ direction }) => {
    switch (direction) {
      case "row":
        return `
          grid-auto-flow: column; 
          grid-auto-columns: auto;
          align-items: center;
          justify-content: left;
        `;
      case "column": {
        return `
          grid-auto-flow: row; 
          grid-auto-rows: auto;
        `;
      }
      default:
        return "";
    }
  }}
`;

export const GridLayout: React.FC<GridLayoutProps> = ({
  direction = "row",
  gap = 10,
  containerStyle,
  children,
}) => {
  return (
    <Container direction={direction} gap={gap} style={containerStyle}>
      {children}
    </Container>
  );
};
