import { html } from 'lit-html';
import { bind, template } from 'realithy';
import { Dialog } from './Dialog';

// More on default export: https://storybook.js.org/docs/web-components/writing-stories/introduction#default-export
export default {
  title: 'Example/Dialog',
  // More on argTypes: https://storybook.js.org/docs/web-components/api/argtypes
  argTypes: {},
};

// More on component templates: https://storybook.js.org/docs/web-components/writing-stories/introduction#using-args
const Template = (args) => html`${Dialog({
  open: bind(_ => args.open),
  content: template`
    <div>
      Sample content
    </div>
  `
}).render(this, this)}`;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/web-components/writing-stories/args
Primary.args = {
  open: true
};
