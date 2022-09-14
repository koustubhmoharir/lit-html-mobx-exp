import { repeat as repeatSync } from "lit-html/directives/repeat.js";
import { trackDirective } from "../trackDirective";

export const repeat: typeof repeatSync = trackDirective(repeatSync);
