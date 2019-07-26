document.addEventListener("DOMContentLoaded", () => {
  const desktopNav = document.querySelector("#desktopNav");
  const navHtml = `
    <li><a href="/profile" id="navProfile">Profile</a></li>
    <li><a href="/groups/manage" id="navGroups">Groups</a></li>
    <li><a href="/friend/friends" id="navFriends">Friends</a></li>
    <li><a href="/events" id="navEvents">Events</a></li>
  `;

  desktopNav.innerHTML = navHtml;

  const navGroups = document.querySelector("#navGroups");
  const navEvents = document.querySelector("#navEvents");
  const navFriends = document.querySelector("#navFriends");
  const navProfile = document.querySelector("#navProfile");

  if (window.location.href.match("profile")) {
    navProfile.innerHTML = "Profile <span class='sr-only'>(current)</span>";
    navProfile.parentElement.classList.add("active");
  } else if (window.location.href.match("events")) {
    navEvents.innerHTML = "Events <span class='sr-only'>(current)</span>";
    navEvents.parentElement.classList.add("active");
  } else if (window.location.href.match("groups")) {
    navGroups.innerHTML = "Groups <span class='sr-only'>(current)</span>";
    navGroups.parentElement.classList.add("active");
  } else if (window.location.href.match("friends")) {
    navFriends.innerHTML = "Friends <span class='sr-only'>(current)</span>";
    navFriends.parentElement.classList.add("active");
  }
});

//
// <li class="active"><a href="/profile" id="navProfile">Profile<span class="sr-only">(current)</span></a></li>
// <li><a href="/groups" id="navGroups">Groups</a></li>
// <li><a href="/friend/friends" id="navFriends">Friends</a></li>
// <li><a href="/events" id="navEvents">Events</a></li>
