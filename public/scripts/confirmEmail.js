const alertDiv = document.querySelector("#alertDiv");
window.addEventListener("DOMContentLoaded", () => {
  const dataToSend = JSON.stringify({ email: email });
  console.log(dataToSend);

  fetch("/confirm-local", {
    credentials: "same-origin",
    mode: "same-origin",
    method: "post",
    headers: { "content-type": "application/json" },
    redirect: "follow",
    body: dataToSend
  })
    .then(resp => {
      if (resp.status == 200) {
        console.log(resp);
        return resp;
      } else {
        console.log("Status: " + resp.status);

        return Promise.reject("server");
      }
    })

    .then(dataJson => {
      console.log("success!");
      alertDiv.innerHTML = `</br>An email has been sent to <b>${email}</b> with a link to confirm your email address.`;
    })

    .catch(err => {
      if (err == "server") {
        alertDiv.innerHTML = `</br>Sorry, something went wrong. Please try again.```;
      }
      console.log(err);
      return;
    });
});
