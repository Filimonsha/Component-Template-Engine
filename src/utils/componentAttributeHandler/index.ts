import {EVENTS} from "../const/customAttributes";

export class AttributeHandler {

    static handEventsAttributes(handlingElement: HTMLElement | Element, handlers: { [handlerName: string]: EventListener }) {
        Object.entries(EVENTS).forEach(([event, eventName]) => {
            const foundElements = handlingElement.querySelectorAll(`[${eventName}]`);
            foundElements.forEach(foundElement => {
                const handlerCallback = foundElement.getAttribute(eventName)
                if (handlerCallback && handlers[handlerCallback]) {
                    foundElement.addEventListener(event.toLowerCase(), handlers[handlerCallback].bind(this))
                }
            })
        })

    }


}
