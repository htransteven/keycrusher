import { useEffect, useState } from "react";
import styled from "styled-components";
import { KeyCap } from "./Keycap";

const Container = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: 5px;
`;

export const Loading: React.FC<{ value?: string }> = ({
  value = "LOADING",
}) => {
  const [pressedKeyCounter, setPressedKeyCounter] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () =>
        setPressedKeyCounter((prev) =>
          prev === value.length - 1 ? 0 : ++prev
        ),
      500
    );

    return () => clearInterval(timer);
  });

  return (
    <Container>
      {value
        .split("")
        .map((char, index) =>
          char === " " ? (
            <span key={`loading-space-${index}`}> </span>
          ) : (
            <KeyCap
              key={`loading-key-${index}`}
              pressed={pressedKeyCounter === index}
              value={char}
            />
          )
        )}
    </Container>
  );
};
