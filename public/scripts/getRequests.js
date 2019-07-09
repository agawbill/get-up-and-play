// get requests logic/code

const requestEndpoint = "friend/get-requests";

const pendingEndpoint = "friend/get-pending";

const badge = document.querySelector(".badgeR");

const badgeP = document.querySelector(".badgeP");

const friendsLink = document.querySelector(".friendsLink");

const pendingLink = document.querySelector(".pendingLink");

const pendingRequests = document.querySelector(".pending-requests");

const friendRequests = document.querySelector(".friend-requests");

const fetchFriends = async () => {
  try {
    const request = await fetch(requestEndpoint, {
      credentials: "same-origin",
      method: "get",
      headers: { "content-type": "application/json" }
    });

    const response = await request.json();
    badge.innerHTML = `${response.length}`;

    console.log(response);
    const html = response
      .map(request => {
        let senderName = request.sender[0].local.fullName;
        let senderEmail = request.sender[0].local.email;

        return `
      <li style="z-index: 6;">
          ${senderName} (${senderEmail})
          <br> <a href="/friend/add-friend" id="acceptResponse" value="${
            request._id
          }", data-value="accept">Accept</a> - <a href="/friend/add-friend" id="rejectResponse" value="${
          request._id
        }", data-value="reject">Reject</a>
      </li>
  `;
      })
      .join("");

    return (friendRequests.innerHTML = html);
  } catch (err) {
    console.log(err);
  }
};

const fetchPending = async () => {
  try {
    const request = await fetch(pendingEndpoint, {
      credentials: "same-origin",
      method: "get",
      headers: { "content-type": "application/json" }
    });

    const response = await request.json();
    badgeP.innerHTML = `${response.length}`;

    console.log(response);
    const html = response
      .map(request => {
        let receiverName = request.receiver[0].local.fullName;
        let receiverEmail = request.receiver[0].local.email;

        return `
      <li style="z-index: 6;">
          ${receiverName} (${receiverEmail})
      </li>
  `;
      })
      .join("");

    return (pendingRequests.innerHTML = html);
  } catch (err) {
    console.log(err);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  fetchFriends();
  fetchPending();
});

friendsLink.addEventListener("click", () => {
  console.log("hello");
  if (friendRequests.style.display == "block") {
    return (friendRequests.style.display = "none");
  }
  return (friendRequests.style.display = "block");
});

pendingLink.addEventListener("click", () => {
  console.log("hello");
  if (pendingRequests.style.display == "block") {
    return (pendingRequests.style.display = "none");
  }
  return (pendingRequests.style.display = "block");
});
