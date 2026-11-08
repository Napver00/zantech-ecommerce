/** A cart line is a product, or one variant of it (cartKey "12:5"). */
export const cartKeyOf = (item) => item.cartKey ?? item.id;
