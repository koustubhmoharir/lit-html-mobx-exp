import { html } from 'lit-html';
import { Dropdown } from './Dropdown';

// More on default export: https://storybook.js.org/docs/web-components/writing-stories/introduction#default-export
export default {
  title: 'Example/Dropdown',
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
const Template = (args) => html`${Dropdown(args).render(this, this)}`;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/web-components/writing-stories/args
Primary.args = {
//  primary: true,
  content: 'Button',
};