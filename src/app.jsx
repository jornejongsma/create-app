import React from 'react';
import './style/main.scss';
import Helmet from './components/helmet';
import logo from './style/images/jj-logo.jpg'

const App = () => {
  return (
    <>
      <Helmet title={"React App"}/>
      <div>Javascript App</div>
      <img src={logo}/>
    </>
  );
};

export default App;
