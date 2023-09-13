import { useState, useEffect } from 'react';
import ProgressBar from "@ramonak/react-progress-bar";
import axios from "axios";
import { ActiveFile } from '../App';


type props = {
  file: ActiveFile,
  showFinishButton: boolean,
  removeFileFunc: (fileName: string) => void
}

export default function NamedProgressBar({file, showFinishButton, removeFileFunc}: props) {

  return <div className={'progress-bar-component'}>
    <div className='info-line'>
      <p className='alias-name'>{file.aliasName}</p>
      <p className='file-name' >{file.fileName}</p>
      <div className='box-border'>
        <p className='remaining-time'>{file.remainingTime}</p>
      </div>
    </div>
    {file.isQueued && file.progress === 0 && <p className='alias-name'>Čeká ve frontě</p> }¨
    {(!file.isQueued || file.progress !== 0) &&
      <ProgressBar 
          completed={file.progress}
          animateOnRender={true}
          bgColor="#5E5DF0"
          baseBgColor='#969696'
          className='progress-bar-status'
          labelAlignment='outside'
      />
    }
    {showFinishButton && <button className='button-nice button-nice-completed' onClick={() => removeFileFunc(file.fileName)}>Dokončit</button>}
  </div>;
}
