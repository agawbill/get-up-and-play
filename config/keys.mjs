import { prod } from "../config/prod.mjs";
import { dev } from "../config/dev.mjs";

export const keys = () => {
  if (process.env.NODE_ENV === "production") {
    // we are in prod - return prod keys
    return prod;
  } else {
    // return dev keys
    return dev;
  }
};
