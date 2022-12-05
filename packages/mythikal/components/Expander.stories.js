import { bind, html, template } from 'realithy';
import { Expander } from "./Expander";

// More on default export: https://storybook.js.org/docs/web-components/writing-stories/introduction#default-export
export default {
    title: 'Example/Expander',
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
        ${Expander({
            header: bind(_ => "Some Name"),
            content: template`
                <div>
                    <span>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam cursus sem vel enim faucibus, vitae sodales velit sollicitudin. Proin luctus, magna mattis tincidunt placerat, odio nisi cursus sapien, vitae rutrum tellus nulla eu nibh. Donec auctor posuere mauris ut mattis. Fusce gravida elit a mi pharetra, luctus gravida nisl porta. In hac habitasse platea dictumst. Curabitur a mattis magna, eu pretium quam. Duis pretium imperdiet dignissim. Cras quam enim, elementum feugiat aliquam sit amet, interdum vel nunc. Integer in tincidunt lorem. Proin pulvinar accumsan dignissim. Curabitur sapien arcu, molestie condimentum ultricies sed, consectetur vitae nisl. Suspendisse sed mollis mauris. Ut.
                    </span>
                </div>
            `
        }).render(this, this)}
    `;
}

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/web-components/writing-stories/args
Primary.args = {
    //  primary: true,
    header: 'Menu',
};