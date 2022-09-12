import { repeat as repeatSync } from "lit-html/directives/repeat";
import { trackDirective } from "../trackDirective";

export const repeat: typeof repeatSync = trackDirective(repeatSync);
