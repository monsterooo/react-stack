import React from 'react';
import ReactDOM from 'react-dom';
// import { createStore } from 'redux';
import { createStore } from './redux/source/redux/src';
import Counter from './redux/Counter';
import counter from './redux/reducers';

debugger;
const store = createStore(counter);
const rootEl = document.getElementById('root')
const render = () => ReactDOM.render(
  <Counter
    value={store.getState()}
    onIncrement={() => store.dispatch({ type: 'INCREMENT' })}
    onDecrement={() => store.dispatch({ type: 'DECREMENT' })}
  />,
  rootEl
)

render()
store.subscribe(render)