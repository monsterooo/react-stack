import compose from './compose'

/**
 * Creates a store enhancer that applies middleware to the dispatch method
 * of the Redux store. This is handy for a variety of tasks, such as expressing
 * asynchronous actions in a concise manner, or logging every action payload.
 *
 * See `redux-thunk` package as an example of the Redux middleware.
 *
 * Because middleware is potentially asynchronous, this should be the first
 * store enhancer in the composition chain.
 *
 * Note that each middleware will be given the `dispatch` and `getState` functions
 * as named arguments.
 *
 * @param {...Function} middlewares The middleware chain to be applied.
 * @returns {Function} A store enhancer applying the middleware.
 */
export default function applyMiddleware(...middlewares) {
  return createStore => (...args) => {
    // 使用reducer, preloadedState重新创建store
    const store = createStore(...args)
    let dispatch = () => {
      throw new Error(
        `Dispatching while constructing your middleware is not allowed. ` +
          `Other middleware would not be applied to this dispatch.`
      )
    }
    // 链栈
    let chain = []
    // 中间件api，引用store的api
    const middlewareAPI = {
      getState: store.getState,
      dispatch: (...args) => dispatch(...args)
    }
    // 执行中间件函数第一层，返回(next) => (action) => {}
    // 传入 getState和dispatch给中间件调用，中间件会返回一个函数(next)它保存在chain中
    chain = middlewares.map(middleware => middleware(middlewareAPI))
    // store.dispatch作为next的参数传入
    // 这里执行中间件函数第二层，返回(action) => {}
    dispatch = compose(...chain)(store.dispatch)
    // 返回的dispatch是中间件的函数(action) => {} 这样就会先进入中间件的执行
    return {
      ...store,
      dispatch
    }
  }
}
