import ProgressBar from "@ramonak/react-progress-bar";
import { DownloadState } from '../App';
import { FaClock, FaCheckCircle } from 'react-icons/fa';


type props = {
  downloadState: DownloadState,
  removeFileFunc: (fileId: string) => void
}

export default function NamedProgressBar({downloadState: {id, fileName, aliasName, progress, isQueued, remainingTime}, removeFileFunc}: props) {
  console.log(id, fileName, aliasName, progress, isQueued, remainingTime);

  return <div className={'progress-bar-component'}>
    {!isQueued &&
      <div className={`box-border${progress === 100 ? " completed" : ""}`}>
        {progress === 100 && <FaCheckCircle className='check-icon'/>}
        <p className='remaining-time'>{remainingTime}</p>
      </div>
    }
    <div className='info-column'>

      <p className='alias-name'>{aliasName ? aliasName : fileName}</p>
      {aliasName &&
        <p className='file-name' >{"\n"}{aliasName ? fileName : ""}</p>
      }
    </div>
    {isQueued && progress === 0 && <p className='queue-info'>Čeká ve frontě <FaClock /> </p> }
    {(!isQueued || progress !== 0) &&
      <ProgressBar 
          completed={progress}
          animateOnRender={true}
          bgColor="#5E5DF0"
          baseBgColor='#969696'
          className='progress-bar-status'
          labelAlignment='outside'
      />
    }
    {(progress === 100) && <button className='button-nice button-nice-completed' onClick={() => removeFileFunc(id)}>Dokončit</button>}
  </div>;
}
