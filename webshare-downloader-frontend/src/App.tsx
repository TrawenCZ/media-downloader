import React, { useEffect, useState } from 'react';
import './App.css';
import LinksForm from './components/LinksForm';
import NamedProgressBar from './components/NamedProgressBar';
import axios from "axios";
import { FaCopyright } from 'react-icons/fa';


export type DownloadState = {
  id: string,
  fileName: string,
  aliasName: string,
  progress: number,
  isQueued: boolean,
  remainingTime: string
}



function App() {
  const [shouldRender, setShouldRender] = React.useState(false);
  const [triggerUseEffect, setTriggerUseEffect] = React.useState(false);
  const [downloadStates, setDownloadStates] = useState(new Array<DownloadState>());

  function removeFile(fileToRemoveId: string) {
    axios.delete(`/api/downloads/${fileToRemoveId}`).then((res) => {
      setDownloadStates(downloadStates.filter((downloadState) => downloadState.id !== fileToRemoveId));
    }).catch((err) => {
      alert("Něco se pokazilo, zkuste to prosím znovu.\n\n" + err.response.data);
      fetchData();
      console.log(err);
    });
  }

  async function fetchData() {
    const res = await axios.get(`/api/downloads`);

    if (res.status >= 300) {
      alert("Něco se pokazilo, zkuste to prosím znovu.\n\n" + res.data);
      return;
    }

    const newDownloadStates: DownloadState[] = res.data;
    setDownloadStates(newDownloadStates);

    setShouldRender(true);
  }

  fetchData();

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <div className='header-div'>
      <h1>Video Downloader</h1>
      </div>
      <LinksForm forcedFetch={fetchData} />
      <div>
        {shouldRender && downloadStates.map((downloadState) => {
          return <NamedProgressBar key={downloadState.id} downloadState={downloadState} removeFileFunc={removeFile} />
        })
        }
      </div>
      <footer className='footer'>
          <FaCopyright className='copyright-icon'/> Trawen Solutions 2023
      </footer>
    </div>
  );
}

export default App;
