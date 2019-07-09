// send friend request function

const sendRequest = (event, requestLink) => {
  console.log(requestLink);

  const requestEndpoint = "/friend/send-request";

  const dataToSend = JSON.stringify({
    senderId: currentUser,
    receiverId: `${requestLink}`
  });

  console.log(dataToSend);

  event.preventDefault();
  fetch(requestEndpoint, {
    credentials: "same-origin",
    mode: "same-origin",
    method: "post",
    headers: { "content-type": "application/json" },
    body: dataToSend
  })
    .then(resp => {
      if (resp.status == 200) {
        return resp;
      } else {
        console.log("Status: " + resp.status);
        return Promise.reject("server");
      }
    })

    .then(dataJson => {
      console.log("Request success!");
      event.target.innerHTML = `x`;
    })

    .catch(err => {
      if (err == "server") {
        alertDiv.innerHTML = `</br>Sorry, something went wrong. Please try again.`;
      }
      console.log(err);
      return;
    });
};

// accept or deny request logic

// const requestResponse = document.querySelector("#requestResponse");

const friendResponse = (event, responseValue, responseType) => {
  let requestContainer = document.querySelector(`#${event.target.id}`);

  event.preventDefault();

  let accept = responseType == "accept" ? responseValue : undefined;
  let reject = responseType == "reject" ? responseValue : undefined;

  console.log("accept", accept);
  console.log("reject", reject);

  const addEndpoint = "/friend/add-friend";

  const dataToSend = JSON.stringify({
    acceptId: accept,
    rejectId: reject
  });

  console.log(dataToSend);

  event.preventDefault();

  fetch(addEndpoint, {
    credentials: "same-origin",
    mode: "same-origin",
    method: "post",
    headers: { "content-type": "application/json" },
    body: dataToSend
  })
    .then(resp => {
      if (resp.status == 200) {
        return resp;
      } else {
        console.log("Status: " + resp.status);
        return Promise.reject("server");
      }
    })

    .then(dataJson => {
      console.log("Request success!");
      let requestValue = parseInt(badge.innerText);
      badge.innerHTML = `${requestValue - 1}`;
      requestContainer.innerHTML = `x`;
    })

    .catch(err => {
      if (err == "server") {
        alertDiv.innerHTML = `</br>Sorry, something went wrong. Please try again.`;
      }
      console.log(err);
      return;
    });
};

// event listener on document for friend request and accept and deny friend request

// friend request logic/code

document.addEventListener("click", () => {
  if (event.target.id == "requestLink") {
    let requestLink = event.target.getAttribute("value");
    sendRequest(event, requestLink);
  }

  if (
    event.target.id == "acceptResponse" ||
    event.target.id == "rejectResponse"
  ) {
    let responseValue = event.target.getAttribute("value");
    let responseType = event.target.getAttribute("data-value");
    friendResponse(event, responseValue, responseType);
  }
});
