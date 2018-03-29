import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { compose, pure, withState, withHandlers, withProps } from 'recompose';

const Visible = compose(
  pure,
  withState('isVisible', 'toggleVis', false),
  withHandlers({
    toggleVisibility: ({ toggleVis, isVisible }) => {
      return (event) => {
        return toggleVis(!isVisible);
      }
    },
  }),
  withProps(({ isVisible }) => {
    return {
      title: isVisible ? '显示标题' : '默认标题',
      message: isVisible ? '嗨，我显示了' : '我还没有显示呢！'
    }
  })
)(({ title, message }) => {
  console.log('recompose render');
  return (<div>{title}-{message}</div>)
})

class App extends Component {
  state = {
    count: 0
  }
  componentDidMount() {
    setInterval(() => {
      this.setState((prevState, props) => ({count: ++prevState.count}))
    }, 2000)
  }
  render() {
    return (
      <div>
        <div>app count:{this.state.count}</div>
        <Visible />
      </div>
    )
  }
}

const rootEl = document.getElementById('root')
const render = () => ReactDOM.render(
  <App />,
  rootEl
)
render()
