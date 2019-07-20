const friendsEndpoint = "/friend/get-friends";

const fetchFriendList = async () => {
  try {
    const request = await fetch(friendsEndpoint, {
      credentials: "same-origin",
      method: "get",
      headers: { "content-type": "application/json" }
    });

    const response = await request.json();
    console.log(response);
    let friendsToSread = response.friends;

    spreadFriends(friendsToSread);

    const leftHtml = response.friends
      .map((friend, index) => {
        if (index == 0 || index % 2 == 0) {
          let fullName = friend.local.fullName;
          let avatar = friend.avatar;
          let email = friend.local.email;
          let friendId = friend._id;

          return `
        <li class="list-group-item"><img src="${avatar}"> ${fullName} - ${email}
                <span id="removeFriend" class="glyphicon glyphicon-remove-sign top-left" value=${friendId}></span>
        </li>

    `;
        }
      })
      .join("");
    const rightHtml = response.friends
      .map((friend, index) => {
        if (index !== 0 && index % 2 !== 0) {
          let fullName = friend.local.fullName;
          let avatar = friend.avatar;
          let email = friend.local.email;
          let friendId = friend._id;

          return `
        <li class="list-group-item">
          <img src="${avatar}">
            ${fullName}  - ${email}
            <span id="removeFriend" class="glyphicon glyphicon-remove-sign top-left" value=${friendId}></span>
        </li>
    `;
        }
      })
      .join("");

    fizz.innerHTML =
      leftHtml || "No friends to display here yet. Send some requests!";
    buzz.innerHTML =
      rightHtml || "No friends to display here yet. Send some requests!";
  } catch (err) {
    console.log(err);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  fetchFriendList();
});

const deleteEndpoint = "/friend/delete-friend";

const deleteFriend = friendToRemove => {
  const dataToSend = JSON.stringify({ friendId: friendToRemove });
  fetch(deleteEndpoint, {
    credentials: "same-origin",
    mode: "same-origin",
    method: "post",
    headers: { "content-type": "application/json" },
    body: dataToSend
  }).then(response => {
    if (response.status !== 200) {
      return console.log(response.status);
    }
    fetchFriendList();
  });
};

const removeFriend = document.querySelector("#removeFriend");

document.addEventListener("click", event => {
  if (event.target.id == "removeFriend") {
    let friendToRemove = event.target.getAttribute("value");
    deleteFriend(friendToRemove);
  }
});
