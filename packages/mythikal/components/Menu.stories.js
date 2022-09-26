import { html } from 'lit-html';
import { button } from "./Button"
import { menu, menuItem } from "./Menu"

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
            ${menu({
                target: props => button({content: "Menu", onClick: props.toggle, root: props.ref}),
                items: (menu) => [
                    menuItem(menu, { content: "Item A" }),
                    menuItem(menu, { content: "Item B" })
                ]
            })}
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