import React, { useState } from "react";
import { Page as LitPage } from "./Pages/Page";
import { reactComponent } from "./lib/reactComponent";

const Page = reactComponent(LitPage);

function App() {
  const [name, setName] = useState("Koustubh");

  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <Page name={name} />
    </>
  );
}

export default App;
