import React from 'react';
import ReactHelmet from 'react-helmet';
import icon from '../style/images/jj-logo-32x32.png';

const Helmet = ({ title }) => {
  return (
    <ReactHelmet>
      <link rel="icon" href={icon}></link>
      <title>{title}</title>
    </ReactHelmet>
  );
};

export default Helmet;
