import { html } from 'lit-html';
import { template } from 'realithy';
import { Button } from "./Button";
import { PopupButton, PopupButtonItem } from "./PopupButton";

// More on default export: https://storybook.js.org/docs/web-components/writing-stories/introduction#default-export
export default {
    title: 'Example/PopupButton',
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
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sit amet hendrerit diam, at dictum augue. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque feugiat molestie porta. Sed aliquam sapien nec neque semper rhoncus. Nulla facilisi. Suspendisse accumsan massa sit amet dolor auctor consectetur. Nulla mollis erat urna, ut eleifend eros facilisis eget. Morbi et nisi vel dui rutrum pellentesque quis at urna. Sed at metus vehicula, consectetur purus vel, tempus quam. Morbi lacinia augue vel scelerisque pretium. Quisque vel blandit sapien. Phasellus vel ex ac metus ultricies venenatis ac eu nunc. Morbi venenatis ipsum quis scelerisque porttitor. Ut sit amet nibh vitae ex cursus pulvinar vitae at purus. Nam eu ipsum a odio congue mattis nec id est. Cras vel orci ac est dignissim luctus. Etiam semper tellus velit. Proin id tristique augue. Duis nisi tellus, blandit tristique felis eget, porttitor scelerisque ipsum. Suspendisse potenti. Duis placerat molestie leo nec ultricies. Ut sit amet gravida ipsum. Vivamus convallis tempus dui id efficitur. Aenean condimentum et nibh id mattis. Morbi eget mauris ex. Quisque convallis enim nulla, et efficitur sapien molestie et. Nam venenatis diam vel nunc iaculis posuere. Fusce facilisis elementum convallis. Donec accumsan nulla ut tincidunt vulputate. Nullam quis sem sit amet ipsum volutpat blandit. Etiam dignissim, est sed aliquet mollis, lorem nibh aliquam magna, eu commodo purus elit et tellus. Phasellus at mauris in nibh rhoncus ornare. Nam ut luctus diam. Duis vel augue ut mauris tempor gravida. Fusce sit amet tincidunt est. Vestibulum nisi diam, eleifend non venenatis vel, rutrum nec arcu. Donec eu enim vehicula, aliquam ligula ac, varius tortor. Nullam mattis eget nisl nec bibendum. Nulla pharetra, urna vitae convallis mollis, eros tortor tempor arcu, id pharetra sem elit quis diam. Vivamus efficitur accumsan libero, vel luctus nibh auctor sit amet. Nullam fermentum interdum ante, ut vehicula odio elementum vehicula. Donec consectetur, risus sit amet ullamcorper sollicitudin, turpis est auctor enim, eget finibus libero risus quis lacus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent eu neque quis sem porttitor facilisis. Mauris mattis ligula viverra ex eleifend dapibus. Ut eleifend est et justo dapibus bibendum. Pellentesque elit nisl, efficitur id mauris sit amet, faucibus convallis dolor. Vivamus vitae elementum metus. Sed nisl eros, luctus a ullamcorper ac, mattis vel neque. Nullam porta velit feugiat feugiat posuere. Aenean suscipit nibh sed nisl ornare blandit. Sed suscipit, dolor sit amet posuere finibus, tellus urna laoreet turpis, sed ultrices quam felis id mi. Praesent vitae orci sed velit pulvinar aliquet. Curabitur vitae feugiat tortor, eu pellentesque tellus. Maecenas iaculis rhoncus fermentum. Nam a interdum ipsum, non vehicula enim. Aenean at nunc quis risus molestie viverra sed at dui. Morbi pulvinar sit amet dolor sit amet lacinia. In sodales sit amet eros non posuere. Mauris a metus erat.
            </p>
            ${PopupButton({
                content: Button({label: "Dialog Menu", onClick: (_, v) => v.toggle()}),
                popupContent: template`
                    <div>
                        <p>Sample content</p>
                        ${Button({label: "Click to close", onClick: (_, v) => v.close()})}
                    </div>
                `
            }).render(this, this)}
            <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sit amet hendrerit diam, at dictum augue. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Quisque feugiat molestie porta. Sed aliquam sapien nec neque semper rhoncus. Nulla facilisi. Suspendisse accumsan massa sit amet dolor auctor consectetur. Nulla mollis erat urna, ut eleifend eros facilisis eget. Morbi et nisi vel dui rutrum pellentesque quis at urna. Sed at metus vehicula, consectetur purus vel, tempus quam. Morbi lacinia augue vel scelerisque pretium. Quisque vel blandit sapien. Phasellus vel ex ac metus ultricies venenatis ac eu nunc. Morbi venenatis ipsum quis scelerisque porttitor. Ut sit amet nibh vitae ex cursus pulvinar vitae at purus. Nam eu ipsum a odio congue mattis nec id est. Cras vel orci ac est dignissim luctus. Etiam semper tellus velit. Proin id tristique augue. Duis nisi tellus, blandit tristique felis eget, porttitor scelerisque ipsum. Suspendisse potenti. Duis placerat molestie leo nec ultricies. Ut sit amet gravida ipsum. Vivamus convallis tempus dui id efficitur. Aenean condimentum et nibh id mattis. Morbi eget mauris ex. Quisque convallis enim nulla, et efficitur sapien molestie et. Nam venenatis diam vel nunc iaculis posuere. Fusce facilisis elementum convallis. Donec accumsan nulla ut tincidunt vulputate. Nullam quis sem sit amet ipsum volutpat blandit. Etiam dignissim, est sed aliquet mollis, lorem nibh aliquam magna, eu commodo purus elit et tellus. Phasellus at mauris in nibh rhoncus ornare. Nam ut luctus diam. Duis vel augue ut mauris tempor gravida. Fusce sit amet tincidunt est. Vestibulum nisi diam, eleifend non venenatis vel, rutrum nec arcu. Donec eu enim vehicula, aliquam ligula ac, varius tortor. Nullam mattis eget nisl nec bibendum. Nulla pharetra, urna vitae convallis mollis, eros tortor tempor arcu, id pharetra sem elit quis diam. Vivamus efficitur accumsan libero, vel luctus nibh auctor sit amet. Nullam fermentum interdum ante, ut vehicula odio elementum vehicula. Donec consectetur, risus sit amet ullamcorper sollicitudin, turpis est auctor enim, eget finibus libero risus quis lacus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent eu neque quis sem porttitor facilisis. Mauris mattis ligula viverra ex eleifend dapibus. Ut eleifend est et justo dapibus bibendum. Pellentesque elit nisl, efficitur id mauris sit amet, faucibus convallis dolor. Vivamus vitae elementum metus. Sed nisl eros, luctus a ullamcorper ac, mattis vel neque. Nullam porta velit feugiat feugiat posuere. Aenean suscipit nibh sed nisl ornare blandit. Sed suscipit, dolor sit amet posuere finibus, tellus urna laoreet turpis, sed ultrices quam felis id mi. Praesent vitae orci sed velit pulvinar aliquet. Curabitur vitae feugiat tortor, eu pellentesque tellus. Maecenas iaculis rhoncus fermentum. Nam a interdum ipsum, non vehicula enim. Aenean at nunc quis risus molestie viverra sed at dui. Morbi pulvinar sit amet dolor sit amet lacinia. In sodales sit amet eros non posuere. Mauris a metus erat.
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