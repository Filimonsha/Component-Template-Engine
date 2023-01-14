import {UseRouteOptions} from "./router";
import {Component} from "../component";

type CreateOptionsType = {
    mountingPlace: string,
    useRouteOptions: UseRouteOptions
}


export default class Route {
    private readonly pathName: string;
    private readonly createOptions: CreateOptionsType;
    private component: Component<any>;

    constructor(pathName: string, component: Component<any>, createOptions: CreateOptionsType) {
        this.pathName = pathName;
        this.createOptions = createOptions;
        this.component = component;
    }

    public renderRoute() {
        if (this.createOptions.useRouteOptions?.renderCondition) {
            if (this.createOptions.useRouteOptions?.renderCondition()) {
                this.component.renderDom(this.createOptions.mountingPlace)
            }
        }else {
            this.component.renderDom(this.createOptions.mountingPlace)
        }
    }

    public matchRoute(routePathName: string) {
        return this.pathName === routePathName
    }

    public getRoutePathName() {
        return this.pathName
    }

    public disableRouteDisplay() {
        this.component?.getCompiledElement().remove()
    }
}
