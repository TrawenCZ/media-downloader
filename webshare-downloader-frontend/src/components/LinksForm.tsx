import { useForm, SubmitHandler } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
import BarLoader from "react-spinners/BarLoader";

type Inputs = {
  link: string,
};

type props = {
  callback: Function,
  callbackValue: boolean
}

export default function LinksForm({callback, callbackValue}: props) {
    const [loading, setLoading] = useState(false);
    const [showQueueMessage, setShowQueueMessage] = useState(false);

    const state = {
        button: "now"
    };
    
    const { register, handleSubmit, reset, formState: { errors } } = useForm<Inputs>();

    const onSubmit: SubmitHandler<Inputs> = (data) => {
        setLoading(true);
        var apiLink: string = "";
        if (state.button === "now") {
            apiLink = "/api/now";
        } else if (state.button === "queue") {
            apiLink = "/api/queue";
        }
        axios.post(`${process.env.REACT_APP_HOST_ADDRESS}${apiLink}`,
        {
            link: data.link
        }).then((res) => {
            console.log(res);
            setLoading(false);
            if (apiLink === "/api/now") {
              callbackValue = !callbackValue;
              callback(callbackValue);
          } else {
            setShowQueueMessage(true);
          }
        }).catch((err) => {
            setLoading(false);
            alert("Něco se pokazilo, zkuste to prosím znovu");
            console.log(err);
        });
        reset();
    };

    return (<>
      <form onSubmit={handleSubmit(onSubmit)}>
        <textarea {...register("link", { required: true })} placeholder="Sem zadej link"/>
        {errors.link && <><br/><span className="error">Prosím vyplň toto pole</span></>}
        <br/>
        <button
          onClick={() => (state.button = "now")}
          type="submit"
          name="download_now"
          className="button-nice"
          disabled={loading}
        >
          Stáhnout ihned
        </button>
        <button
          onClick={() => (state.button = "queue")}
          type="submit"
          name="push_to_queue"
          className="button-nice"
          disabled={loading}
        >
          Zařadit do fronty
        </button>
      </form>
      <div className="loading-component">
        <BarLoader className="loading-component" cssOverride={{display: "flex"}} color="#5E5DF0" loading={loading} height={8} width={150} />
      </div>
      {showQueueMessage && (<>
        <div className="progress-bar-component queue-component">
        <p className="queue-message">Přidáno do fronty</p>
        <button className="button-nice button-nice-completed" onClick={() => setShowQueueMessage(false)}>OK</button>
      </div>
      </>)}
      </>
    );
}
