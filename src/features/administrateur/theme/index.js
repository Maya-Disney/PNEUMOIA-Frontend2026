/**
 * theme/index.js — Point d'entrée unique du thème PneumoIA Admin
 *
 * Usage dans les pages :
 *   import { colors, typography } from "../theme";
 *   // ou
 *   import { brand, status, getSurface } from "../theme";
 */

export * from "./colors";
export * from "./typography";

import colors from "./colors";
import typography from "./typography";

export { colors, typography };
export default { colors, typography };