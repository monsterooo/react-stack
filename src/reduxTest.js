import React from 'react';
import ReactDOM from 'react-dom';
// import { createStore } from 'redux';
import { createStore, applyMiddleware } from './redux/source/redux/src';
import Counter from './redux/Counter';
import rootReducer from './redux/reducers';
// import counter from './redux/reducers';
// import todos from './redux/reducers/todos';

function logger({ getState }) {
  return (next) => (action) => {
    console.log('will dispatch', action)

    // 调用 middleware 链中下一个 middleware 的 dispatch。
    let returnValue = next(action)

    console.log('state after dispatch', getState())

    // 一般会是 action 本身，除非
    // 后面的 middleware 修改了它。
    return returnValue
  }
}
// function trick({ getState }) {
//   return (next) => (action) => {
//     console.log('trick', action)
//
//     // 调用 middleware 链中下一个 middleware 的 dispatch。
//     let returnValue = next(action)
//
//     console.log('trick state after dispatch', getState())
//
//     // 一般会是 action 本身，除非
//     // 后面的 middleware 修改了它。
//     return returnValue
//   }
// }

debugger
const store = createStore(rootReducer);
const rootEl = document.getElementById('root')
const render = () => ReactDOM.render(
  <Counter
    value={store.getState().counter}
    onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
    onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
  />,
  rootEl
)

render()
store.subscribe(render)
