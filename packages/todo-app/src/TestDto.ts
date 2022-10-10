import { pt, DtoType } from "realithy";

const Address = () => ({
    line1: pt.string,
    line2: pt.string.optional,
    line3: pt.string.optional,
    city: pt.string,
    state: pt.string,
    pin: pt.string
});
type AddressDto = DtoType<typeof Address>;

const UserDS = () => ({
    userName: pt.string,
    firstName: pt.string.optional,
    emails: pt.string.array,
    verified: pt.boolean,
    dobOleDate: pt.number.optional,
    address: pt.ref(Address).optional,
    //manager: pt.ref(UserDS).optional,
    //reportees: pt.ref(UserDS).array
});
type UserDto = DtoType<typeof UserDS>;

// const User = model(UserDS, self => {



// });