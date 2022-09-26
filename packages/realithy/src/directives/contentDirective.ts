import { directive, DirectiveClass } from 'lit-html/directive.js';

export const contentDirective = directive as <C extends DirectiveClass>(c: C) => (...values: Parameters<InstanceType<C>["render"]>) => { values: unknown[] };