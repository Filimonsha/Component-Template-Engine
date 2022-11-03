# Important 🤫

This is web messenger build on typescript,scss
and own Template Engine which build on Regexp and typescript classes.

## Installation

On start clone repository and install all dependencies

```bash
git clone https://github.com/Filimonsha/cubegramm.git
npm i
```
So if you want to run dev application just write
```bash
npm run dev
//Or buid project
npm run build
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
#### If you want just use compiling Template function which return to you simple string without Component life cycle  - use Template.compile()
```js
const messageContext = {
    user:"Test uest",
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
    text: "hello",
};

class Messages extends Component {
    constructor(props) {
        super(messagesTemplate, props);
    }
}

export const MessagesComponent = new Messages(MessagesProps);
```

## License
![img.png](img.png)
