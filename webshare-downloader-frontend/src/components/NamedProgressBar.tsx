import { useState, useEffect } from 'react';
import ProgressBar from "@ramonak/react-progress-bar";
import axios from "axios";


type props = {
    fileName: string,
    initProgress: number,
    remainingTime: string,
    updateComponent: Function
}

export default function NamedProgressBar({fileName, initProgress, remainingTime, updateComponent}: props) {
    const [progress, setProgress] = useState(initProgress);
    const [showFinishButton, setShowFinishButton] = useState(initProgress === 100);

  useEffect(() => {
    const interval = setInterval(() => {
      axios.get(`${process.env.REACT_APP_HOST_ADDRESS}/api/downloads/${fileName}`).then((res) => {
        setProgress(res.data.progress);
        if (res.data.progress === 100) {
          setShowFinishButton(true);
        }
      }).catch((err) => {
        console.log(err);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return <div className={'progress-bar-component'}>
    <div className='info-line'>
      <p className='file-name' >{fileName}</p>
      <div className='box-border'>
        <p className='remaining-time'>{remainingTime}</p>
      </div>
    </div>
    <ProgressBar 
        completed={progress}
        animateOnRender={true}
        bgColor="#5E5DF0"
        baseBgColor='#969696'
        className='progress-bar-status'
        labelAlignment='outside'
    />
    {showFinishButton && <button className='button-nice button-nice-completed' onClick={() => updateComponent(fileName)}>Dokončit</button>}
  </div>;
}
