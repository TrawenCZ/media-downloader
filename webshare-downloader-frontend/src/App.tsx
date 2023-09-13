import React, { useEffect } from 'react';
import './App.css';
import LinksForm from './components/LinksForm';
import NamedProgressBar from './components/NamedProgressBar';
import axios from "axios";

export type activeFile = {
  fileName: string,
  progress: number,
  remainingTime: string
}

function App() {
  const [shouldRender, setShouldRender] = React.useState(false);
  const [activeFiles, setActiveFiles] = React.useState<activeFile[]>([]);
  const [triggerUseEffect, setTriggerUseEffect] = React.useState(false);

  function updateActiveFiles(fileToRemove: string) {
    axios.delete(`${process.env.REACT_APP_HOST_ADDRESS}/api/downloads/${fileToRemove}`).then((res) => {
      setActiveFiles(activeFiles.filter((file) => file.fileName !== fileToRemove));
    }).catch((err) => {
      alert('Něco se pokazilo, zkuste to prosím znovu.');
      fetchData();
      console.log(err);
    });
  }

  async function fetchData() {
    await axios.get(`${process.env.REACT_APP_HOST_ADDRESS}/api/downloads`).then((res) => {
      setActiveFiles(res.data);
      setShouldRender(true);
    }).catch((err) => {
      console.log(err);
    });
  }

  useEffect(() => {
    fetchData();
  }, [triggerUseEffect]);

  return (
    <div className="App">
      <div className='header-div'>
      <h1>WebShare Downloader by Dominik and Adam</h1>
      </div>
      <LinksForm callbackValue={triggerUseEffect} callback={setTriggerUseEffect}/>
      <div>
        {shouldRender && activeFiles.map((file) => {
          return <NamedProgressBar key={file.fileName} fileName={file.fileName} initProgress={file.progress} remainingTime={file.remainingTime} updateComponent={updateActiveFiles} />
        })
        }
      </div>
    </div>
  );
}

export default App;
