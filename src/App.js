import React from 'react';
import { Provider } from 'react-redux'
import { renderRoutes } from 'react-router-config'
import { BrowserRouter } from 'react-router-dom'

import { GlobalStyle } from './style'
import { IconStyle } from './assets/iconfont/iconfont'

import store from './store/index'
import routes from './routes/index'
import { Data } from './application/Singers/data'

function App() {
  return (
    <Provider store = {store}>
      <BrowserRouter>
        <GlobalStyle></GlobalStyle>
        <IconStyle></IconStyle>
        <Data>
          { renderRoutes(routes) }
        </Data>
      </BrowserRouter>
    </Provider>

  );
}

export default App;
