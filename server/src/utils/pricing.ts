// ASSUMPTION: shipping rules are not defined in the Figma file. Adjust here.
export const SHIPPING_FLAT_CENTS = 1000;
export const FREE_SHIPPING_THRESHOLD_CENTS = 20000;

export const calcShipping = (subtotalCents: number) =>
  subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? 0 : SHIPPING_FLAT_CENTS;
