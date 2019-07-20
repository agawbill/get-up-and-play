const dataToSend = JSON.stringify({ email: `<%=email%>` });
const alertDiv = document.querySelector("#alertDiv");

let config = {
  credentials: "same-origin",
  mode: "same-origin",
  method: "post",
  headers: { "content-type": "application/json" },
  redirect: "follow",
  body: dataToSend
};
let url = "/confirm-local";

try {
  const response = await fetch(url, config);

  if (response.status == 200) {
    console.log(resp);
    alertDiv.style.innerHtml = `An email has been sent to <%=email%> with a link to confirm your email address.`;
    return response;
  } else {
    console.log("Status: " + resp.status);
    return Promise.reject("server");
  }
} catch (err) {
  alertDiv.style.innerHtml = `Sorry, something went wrong. Please try again`;

  console.log(err);
  return;
}

// app.post("/forgot", (req, res, next) => {
//   async.waterfall(
//     [
//       done => {
//         // create token
//         crypto.randomBytes(20, (err, buf) => {
//           const token = buf.toString("hex");
//           done(err, token);
//         });
//       },
//       (token, done) => {
//         // token is passed to next function, search for email in DB
//         User.findOne({ "local.email": req.body.email }, (err, user) => {
//           if (!user) {
//             // if a user with that email can't be found, flash this error, redirect back to forgot page
//             req.flash(
//               "forgotMessage",
//               "No account with that email address exists."
//             );
//             return res.redirect("/forgot");
//           }
//           // if a user is found with that email, save a token and a token expiration date to that user's object in the db
//           user.resetPasswordToken = token;
//           user.resetPasswordTokenExpires = Date.now() + 360000; // 1 hour
//           user.save(err => {
//             done(err, token, user);
//           });
//         });
//       },
//       (token, user, done) => {
//         // send email to that user with password reset link with token
//         const smtpTransport = nodemailer.createTransport({
//           service: "Gmail",
//           auth: {
//             user: "getupandplay1@gmail.com",
//             pass: keys().gmailPW
//           }
//         });
//         const mailOptions = {
//           to: user.local.email,
//           from: "GetUpAndPlay1@gmail.com",
//           subject: "Password Reset",
//           text: `You are receiving this message because you (or someone else) have requested a password reset for your account on GET UP AND PLAY!
//         Please click this link: http://${req.headers.host}/reset/${token}
//         If you did NOT request a password reset, please ignore this email and your password will remain the same.
//         `
//         };
//         smtpTransport.sendMail(mailOptions, err => {
//           console.log("mail sent");
//           req.flash(
//             "forgotMessage",
//             `SUCCESS! An email has been sent to ${
//               user.local.email
//             } with a password reset link.`
//           );
//           done(err, "done");
//         });
//       }
//     ],
//
//     err => {
//       if (err) return next(err);
//       res.redirect("/forgot");
//     }
//   );
// });

const endpoint = "/search-users";
const search = document.querySelector(".search");
const suggestions = document.querySelector(".suggestions");

const sendSearch = event => {
  let searchItem = event.target.value;
  let dataToSend = JSON.stringify({ query: searchItem });
  console.log(searchItem);
  console.log(dataToSend);

  event.preventDefault();
  fetch(endpoint, {
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
      dataJson.json().then(data => {
        console.log("success!");
        let users = [...data];

        if (users.length !== 0) {
          const html = users
            .map(user => {
              // console.log(user);
              return `
            <li>
                ${user}
            </li>

        `;
            })
            .join("");

          return (suggestions.innerHTML = html);
        }
        suggestions.innerHTML = "";
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

search.addEventListener("change", sendSearch);

search.addEventListener("keyup", sendSearch);

const sendRequest = () => {
  const requestEndpoint = "/friend/send-request";
  const dataToSend = JSON.stringify({
    "sender.id": "hey",
    "receiver.id": "hey"
  });

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
        console.log(resp);
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

//

// for await (let value of filteredUsers[filteredUsers.length - 1]) {
//   value -= 1;
//   if (filteredUsers[index] !== undefined) {
//     console.log("the person, to make sure it's logged", person);
//     let indexOfRequest = filteredRequests.indexOf(person.userId);
//     console.log("the index", indexOfRequest);
//     if (indexOfRequest >= 0) {
//       console.log("what's being removed", filteredUsers.splice(index, 1));
//       filteredUsers.splice(index, 1);
//     }
//   }
// }
// while (index >= 0) {
//   if (filteredUsers[index] !== undefined) {
//     console.log("the person, to make sure it's logged", person);
//     let indexOfRequest = filteredRequests.indexOf(person.userId);
//     console.log("the index", indexOfRequest);
//     if (indexOfRequest >= 0) {
//       console.log("what's being removed", filteredUsers.splice(index, 1));
//       filteredUsers.splice(index, 1);
//     }
//   } else {
//     index -= 1;
//   }
// }
//
// await filteredUsers.forEach((person, index) => {
//   if (person !== undefined) {
//     console.log("the person, to make sure it's logged", person);
//     let indexOfRequest = filteredRequests.indexOf(person.userId);
//     console.log("the index", indexOfRequest);
//     if (indexOfRequest >= 0) {
//       console.log("what's being removed", filteredUsers.splice(index, 1));
//       console.log(person.userId);
//       requestsToFilter.push(person.userId);
//     }
//   }
// });

// const newFilteredUsers=  await filteredUsers.filter((person, index) => {
//     if
//   });
// await filteredUsers.forEach((person, index) => {
//   if (person !== undefined) {
//     console.log("the person, to make sure it's logged", person);
//     let indexOfRequest = filteredRequests.indexOf(person.userId);
//     indexesOfRequests.push(indexOfRequest);
//     console.log("the index", indexOfRequest);
//     if (indexOfRequest >= 0) {
//       console.log("what's being removed", filteredUsers.splice(index, 1));
//       filteredUsers.splice(index, 1);
//     }
//   }
// });

// await filteredUsers.forEach((person, index) => {
//   if (person !== undefined) {
//     console.log("the person, to make sure it's logged", person);
//     let indexOfRequest = filteredRequests.indexOf(person.userId);
//     indexesOfRequests.push(indexOfRequest);
//     console.log("the index", indexOfRequest);
//     if (indexOfRequest >= 0) {
//       console.log("what's being removed", filteredUsers.splice(index, 1));
//       filteredUsers.splice(index, 1);
//     }
//   }
// });

// console.console.log("filtered users after splice", requestsToFilter);




  app.post("/friend/delete-friend", isLoggedIn, async (req, res) => {
    const currentUser = req.user;
    const friendToDelete = req.body.friendId;

    const currentUserFriends = await User.findOneAndUpdate(
      { _id: currentUser.id },
      { $pull: { friends: friendToDelete } },
      { safe: true, multi: true }
    );

    const otherUserFriends = await User.findOneAndUpdate(
      { _id: friendToDelete },
      { $pull: { friends: currentUser.id } },
      { safe: true, multi: true }
    );

    const friendRequestFromUser = await FriendRequest.findOne(
      {
        $and: [
          { "receiver.id": currentUser.id },
          { "sender.id": friendToDelete }
        ]
      },
      (err, requests) => {
        if (err) {
          return res.send("Something went wrong", err);
        }
      }
    );

    const friendRequestFromReceiver = await FriendRequest.findOne(
      {
        $and: [
          { "receiver.id": friendToDelete },
          { "sender.id": currentUser.id }
        ]
      },

      (err, requests) => {
        if (err) {
          return res.send("Something went wrong", err);
        }
      }
    );

    console.log("user", friendRequestFromUser);

    console.log("receiver", friendRequestFromReceiver);

    if (friendRequestFromReceiver) {
      await friendRequestFromReceiver.updateOne({ $set: { status: 3 } });
    } else {
      await friendRequestFromUser.updateOne({ $set: { status: 3 } });
    }

    console.log("current user", currentUserFriends);
    console.log("otherUserFriends", otherUserFriends);

    res.send("success");
  });
};
