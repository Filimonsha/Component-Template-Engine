import {FoundRegexpHandler, RegexpHandler} from "../utils/regexpHandler";
import {TEMPLATE_DYNAMIC_REGEXP, TEMPLATE_IF_THEN_REGEXP, TEMPLATE_VARIABLES_REGEXP} from "../utils/const/regExp";

type Context = { [key: string]: any }

export class Template {
    private readonly initialTemplate: string;
    private context: Context;
    private modifyTemplate: string;

    constructor(template: string) {
        this.initialTemplate = template;
        this.modifyTemplate = this.initialTemplate;
    }

    compile(context?: object) {
        this.context = context || {}
        const result = this.foundDynamicRegexp();
        this.modifyTemplate = this.initialTemplate;
        return result;
    }

    private getProperty(propertyName: string) {
        const keys = propertyName.split(".");

        let propertyOfObject;
        let currentObject = this.context;
        for (const key of keys) {
            propertyOfObject = currentObject[key];
            if (!propertyOfObject) return "";
            currentObject = propertyOfObject;
        }
        const propertyIsNotFound = (propertyOfObject == undefined || false)
        return !propertyIsNotFound ? propertyOfObject : "";
    }

    private foundDynamicRegexp() {
        this.renderSimpleVariables();
        const conditionRegexpHandler: FoundRegexpHandler = (
            foundedDynamicReg,
            foundedMatch
        ) => {
            if (foundedDynamicReg.match(TEMPLATE_IF_THEN_REGEXP)) {
                this.renderCondition(foundedDynamicReg, foundedMatch);
            }
        };
        RegexpHandler.handAllFoundRegexp(
            TEMPLATE_DYNAMIC_REGEXP,
            this.modifyTemplate,
            conditionRegexpHandler
        );
        this.replaceAllDynamicRegExp();
        return this.modifyTemplate;
    }

    private replaceAllDynamicRegExp() {
        const dynamicRegexpHandler: FoundRegexpHandler = (
            foundedDynamicReg,
            foundedMatch
        ) =>
            (this.modifyTemplate = this.modifyTemplate.replace(
                foundedMatch,
                foundedDynamicReg
            ));

        RegexpHandler.handAllFoundRegexp(
            TEMPLATE_DYNAMIC_REGEXP,
            this.modifyTemplate,
            dynamicRegexpHandler,
            false
        );
    }

    private renderSimpleVariables() {
        const simpleVariablesRegexpHandler: FoundRegexpHandler = (
            foundedDynamicReg,
            foundedMatch
        ) => {
            const property = this.getProperty(foundedDynamicReg);
            if (foundedDynamicReg) {
                const propertyElementIsComponent =
                    Array.isArray(property) &&
                    property.every((propertyElement) => {
                        const elementIsString = typeof propertyElement === "string";
                        return (
                            elementIsString &&
                            propertyElement.trim().startsWith("<div id=component-")
                        );
                    });
                const propertyIfFunc = typeof property === "function"
                if (!propertyIfFunc) {
                    this.modifyTemplate = this.modifyTemplate.replace(
                        new RegExp(foundedMatch, "gi"),
                        propertyElementIsComponent ? property.join("") : property
                    );
                }
            }
        };

        RegexpHandler.handAllFoundRegexp(
            TEMPLATE_VARIABLES_REGEXP,
            this.modifyTemplate,
            simpleVariablesRegexpHandler
        );

    }

    private renderCondition(foundedDynamicReg: string, foundedMatch: string) {
        const foundedConditionArgs =
            TEMPLATE_IF_THEN_REGEXP.exec(foundedDynamicReg);

        const condition = eval(foundedConditionArgs ? foundedConditionArgs[1] : "");
        const ifSuccessThen = foundedConditionArgs && foundedConditionArgs[2];
        const ifFalseThen = eval(foundedConditionArgs ? foundedConditionArgs[3] : "");

        if (condition && ifSuccessThen) {
            console.log("true", condition, foundedConditionArgs)
            this.modifyTemplate = this.modifyTemplate.replace(
                foundedMatch,
                ifSuccessThen
            );
        } else if (ifFalseThen) {
            console.log("false", foundedMatch)
            this.modifyTemplate = this.modifyTemplate.replace(foundedMatch, ifFalseThen);
        } else {
            this.modifyTemplate = this.modifyTemplate.replace(foundedMatch, "");
        }
    }
}
