import { DARK_THEME } from "./styles/themes/darkTheme";

type ThemeInterface = typeof DARK_THEME;

declare module "styled-components" {
  interface DefaultTheme extends ThemeInterface {}
}
