import * as React from 'react';

import Controls from './controls';

import Map from './map.jsx'

import '../../../styles/console.css';

export default function Console() {
  return (
    <div className='console'>
      <Map/>
      <Controls/>
    </div>
  )
}