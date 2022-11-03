interface IEventBus {
    subscribeCallbackOnEvent: (eventName: string, callback: Function) => void,
    unSubscribeCallbackFromEvent: (eventName: string, callback: Function) => void,
    notify: (eventName: string) => void
}

type Listeners = { [event: string]: Array<Function> }

export class EventBus implements IEventBus {
    private listeners: Listeners = {};

    subscribeCallbackOnEvent(eventName: string, callback: Function): void {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }

        this.listeners[eventName]?.push(callback);
    }

    unSubscribeCallbackFromEvent(eventName: string, callback: Function): void {
        if (!this.listeners[eventName]) {
            throw new Error('This event does not exist');
        }

        this.listeners[eventName] = this.listeners[eventName].filter(
            (listener) => listener !== callback,
        );
    }

    notify(eventName: string, ...args: any[]) {
        if (!this.listeners[eventName]) {
            throw new Event(`This event does not exist: ${eventName}`);
        }

        this.listeners[eventName].forEach((listener) => {
            listener(...args);
        });
    }
}
