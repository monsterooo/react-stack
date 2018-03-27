import { combineReducers } from '../source/redux/src';
import counter from './counter';
import todos from './todos';

export default combineReducers({
  counter,
  todos
})
