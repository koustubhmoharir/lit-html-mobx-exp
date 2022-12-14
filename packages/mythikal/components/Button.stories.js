import { html } from 'lit-html';
import { Button } from './Button';

// More on default export: https://storybook.js.org/docs/web-components/writing-stories/introduction#default-export
export default {
  title: 'Example/Button',
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
const Template = (args) => html`${Button(args).render(this, this)}`;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/web-components/writing-stories/args
Primary.args = {
//  primary: true,
  content: 'Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  content: 'Button',
};

export const Large = Template.bind({});
Large.args = {
//  size: 'large',
  content: 'Button',
};

export const Small = Template.bind({});
Small.args = {
//  size: 'small',
  content: 'Button',
};
