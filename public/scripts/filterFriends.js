const filterFriends = document.querySelector("#filterFriends");

let usersFriends = [];

const spreadFriends = friends => {
  usersFriends = [...friends];
};

const filteredFriends = () => {
  let queryFriends = usersFriends.filter(friend => {
    console.log(friend.local.fullName);
    let name = friend.local.fullName;
    let query = filterFriends.value;
    let regex = new RegExp(query, "gi");
    // console.log(name.match(regex));
    return name.match(regex);
  });

  const filteredRightHtml = queryFriends
    .map((friend, index) => {
      if (index !== 0 && index % 2 !== 0) {
        // console.log(friend);
        const regex = new RegExp(filterFriends.value, "gi");
        let fullName = friend.local.fullName.replace(
          regex,
          `<span style="background-color:yellow;"><b>$&</b></span>`
        );
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

  const filteredLeftHtml = queryFriends
    .map((friend, index) => {
      if (index == 0 || index % 2 == 0) {
        const regex = new RegExp(filterFriends.value, "gi");
        let fullName = friend.local.fullName.replace(
          regex,
          `<span style="background-color:yellow;"><b>$&</b></span>`
        );
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

  fizz.innerHTML =
    filteredLeftHtml || "No friends to display here yet. Send some requests!";
  buzz.innerHTML =
    filteredRightHtml || "No friends to display here yet. Send some requests!";
};

filterFriends.addEventListener("keyup", filteredFriends);
// console.log(filteredFriends);
