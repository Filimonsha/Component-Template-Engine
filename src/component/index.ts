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
    private renderCount = 0
    private element: HTMLElement | Element;

    private readonly template: Template;

    private readonly componentProps: Props<UserState>

    private componentState: UserState;

    private componentChildren: object | null;


    private readonly componentId = `component-${makeUUID()}`;

    protected constructor(template: Template, props: Props<UserState>) {
        this.template = template;
        this.componentProps = props;
        this.componentChildren = this.findChildrenAndState(props.state);


        if (this.componentChildren) {
            this.createDummyChildren();
        }
        this.makeStateProxy();
        if (this.componentState?.chatItems) {
        }
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
                const stateValueIsArray = Array.isArray(value);
                if (stateValueIsArray) {
                    if (value.every((element) => element instanceof Component)) {
                        if (this.componentChildren) {
                            // @ts-ignore
                            this.componentChildren[p] = [];
                        } else {
                            //TODO componentChildren = {}
                        }
                        value.forEach((childElement: Component<UserState>) => {
                            // @ts-ignore
                            this.componentChildren?.[p].push(childElement);
                        });
                        this.createDummyChildren();

                    }else if (value.includes((element: any) => element instanceof Component)) {
                        // @ts-ignore
                        this.componentChildren[p] = value.find(element => element instanceof Component)

                        this.createDummyChildren();

                        // children[key] =
                    }
                }

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
        //TODO
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
        this.renderCount += 1
        const componentEvents = this.componentProps.events
        if (this.componentProps.events){
            for (const key in componentEvents){
                componentEvents[key] = this.componentProps.events[key].bind(this)
            }
        }

        if (this.element && componentEvents) {
            Object.keys(componentEvents).forEach((eventName) => {
                this.element.removeEventListener(
                    eventName,
                    componentEvents[eventName]
                );
            });
        }

        // const fragment = document.createElement('template');
        // fragment.innerHTML = this.template.compile(this.componentState)
        // this.element.innerHTML = ""
        // this.element.appendChild(fragment.content)
        // fragment.content;


        //TODO
        if (this.renderCount > 1) {

            // @ts-ignore
            this.element.innerHTML = document.createElement("div");

            this.element.innerHTML = this.template.compile(this.componentState)

        } else {
            this.element.innerHTML = this.template.compile(this.componentState)
            this.element = this.element.children[0]
        }


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
                    componentEvents[eventName]
                );
            });
        }
    };

    // find children
    private findChildrenAndState = (state: State) => {
        const children: Children = {};
        state && Object.entries(state).forEach(([key, value]) => {
            const stateValueIsArray = Array.isArray(value);

            if (stateValueIsArray) {

                if (value.every((element) => element instanceof Component)) {
                    console.log(1)
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
    public updateState = <T>(stateName: string, newValue: T) => {
        const stateIsEqual = this.componentState[stateName] === newValue
        if (!stateIsEqual) {
            // @ts-ignore
            this.componentState[stateName as keyof t ] = newValue;
        }
    };

    public getState = () => ({...this.componentState});

    public getComponentChildren = () => ({...this.componentChildren});

    public getCompiledElement = () => this.element;


    public renderDom = (rootSelector: string) => {
        const root = document.querySelector(rootSelector);
        root && root.replaceChildren(this.element);
        this.eventBus.notify(Events.COMPONENT_DID_MOUNT);
    };
}
