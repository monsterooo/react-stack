import $$observable from 'symbol-observable'

import ActionTypes from './utils/actionTypes'
import isPlainObject from './utils/isPlainObject'

/**
 * Creates a Redux store that holds the state tree.
 * The only way to change the data in the store is to call `dispatch()` on it.
 *
 * There should only be a single store in your app. To specify how different
 * parts of the state tree respond to actions, you may combine several reducers
 * into a single reducer function by using `combineReducers`.
 *
 * @param {Function} reducer A function that returns the next state tree, given
 * the current state tree and the action to handle.
 * reducer (Function): 接收两个参数，分别是当前的 state 树和要处理的 action，返回新的 state 树。
 *
 * @param {any} [preloadedState] The initial state. You may optionally specify it
 * to hydrate the state from the server in universal apps, or to restore a
 * previously serialized user session.
 * If you use `combineReducers` to produce the root reducer function, this must be
 * an object with the same shape as `combineReducers` keys.
 * [preloadedState] (any): 初始时的 state。
 * 在同构应用中，你可以决定是否把服务端传来的 state 水合（hydrate）后传给它，
 * 或者从之前保存的用户会话中恢复一个传给它。如果你使用 combineReducers 创建 reducer，
 * 它必须是一个普通对象，与传入的 keys 保持同样的结构。否则，你可以自由传入任何 reducer 可理解的内容。
 *
 * @param {Function} [enhancer] The store enhancer. You may optionally specify it
 * to enhance the store with third-party capabilities such as middleware,
 * time travel, persistence, etc. The only store enhancer that ships with Redux
 * is `applyMiddleware()`.
 * enhancer (Function): Store enhancer 是一个组合 store creator 的高阶函数，
 * 返回一个新的强化过的 store creator。这与 middleware 相似，它也允许你通过复合函数改变 store 接口。
 *
 * @returns {Store} A Redux store that lets you read the state, dispatch actions
 * and subscribe to changes.
 */
export default function createStore(reducer, preloadedState, enhancer) {
  // enhancer增强函数检测，如果enhancer为空，并且preloadedState为一个函数则认定preloadedState是增强函数
  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
    enhancer = preloadedState
    preloadedState = undefined
  }
  // 增强函数规定必须为一个函数
  if (typeof enhancer !== 'undefined') {
    if (typeof enhancer !== 'function') {
      throw new Error('Expected the enhancer to be a function.')
    }
    // 增强函数，使用applyMiddlewarea对createStore进行包装
    return enhancer(createStore)(reducer, preloadedState)
  }
  // reducer必须为一个函数
  if (typeof reducer !== 'function') {
    throw new Error('Expected the reducer to be a function.')
  }

  let currentReducer = reducer // 保存传递进来的reducer
  let currentState = preloadedState // 保存初始化的reducer
  let currentListeners = [] // 当前订阅列表
  let nextListeners = currentListeners // 下一个订阅列表
  let isDispatching = false // 是否处理reducer中 相见：https://redux.js.org/api-reference/createstore

  // 确保可以改变下一个监听器
  function ensureCanMutateNextListeners() {
    // 只有当nextListeners等于currentListeners的时候获取一个监听事件列表的拷贝
    if (nextListeners === currentListeners) {
      // 浅拷贝当前监听事件数组到nextListeners
      nextListeners = currentListeners.slice() // nextListeners获取所有订阅列表，浅拷贝数组
    }
  }

  /**
   * Reads the state tree managed by the store.
   * 从store总读取state状态树
   *
   * @returns {any} The current state tree of your application.
   * @returns {any} 返回当前状态树给你的应用程序
   */
  function getState() {
    if (isDispatching) { // 不能在reducer中读取store数据
      throw new Error(
        'You may not call store.getState() while the reducer is executing. ' +
          'The reducer has already received the state as an argument. ' +
          'Pass it down from the top reducer instead of reading it from the store.'
      )
    }

    return currentState // 返回当前状态树
  }

  /**
   * Adds a change listener. It will be called any time an action is dispatched,
   * and some part of the state tree may potentially have changed. You may then
   * call `getState()` to read the current state tree inside the callback.
   * 添加一个监听器
   *
   * You may call `dispatch()` from a change listener, with the following
   * caveats:
   *
   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
   * If you subscribe or unsubscribe while the listeners are being invoked, this
   * will not have any effect on the `dispatch()` that is currently in progress.
   * However, the next `dispatch()` call, whether nested or not, will use a more
   * recent snapshot of the subscription list.
   *
   * 2. The listener should not expect to see all state changes, as the state
   * might have been updated multiple times during a nested `dispatch()` before
   * the listener is called. It is, however, guaranteed that all subscribers
   * registered before the `dispatch()` started will be called with the latest
   * state by the time it exits.
   *
   * @param {Function} listener A callback to be invoked on every dispatch.
   * @returns {Function} A function to remove this change listener.
   */
  function subscribe(listener) {
    if (typeof listener !== 'function') { // 监听必须是一个函数
      throw new Error('Expected the listener to be a function.')
    }

    if (isDispatching) { // 不能在reducer中订阅事件
      throw new Error(
        'You may not call store.subscribe() while the reducer is executing. ' +
          'If you would like to be notified after the store has been updated, subscribe from a ' +
          'component and invoke store.getState() in the callback to access the latest state. ' +
          'See http://redux.js.org/docs/api/Store.html#subscribe for more details.'
      )
    }

    let isSubscribed = true // 设置状态在订阅中

    ensureCanMutateNextListeners() // 获取订阅列表
    nextListeners.push(listener) // 给nextListeners增加一个订阅

    // 取消订阅
    return function unsubscribe() {
      if (!isSubscribed) { // 不在订阅中不能取消
        return
      }

      if (isDispatching) { // 在reducer执行中不能取消订阅
        throw new Error(
          'You may not unsubscribe from a store listener while the reducer is executing. ' +
            'See http://redux.js.org/docs/api/Store.html#subscribe for more details.'
        )
      }

      isSubscribed = false // 订阅状态为未订阅中

      ensureCanMutateNextListeners() // 拿到下一次的监听函数
      const index = nextListeners.indexOf(listener) // 查找监听函数
      nextListeners.splice(index, 1) // 从下一次监听列表中删除它
    }
  }

  /**
   * Dispatches an action. It is the only way to trigger a state change.
   *
   * The `reducer` function, used to create the store, will be called with the
   * current state tree and the given `action`. Its return value will
   * be considered the **next** state of the tree, and the change listeners
   * will be notified.
   *
   * The base implementation only supports plain object actions. If you want to
   * dispatch a Promise, an Observable, a thunk, or something else, you need to
   * wrap your store creating function into the corresponding middleware. For
   * example, see the documentation for the `redux-thunk` package. Even the
   * middleware will eventually dispatch plain object actions using this method.
   *
   * @param {Object} action A plain object representing “what changed”. It is
   * a good idea to keep actions serializable so you can record and replay user
   * sessions, or use the time travelling `redux-devtools`. An action must have
   * a `type` property which may not be `undefined`. It is a good idea to use
   * string constants for action types.
   *
   * @returns {Object} For convenience, the same action object you dispatched.
   *
   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
   * return something else (for example, a Promise you can await).
   */
  function dispatch(action) {
    if (!isPlainObject(action)) { // action必须是纯对象
      throw new Error(
        'Actions must be plain objects. ' +
          'Use custom middleware for async actions.'
      )
    }

    if (typeof action.type === 'undefined') { // action.type必须有值
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
          'Have you misspelled a constant?'
      )
    }

    if (isDispatching) { // 在reducer中不能调用dispatch
      throw new Error('Reducers may not dispatch actions.')
    }

    // 调用reducer并且isDispatching调用状态设置为flase
    // 这里使用try catch为了使线程复活 https://github.com/reactjs/redux/pull/372#issuecomment-369806261
    try {
      isDispatching = true
      currentState = currentReducer(currentState, action) // 调用reducers
    } finally {
      isDispatching = false
    }
    // 当一个dispatch执行完毕后把nextListeners的引用赋值给currentListeners
    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener() // 通知订阅事件
    }

    return action
  }

  /**
   * Replaces the reducer currently used by the store to calculate the state.
   * 可以使用该函数替换当前保存的store
   *
   * You might need this if your app implements code splitting and you want to
   * load some of the reducers dynamically. You might also need this if you
   * implement a hot reloading mechanism for Redux.
   *
   * @param {Function} nextReducer The reducer for the store to use instead.
   * @returns {void}
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== 'function') {
      throw new Error('Expected the nextReducer to be a function.')
    }

    currentReducer = nextReducer
    dispatch({ type: ActionTypes.REPLACE })
  }

  /**
   * Interoperability point for observable/reactive libraries.
   * @returns {observable} A minimal observable of state changes.
   * For more information, see the observable proposal:
   * https://github.com/tc39/proposal-observable
   */
  function observable() {
    const outerSubscribe = subscribe
    return {
      /**
       * The minimal observable subscription method.
       * @param {Object} observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns {subscription} An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */
      subscribe(observer) {
        if (typeof observer !== 'object') {
          throw new TypeError('Expected the observer to be an object.')
        }

        function observeState() {
          if (observer.next) {
            observer.next(getState())
          }
        }

        observeState()
        const unsubscribe = outerSubscribe(observeState)
        return { unsubscribe }
      },

      [$$observable]() {
        return this
      }
    }
  }

  // When a store is created, an "INIT" action is dispatched so that every
  // reducer returns their initial state. This effectively populates
  // the initial state tree.
  // 当一个store被创建后，一个'INIT'action会被派发，这样每个reducer都会回到初始化state。这有效的填充了初始状态树
  dispatch({ type: ActionTypes.INIT })

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
    [$$observable]: observable
  }
}
