import React from 'react';
import './style/main.scss';
import Helmet from './components/helmet';

interface Props {}

const App: React.FC<Props> = () => {
  return (
    <>
      <Helmet title="React App" />
      <div>Hello World</div>
    </>
  );
};

export default App;
