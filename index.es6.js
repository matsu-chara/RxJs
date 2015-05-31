window.addEventListener("DOMContentLoaded", () =>{
  "use strict";

  // import
  let Rx     = require("rx");
  let jQuery = require("jquery");

  // constants
  const API_URL =
    "https://api.github.com/users?client_id=53f079b3d060b9fb2d92&client_secret=92e5f0c93bb13ed1f7d05398acca4c3177203c9c";

  // refresh
  let refreshButton      = document.querySelector(".refresh");
  let refreshClickStream = Rx.Observable.fromEvent(refreshButton, "click");

  // close
  let close1Button      = document.querySelector(".close1");
  let close1ClickStream = Rx.Observable.fromEvent(close1Button, "click");
  let close2Button      = document.querySelector(".close2");
  let close2ClickStream = Rx.Observable.fromEvent(close2Button, "click");
  let close3Button      = document.querySelector(".close3");
  let close3ClickStream = Rx.Observable.fromEvent(close3Button, "click");

  let requestStream  = refreshClickStream.startWith("startup click")
                                         .map(() => {
                                           let randomOffset = Math.floor(Math.random() * 500);
                                           return API_URL + "&since=" + randomOffset;
                                         });

  let responseStream = requestStream.flatMap(requestUrl =>
                                      Rx.Observable.fromPromise(jQuery.getJSON(requestUrl))
                                    );

  // suggestion
  let createSuggestionStream = (closeClickStream) => {
     return closeClickStream.startWith("startup click")
                     .combineLatest(responseStream, (click, listUsers) =>
                        listUsers[Math.floor(Math.random() * listUsers.length)])
                     .merge(refreshClickStream.map(() => null))
                     .startWith(null);
  };

  let suggestion1Stream = createSuggestionStream(close1ClickStream);
  let suggestion2Stream = createSuggestionStream(close2ClickStream);
  let suggestion3Stream = createSuggestionStream(close3ClickStream);

  // rendering
  let renderSuggestion = (suggestedUser, selector) => {
    let suggestionEL = document.querySelector(selector);
    if (suggestedUser === null) {
      suggestionEL.style.visibility = "hidden";
    } else {
      suggestionEL.style.visibility = "visible";

      let usernameEl = suggestionEL.querySelector(".username");
      usernameEl.href = suggestedUser.html_url;
      usernameEl.textContent = suggestedUser.login;

      let imgEl = suggestionEL.querySelector("img");
      imgEl.src = "";
      imgEl.src = suggestedUser.avatar_url;
    }
  };

  suggestion1Stream.subscribe(user => renderSuggestion(user, ".suggestion1"));
  suggestion2Stream.subscribe(user => renderSuggestion(user, ".suggestion2"));
  suggestion3Stream.subscribe(user => renderSuggestion(user, ".suggestion3"));
});
