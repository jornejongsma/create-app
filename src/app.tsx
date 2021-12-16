import React from 'react';
import './style/main.scss';
import Helmet from './components/helmet';
import logo from './style/images/jj-logo.jpg'
import './style/fonts/Roboto-Regular.ttf'

interface Props {}

const App: React.FC<Props> = () => {
  return (
    <>
      <Helmet title="React App" />
      <div>Typescript App</div>
      <img src={logo}/>
    </>
  );
};

export default App;
