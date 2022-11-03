import { html } from 'lit-html';
import { Button } from "./Button"
import { Menu, MenuItem } from "./Menu"

// More on default export: https://storybook.js.org/docs/web-components/writing-stories/introduction#default-export
export default {
    title: 'Example/Menu',
    // More on argTypes: https://storybook.js.org/docs/web-components/api/argtypes
    argTypes: {
        //backgroundColor: { control: 'color' },
        //onClick: { action: 'onClick' },
        /*size: {
          control: { type: 'select' },
          options: ['small', 'medium', 'large'],
        },*/
    },
};

// More on component templates: https://storybook.js.org/docs/web-components/writing-stories/introduction#using-args
const Template = (args) => {
    return html`
        <div>
            ${Menu({
                content: Button({label: "Menu", onClick: (_, v) => v.toggle()}),
                items: [
                    MenuItem({ onClick: () => {}, content: "Item A" }),
                    MenuItem({ onClick: () => {}, content: "Item B" })
                ]
            }).render(this, this)}
            <p>
                Something below the menu
            </p>
        </div>
        `;
}

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/web-components/writing-stories/args
Primary.args = {
    //  primary: true,
    text: 'Menu',
};