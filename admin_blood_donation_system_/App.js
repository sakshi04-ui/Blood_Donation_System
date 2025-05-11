import React from "react";
import { Route, Switch } from "wouter";
import LoginPage from "./src/Page/LoginPage";
import Dashboard from "./src/Page/Dashboard";

const App = () => {
  return (
    <div>
      <Switch>
        <Route path="/" component={LoginPage} />
        <Route path="/dashboard" component={(Dashboard)} />
      </Switch>
    </div>
  );
};

export default App;
