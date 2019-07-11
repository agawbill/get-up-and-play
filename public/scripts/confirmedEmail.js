const alertDiv = document.querySelector("#alertDiv");
const confirmEmail = document.querySelector("#confirmEmail");

if (confirmEmail) {
  confirmEmail.addEventListener("click", () => {
    event.preventDefault();
    const dataToSend = JSON.stringify({ token: token });

    fetch(`/confirmed-local/${token}`, {
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
        alertDiv.innerHTML = `</br>Your email has been confirmed! <a href="/profile">Click Here</a> to go to your profile or login.`;
      })

      .catch(err => {
        if (err == "server") {
          alertDiv.innerHTML = `</br>Sorry, something went wrong. Please try again.`;
        }
        console.log(err);
        return;
      });
  });
}

const resendEmail = document.querySelector("#resendEmail");

if (resendEmail) {
  resendEmail.addEventListener("click", () => {
    const dataToSend2 = JSON.stringify({ token: `<%=token%>` });

    event.preventDefault();
    fetch(`/resend-token/${token}`, {
      credentials: "same-origin",
      mode: "same-origin",
      method: "post",
      headers: { "content-type": "application/json" },
      body: dataToSend2
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
          alertDiv.innerHTML = `</br>Sorry, something went wrong. Please try again.`;
        }
        console.log(err);
        return;
      });
  });
}
