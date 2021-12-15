import React from 'react';
import './style/main.scss';
import Helmet from './components/helmet';

const App = () => {
  return (
    <>
      <Helmet title={"React App"}/>
      <div>Hello World</div>
    </>
  );
};

export default App;
