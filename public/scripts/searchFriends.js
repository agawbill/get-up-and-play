// search logic/code

const search = document.querySelector(".search");
const suggestions = document.querySelector(".suggestions");

const sendSearch = event => {
  const searchEndpoint = "/friend/search-users";
  let searchItem = event.target.value;
  let dataToSend = JSON.stringify({ query: searchItem });
  console.log(searchItem);
  console.log(dataToSend);

  event.preventDefault();
  fetch(searchEndpoint, {
    credentials: "same-origin",
    mode: "same-origin",
    method: "post",
    headers: { "content-type": "application/json" },
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
      dataJson.json().then(users => {
        console.log("success!");
        if (search.value !== "") {
          const html = users
            .map((user, index) => {
              const regex = new RegExp(search.value, "gi");
              let fullName = user.name.replace(
                regex,
                `<span style="background-color:yellow;"><b>$&</b></span>`
              );
              return `
            <li style="z-index: 6;">
                ${fullName} (${
                user.email
              })<br> <a href="#" class="btn btn-primary btn-sm" style="margin:5px"; id="requestLink-${index}" value="${
                user.userId
              }">Send Friend Request</a>
            </li>
        `;
            })
            .join("");

          return (suggestions.innerHTML = html);
        }
        suggestions.innerHTML = "";

        requestLink.addEventListener("click", sendRequest);
      });
    })

    .catch(err => {
      if (err == "server") {
        suggestions.innerHTML = `</br>Sorry, something went wrong. Please try again.`;
      }
      console.log(err);
      return;
    });
};

search.addEventListener("keyup", sendSearch);
