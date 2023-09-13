import React, { useEffect, useState } from 'react';
import './App.css';
import LinksForm from './components/LinksForm';
import NamedProgressBar from './components/NamedProgressBar';
import axios from "axios";

export type ActiveFile = {
  id: string,
  fileName: string,
  aliasName: string,
  progress: number,
  isQueued: boolean,
  remainingTime: string
}

export type FileHook = {
  id: string,
  fileHook: ActiveFile,
  setFile: React.Dispatch<React.SetStateAction<ActiveFile>>,
  showFinishButtonHook: boolean,
  setShowFinishButton: React.Dispatch<React.SetStateAction<boolean>>
}



function App() {
  const [shouldRender, setShouldRender] = React.useState(false);
  const [triggerUseEffect, setTriggerUseEffect] = React.useState(false);
  // const [fileHooks, setFileHooks] = useState(new Array<FileHook>());
  const [progressBarsHooks, setProgressBarsHooks] = useState(new Array<FileHook>());
  var fileHooksIds: string[] = [];


  const useFetch = (url: string) => {
    const [data, setData] = useState(null);
  
    useEffect(() => {
      fetch(url)
        .then((res) => res.json())
        .then((data) => setData(data));
    }, [url]);
  
    return [data];
  };


  function removeFile(fileToRemove: string) {
    axios.delete(`/api/downloads/${fileToRemove}`).then((res) => {
      setProgressBarsHooks(progressBarsHooks.filter((progressBarHook) => progressBarHook.fileHook.fileName !== fileToRemove));
    }).catch((err) => {
      alert('Něco se pokazilo, zkuste to prosím znovu.');
      fetchData();
      console.log(err);
    });
  }

  async function fetchData() {
    const newActiveFiles: ActiveFile[] = (await axios.get(`/api/downloads`)).data;

    const newActiveFilesIds = newActiveFiles.map((file) => file.id);
    var progressBarsHooksCopy = [...progressBarsHooks];
    progressBarsHooksCopy = progressBarsHooks.filter((fileHook) => { newActiveFilesIds.includes(fileHook.id) })

    newActiveFiles.forEach((file) => {
      if (fileHooksIds.includes(file.id)) {
        const existingEntry = progressBarsHooksCopy.find((hook) => hook.id === file.id)!;
        existingEntry.setFile(file);
        existingEntry.setShowFinishButton(file.progress === 100);
      } else {
        const [ newFileHook, setNewFileHook ] = useState(file);
        const [ newShowFinishButton, setNewShowFinishButton ] = useState(file.progress === 100);
        progressBarsHooksCopy.push({ id: file.id, fileHook: newFileHook, setFile: setNewFileHook, showFinishButtonHook: newShowFinishButton, setShowFinishButton: setNewShowFinishButton });
      }
    });

    fileHooksIds = progressBarsHooksCopy.map((fileHook) => fileHook.id);

    setProgressBarsHooks(progressBarsHooksCopy);

    setShouldRender(true);
  }

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <div className='header-div'>
      <h1>WebShare Downloader by Dominik and Adam</h1>
      </div>
      <LinksForm callbackValue={triggerUseEffect} callback={setTriggerUseEffect}/>
      <div>
        {shouldRender && progressBarsHooks.map((progressBarHook) => {
          return <NamedProgressBar key={progressBarHook.fileHook.id} file={progressBarHook.fileHook} showFinishButton={progressBarHook.showFinishButtonHook} removeFileFunc={removeFile} />
        })
        }
      </div>
    </div>
  );
}

export default App;
