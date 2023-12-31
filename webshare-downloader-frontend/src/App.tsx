import React, { useEffect, useState } from "react";
import "./App.css";
import LinksForm from "./components/LinksForm";
import NamedProgressBar from "./components/NamedProgressBar";
import axios from "axios";

export type DownloadState = {
  id: string;
  fileName: string;
  aliasName: string;
  progress: number;
  isQueued: boolean;
  remainingTime: string;
};

function App() {
  const [shouldRender, setShouldRender] = React.useState(false);
  const [downloadStates, setDownloadStates] = useState(
    new Array<DownloadState>()
  );

  function removeFile(fileToRemoveId: string) {
    axios
      .delete(`/api/downloads/${fileToRemoveId}`)
      .then((res) => {
        setDownloadStates(
          downloadStates.filter(
            (downloadState) => downloadState.id !== fileToRemoveId
          )
        );
      })
      .catch((err) => {
        alert(
          "Něco se pokazilo, zkuste to prosím znovu.\n\n" + err.response.data
        );
        fetchData();
        console.log(err);
      });
  }

  async function fetchDataWithCallback(
    callback: React.Dispatch<React.SetStateAction<boolean>>
  ) {
    await fetchData();
    callback(false);
  }

  async function fetchData() {
    const res = await axios.get(`/api/downloads`);

    if (res.status >= 300) {
      alert("Něco se pokazilo, zkuste to prosím znovu.\n\n" + res.data);
      return;
    }

    const newDownloadStates: DownloadState[] = res.data;
    setDownloadStates(
      newDownloadStates.sort((a, b) => b.progress - a.progress)
    );

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
      <div className="header-div">
        <h1>Media Downloader</h1>
      </div>
      <LinksForm forcedFetch={fetchDataWithCallback} />
      <div>
        {shouldRender &&
          downloadStates.map((downloadState) => {
            return (
              <NamedProgressBar
                key={downloadState.id}
                downloadState={downloadState}
                removeFileFunc={removeFile}
              />
            );
          })}
      </div>
    </div>
  );
}

export default App;
