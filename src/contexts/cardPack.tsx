import React from "react";

const CardPackContext = React.createContext<[true] | [false, string]>([true]);

export default CardPackContext;
