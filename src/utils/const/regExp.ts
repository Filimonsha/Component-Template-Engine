export const TEMPLATE_DYNAMIC_REGEXP = new RegExp(/\{\{([\s\S]*?)\}\}/gi);
export const TEMPLATE_IF_THEN_REGEXP = new RegExp(
    /if\((.*?)\)then{(.*?)}(else{(.*?)})?/gi
);
export const TEMPLATE_VARIABLES_REGEXP = new RegExp(/!(.*?)!/gi);
