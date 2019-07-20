// send friend request function

const sendRequest = (event, requestLink, pendingValue) => {
  console.log(requestLink);

  const requestEndpoint = "/friend/send-request";

  const dataToSend = JSON.stringify({
    senderId: currentUser,
    receiverId: `${requestLink}`
  });

  // console.log(dataToSend);

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
      let sendButton = document.querySelector(`#${event.target.id}`);
      console.log("Request success!");
      console.log(dataJson);
      badgeP.innerHTML = `${(requestValue += 1)}`;
      sendButton.classList.remove("btn-primary");
      sendButton.classList.add("btn-success", "disabled");
      sendButton.innerText = "Request Sent!";
      fetchPending();
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

const friendResponse = (event, responseValue, responseType, requestValue) => {
  event.preventDefault();

  let [chosenId, getIndex] = event.target.id.split("-");

  let selectedId = `#${chosenId}`;

  let otherId =
    selectedId === "#rejectResponse" ? "#acceptResponse" : "#rejectResponse";

  let chosenResponse = document.querySelector(`${selectedId}-${getIndex}`);
  let otherResponse = document.querySelector(`${otherId}-${getIndex}`);

  // console.log("chosenResponse", chosenResponse);
  // console.log("otherResponse", otherResponse);

  let accept = responseType == "accept" ? responseValue : undefined;
  let reject = responseType == "reject" ? responseValue : undefined;

  const addEndpoint = "/friend/add-friend";

  const dataToSend = JSON.stringify({
    acceptId: accept,
    rejectId: reject
  });

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

      badge.innerHTML = `${(requestValue -= 1)}`;

      if (accept !== undefined) {
        chosenResponse.classList.remove("btn-primary");
        chosenResponse.classList.add("btn-success", "disabled");
        chosenResponse.innerText = "Accepted!";
        otherResponse.classList.add("disabled");
        fetchFriendList();
      } else {
        chosenResponse.classList.remove("btn-primary");
        chosenResponse.classList.add("btn-danger", "disabled");
        chosenResponse.innerText = "Denied";

        otherResponse.classList.add("disabled");
      }
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

document.addEventListener("click", event => {
  let targetId = event.target.id.split("-");
  if (targetId.includes("requestLink")) {
    let requestLink = event.target.getAttribute("value");
    sendRequest(event, requestLink, pendingValue);
  }

  if (
    targetId.includes("acceptResponse") ||
    targetId.includes("rejectResponse")
  ) {
    let responseValue = event.target.getAttribute("value");
    let responseType = event.target.getAttribute("data-value");
    friendResponse(event, responseValue, responseType, pendingValue);
  }
});
