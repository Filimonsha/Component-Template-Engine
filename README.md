# Important 🤫

This is a custom implementation of a tool for creating a component with a lifecycle, statefulness and its own templating engine.

## Installation

```bash
npm i component-template-engine
```

# Component dynamic template engine

This util can help you to create components with dynamic templates.

## Usage

Usage is simple as well!

### 1. For layout your component you need just create instance of Template class

```js
    export const defaultBtnTemplate = new Template(`
    <button class="btn">
       <span class="btn_text">
         {{!text!}}
        </span>
     </button>
    `)
```

If you want to dynamical render constructions use " { { } } "
There you can render:

1 - variables. Just wrap your variable in '! !'

2 - condition. Use scheme like ' if ( condition ) then {//what do you want to eval} '

```js
export const messageTemplate = new Template(`
        <div class="message {{ if ( !user! ==="home") then {Just simple string} }} ">
            {{ !messageText! }}
        </div>
`)
```

#### If you want just use compiling Template function which return to you simple string without Component life cycle - use Template.compile()

```js
const messageContext = {
    user: "Test uest",
    messageText: "Hello word!"
}
export const messageTemplate = new Template(`
        <div class="message {{ if ( !user! ==="home") then {Just simple string} }} ">
            {{ !messageText! }}
        </div>
`).compile(messageContext) // Return you compiled string with pasting context
```

### 2. After creating layout your component - create a class which extends Block.

Block class contain all logic that will be rule your component.So you need give constructor template and props.

```js
export class Message extends Component {
    constructor(props) {
        super(messageTemplate, props);
    }
}
```

!!! Component props includes two things:

1. Your state. This is what be observable and if that state change - component will be rerender.
2. Events. There you describe callbacks which will be added on event listeners on yor component.

```ts
export interface Props<T> {
    state: T;
    events?: { [eventName: string]: EventListener };
};
```

Usage typescript: There is example you want to describe your state.

```ts
type MessageState = {
    user: string,
    messageText: string
}

export class Message extends Block<MessageState> {
    constructor(props: Props<MessageState>) {
        super(messageTemplate, props);
    }
}
```

So now you can use this component!

```js
const messagesData = [
    {
        user: '"user"',
        messageText:
            "Привет! Смотри, тут всплыл интересный кусок лунной космической истории — НАСА в какой-то момент попросила" +
            " Хассельблад адаптировать модель SWC для полетов на Луну. Сейчас мы все знаем что астронавты летали с моделью 500 EL — и к слову говоря, все тушки этих камер все еще находятся на поверхности Луны," +
            " так как астронавты с собой забрали только кассеты с пленкой Хассельблад в итоге адаптировал SWC для космоса, но что-то пошло не так и на ракету они так никогда и не попали. Всего их было произведено 25 штук," +
            " одну из них недавно продали на аукционе за 45000 евро.",
    },
    {
        user: '"home"',
        messageText: "Hello!",
    },
    {
        user: '"some"',
        messageText: "Hello!",
    },
];
const MessagesProps = {
    state: {
        messages: messagesData.map(
            (messageData) =>
                new Message({
                    state: messageData,
                })
        ),
    },
};

class Messages extends Component {
    constructor(props) {
        super(messagesTemplate, props);
    }
}

export const MessagesComponent = new Messages(MessagesProps);
```

#### What about use events callbacks as an attribute value ?

Easily! Just set attribute which starts with "on-\\event" and set as value name of your callback that in your state!

```js
//Input.ts
type
InputState = {
    value: string,
    type: string,
    handleBlur: EventListener,
    handleFocus: EventListener,
}
//...
//input.tmpl.ts
const inputTemplate = new Template(`
     <label class="input__with-label">
          <input on-focus={{handleFocus}} on-blur={{handleBlur}} name="{{!name!}}" value="{{!value!}}"  type="{{!type !}}" placeholder={{!placeholder!}}  class="input__with-label_input" type="text" name="login" id="LOGIN">
    </label>
`);
```

### 3. Render your entry Component into DOM.

Component have 5 public methods that you can use.

```js
updateState = (stateName: string, newValue: any) => {
    //...
};
getState = () => ({...this.componentState});

getComponentChildren = () => ({...this.componentChildren});

getCompiledElement = () => {
    //...
}
renderDom = (rootSelector: string) => {
    //...
}
```
So if you want to update state and force your component to rerender - use updateState().
This func you can easily use in your callbacks:
```ts
 const testProps = {
    state:{
        handleBlur({target}) {
            this.updateState("value",target.value)
        },
    }
}
```
### 4. Use routing.

To use routing without page update - use Route and Router classes.

```ts
const router = new Router()

//register yout routers 

router
    .use("/messenger", ChatLayoutComponent, {
    renderCondition: ifUserNotAuthedHandler
    })
    .use("/", LoginLayoutComponent, {
        renderCondition: ifUserAuthedHandler
    })
    .use("/sign-up", RegistrationLayoutComponent, {
        renderCondition: ifUserAuthedHandler
    })
    .use("/settings", UserProfileLayout, {
        renderCondition: ifUserNotAuthedHandler
    })

router.start()
```

For redirect use ```go``` method 
```ts
const ifUserAuthedHandler = () => {
    if (localStorage.getItem("currentUserId")) {
        router.go("/messenger")
        return false
    } else return true
}
```
