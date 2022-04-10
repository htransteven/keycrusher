import { createContext, useContext, useState } from "react";

interface NavHeightContext {
  height: number;
  setHeight: (value: number) => void;
}

const NavHeightContext = createContext<NavHeightContext>({
  height: 0,
  setHeight: () => {},
});

export const useSetNavHeight = () => {
  return useContext(NavHeightContext).setHeight;
};

export const useNavHeight = () => {
  return useContext(NavHeightContext).height;
};

export const NavHeightProvider: React.FC = ({ children }) => {
  const [height, setHeight] = useState(77.5); // start with hardcoded approximation

  return (
    <NavHeightContext.Provider value={{ height, setHeight }}>
      {children}
    </NavHeightContext.Provider>
  );
};
