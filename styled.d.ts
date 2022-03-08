import { DARK_THEME } from "./styles/themes";

type ThemeInterface = typeof DARK_THEME;

declare module "styled-components" {
  interface DefaultTheme extends ThemeInterface {}
}
