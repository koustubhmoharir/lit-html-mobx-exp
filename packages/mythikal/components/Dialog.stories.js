import { html } from 'lit-html';
import { Dialog } from './Dialog';

// More on default export: https://storybook.js.org/docs/web-components/writing-stories/introduction#default-export
export default {
  title: 'Example/Dialog',
  // More on argTypes: https://storybook.js.org/docs/web-components/api/argtypes
  argTypes: {
    //backgroundColor: { control: 'color' },
    onClick: { action: 'onClick' },
    /*size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },*/
  },
};

// More on component templates: https://storybook.js.org/docs/web-components/writing-stories/introduction#using-args
const Template = (args) => html`${Dialog(args).render(this, this)}`;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/web-components/writing-stories/args
Primary.args = {
//  primary: true,
  content: 'Dialog',
};

export const Secondary = Template.bind({});
Secondary.args = {
  content: 'Dialog',
};

export const Large = Template.bind({});
Large.args = {
//  size: 'large',
  content: 'Dialog',
};

export const Small = Template.bind({});
Small.args = {
//  size: 'small',
  content: 'Dialog',
};
