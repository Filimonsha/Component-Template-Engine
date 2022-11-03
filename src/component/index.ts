import {v4 as makeUUID} from "uuid";
import {EventBus} from "../eventBus";
import {Template} from "../templateEngine";
import {Events} from "./const";
import {AttributeHandler} from "../utils/componentAttributeHandler";

interface State {
    [stateName: string]: any
}

export interface Props<T> {
    state: T;
    events?: { [eventName: string]: EventListener };
};
type Children = { [childrenName: string]: Array<Component<any>> | Component<any> }

export abstract class Component<UserState extends State> {

    private eventBus = new EventBus();

    private element: HTMLElement | Element;

    private readonly template: Template;

    private readonly componentProps: Props<UserState>

    private componentState: UserState;

    private readonly componentChildren: object | null;


    private readonly componentId = `component-${makeUUID()}`;

    protected constructor(template: Template, props: Props<UserState>) {
        this.template = template;
        this.componentProps = props;
        this.componentChildren = this.findChildrenAndState(props.state);
        if (this.componentChildren) {
            this.createDummyChildren();
        }
        this.makeStateProxy();
        this.registerEvents();
        this.eventBus.notify(Events.INIT);

    }

    private registerEvents = () => {
        this.eventBus.subscribeCallbackOnEvent(Events.INIT, this.init.bind(this));
        this.eventBus.subscribeCallbackOnEvent(
            Events.COMPONENT_DID_MOUNT,
            this.componentDidMount.bind(this)
        );
        this.eventBus.subscribeCallbackOnEvent(
            Events.COMPONENT_RENDER,
            this.render.bind(this)
        );
        this.eventBus.subscribeCallbackOnEvent(
            Events.COMPONENT_DID_UPDATE,
            this.componentDidUpdate.bind(this)
        );
    };

    // State Proxy
    private makeStateProxy = () => {
        const handlers: ProxyHandler<any> = {
            set: (target, p, value) => {
                target[p] = value;
                console.log("Hm", target[p])

                this.eventBus.notify(Events.COMPONENT_DID_UPDATE);
                return true;
            },
        };
        this.componentState = new Proxy(this.componentProps.state, handlers);
    };

    private createDummyElement() {
        this.element = document.createElement("div");
    };

    // Events
    private init = () => {
        this.createDummyElement();
        this.eventBus.notify(Events.COMPONENT_RENDER);
    };

    private componentDidMount(oldProps: Props<UserState>) {
        console.log("component did mount", oldProps);
    }

    private componentDidUpdate() {
        console.log(" Component Did update!", this.componentState);
        this.eventBus.notify(Events.COMPONENT_RENDER);
    }

    private render = () => {
        const componentEvents = this.componentProps.events
        if (this.element && componentEvents) {
            Object.keys(componentEvents).forEach((eventName) => {
                this.element.removeEventListener(
                    eventName,
                    componentEvents[eventName]
                );
            });
        }

        // this.element.innerHTML = this.template.compile(this.componentState)
        console.log(this.element.children.length)
        // if (this.element.children.length > 1) {
        //     let compiledElement = document.createElement("div")
        //     compiledElement.innerHTML = this.template.compile(this.componentState)
        //     this.element.replaceWith(compiledElement.children[0])
        //
        // } else {
        this.element.innerHTML = this.template.compile(this.componentState)
        this.element = this.element.children[0]
        console.log(this.element.children)
        // }
        // this.element = compiledElement.children[0];

        const functionInState = Object.entries(this.componentState).reduce((prevValue, [stateName, stateValue]) => {
            if (typeof stateValue === "function") {
                return {...prevValue, [stateName]: stateValue}
            }
            return prevValue
        }, {})
        if (functionInState) AttributeHandler.handEventsAttributes.call(this, this.element, functionInState)

        if (this.componentChildren) {
            this.renderChildren();
        }

        if (componentEvents) {
            Object.keys(componentEvents).forEach((eventName) => {
                this.element.addEventListener(
                    eventName,
                    componentEvents[eventName].bind(this)
                );
            });
        }
    };

    // find children
    private findChildrenAndState = (state: State) => {
        const children: Children = {};

        Object.entries(state).forEach(([key, value]) => {
            const stateValueIsArray = Array.isArray(value);
            if (stateValueIsArray) {
                if (value.every((element) => element instanceof Component)) {
                    children[key] = [];
                    value.forEach((childElement: Component<UserState>) => {
                        // @ts-ignore
                        children[key].push(childElement);
                    });
                }
            } else if (value instanceof Component) {
                children[key] = value;
            }
        });
        return children;
    };

    private createDummyChildren() {
        this.componentChildren && Object.entries(this.componentChildren).forEach((children) => {
            const childrenName = children[0];
            const childrenValue: Component<any> | Array<Component<any>> = children[1];
            if (Array.isArray(childrenValue)) {
                childrenValue.forEach((child, index) => {
                    const childrenDummy = `
                <div id=${child.componentId}></div>
            `;
                    this.componentProps.state[childrenName][index] = childrenDummy;
                });
            } else {
                const childrenDummy = `
                <div id=${childrenValue.componentId}></div>
            `;
                // @ts-ignore
                this.componentProps.state[childrenName] = childrenDummy;
            }
        });
    }

    private renderChildren() {
        const renderOneChild = (child: Component<any>) => {
            const childrenId = `#${child.componentId.toString()}`;
            const foundChildrenDummy = this.element.querySelector(childrenId);
            if (foundChildrenDummy) {
                foundChildrenDummy.replaceWith(child.getCompiledElement());
            } else {
                throw new Error("In template didnt find children layout!");
            }
        };
        this.componentChildren && Object.values(this.componentChildren).forEach((children) => {
            if (Array.isArray(children)) children.forEach(renderOneChild);
            else renderOneChild(children);
        });
    }

    // User interaction
    public updateState = (stateName: string, newValue: any) => {
        const stateIsEqual = this.componentState[stateName] === newValue
        if (!stateIsEqual) {
            // @ts-ignore
            this.componentState[stateName] = newValue;
        }
    };

    public getState = () => ({...this.componentState});

    public getComponentChildren = () => ({...this.componentChildren});

    public getCompiledElement = () => this.element;

    public renderDom = (rootSelector: string) => {
        const root = document.querySelector(rootSelector);
        root && root.appendChild(this.element);
        this.eventBus.notify(Events.COMPONENT_DID_MOUNT);
    };
}
