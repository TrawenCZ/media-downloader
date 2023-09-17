import ProgressBar from "@ramonak/react-progress-bar";
import { DownloadState } from "../App";
import { FaClock } from "react-icons/fa";
import { useState } from "react";

type props = {
  downloadState: DownloadState;
  removeFileFunc: (fileId: string) => void;
};

export default function NamedProgressBar({
  downloadState: { id, fileName, aliasName, progress, isQueued, remainingTime },
  removeFileFunc,
}: props) {
  const is_completed = progress === 100;

  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <div
      className={`progress-bar-component${is_completed ? " pb-completed" : ""}`}
    >
      {!isQueued && (
        <div className={`box-border${is_completed ? " completed" : ""}`}>
          <p className="remaining-time">{remainingTime}</p>
        </div>
      )}
      <div className="info-column">
        <p className="alias-name">{aliasName ? aliasName : fileName}</p>
        {aliasName && (
          <p className="file-name">
            {"\n"}
            {aliasName ? fileName : ""}
          </p>
        )}
      </div>
      {isQueued && progress === 0 && (
        <p className="queue-info">
          Čeká ve frontě <FaClock />{" "}
        </p>
      )}
      {(!isQueued || progress !== 0) && (
        <ProgressBar
          completed={progress}
          animateOnRender={true}
          bgColor={is_completed ? "#50C878" : "#5E5DF0"}
          baseBgColor="#969696"
          className="progress-bar-status"
          labelAlignment="outside"
        />
      )}
      {is_completed && (
        <button
          className="button-nice button-nice-completed"
          onClick={() => removeFileFunc(id)}
        >
          Dokončit
        </button>
      )}
      {!is_completed && (
        <button
          className="button-nice button-nice-cancel"
          onClick={() => setShowConfirmation(!showConfirmation)}
        >
          Zrušit
        </button>
      )}
      {!is_completed && showConfirmation && (
        <div className="confirmation-box">
          <p className="confirmation-text">
            Opravdu chceš zrušit stahování souboru "
            {aliasName ? aliasName : fileName}"?
          </p>
          <div className="button-line">
            <button
              className="button-nice button-nice-completed"
              onClick={() => setShowConfirmation(!showConfirmation)}
            >
              Ne
            </button>
            <button
              className="button-nice button-nice-cancel"
              onClick={() => removeFileFunc(id)}
            >
              Ano
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
