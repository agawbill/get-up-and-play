import mongoose from "mongoose";
import { isLoggedIn } from "../middleware/authMiddleware.mjs";
import User from "../models/User.mjs";
import FriendRequest from "../models/FriendRequest.mjs";

export const friendRoutes = app => {
  app.get("/friend/friends", isLoggedIn, (req, res) => {
    const user = req.user;
    res.render("friends.ejs", { user: user });
  });

  app.get("/friend/get-friends", isLoggedIn, async (req, res) => {
    const user = req.user;
    const friends = await User.findOne({ _id: user.id }, (err, friends) => {
      if (err) {
        return res.send("this is the error", err);
      }
    })
      .select("friends")
      .populate({
        path: "friends",
        model: "users",
        select: [
          "-local.password",
          "-friends",
          "-facebook",
          "-google",
          "-twitter"
        ]
      })
      .exec();

    // console.log("friends", friends);
    res.send(friends);
  });

  app.get("/friend/search-users", async (req, res) => {
    const user = req.user;
    res.render("search-users", { user: user });
  });

  app.post("/friend/search-users", async (req, res) => {
    const users = await User.find().select([
      "-local.password",
      "-facebook",
      "-google",
      "-twitter"
    ]);

    // console.log("all users before filter", users);

    // console.log(users);

    const currentUser = req.user;

    const filteredUsers = [];
    const filteredRequests = [];

    // you have to find the friend requests of the sender, and pluck out the ones that are status 1

    const existingSentRequests = await FriendRequest.find(
      {
        "sender.id": currentUser._id
      },
      (err, request) => {
        if (err) {
          return console.log(err);
        }
        request;
      }
    );

    const existingReceivedRequests = await FriendRequest.find(
      {
        "receiver.id": currentUser._id
      },
      (err, request) => {
        if (err) {
          return console.log(err);
        }
        request;
      }
    );

    // console.log("existing sent requests", existingSentRequests);
    //
    // console.log("existing sent requests", existingReceivedRequests);

    await existingSentRequests.forEach(friend => {
      if (friend !== undefined && friend.status == 1)
        // changed from receiver
        // filteredRequests.push(`${friend.sender.id}`);
        filteredRequests.push(`${friend.receiver.id}`);
    });

    await existingReceivedRequests.forEach(friend => {
      if (friend !== undefined && friend.status == 1)
        // changed from receiver
        filteredRequests.push(`${friend.sender.id}`);
      // filteredRequests.push(`${friend.receiver.id}`);
    });

    // console.log("filtered request ids", filteredRequests);

    class Member {
      constructor(name, email, userId) {
        this.name = name;
        this.email = email;
        this.userId = userId;
      }
    }

    await users.forEach(name => {
      let isConfirmed = name.local.confirmed;
      let alreadyFriend = name.friends.indexOf(`${req.user._id}`);
      let alreadyAccepted = req.user.friends.indexOf(`${name._id}`);
      let user = name.local.fullName;
      let email = name.local.email;
      let userId = name.id;

      if (
        // user !== undefined &&
        isConfirmed !== false &&
        email !== req.user.local.email &&
        alreadyFriend == -1 &&
        alreadyAccepted == -1
      ) {
        filteredUsers.push(new Member(user, email, userId));
      }
    });

    // console.log("filtered users after filter", filteredUsers);

    const newFilteredUsers = await filteredUsers.filter((person, index) => {
      if (person !== undefined) {
        console.log("the person, to make sure it's logged", person);

        return filteredRequests.indexOf(person.userId) === -1;
      }
    });

    // console.log("new filtered users", newFilteredUsers);

    const queriedUsers = newFilteredUsers.filter(user => {
      let query = req.body.query;
      let name = user.name;
      const regex = new RegExp(query, "gi");
      return name.match(regex);
    });

    // console.log("queried users, matched", queriedUsers);

    return res.send(queriedUsers);
  });

  app.get("/friend/user", async (req, res) => {
    const user = await User.find(
      { "local.name": req.body.name },
      (err, user) => {
        if (err) {
          return res.send("Something went wrong", err);
        }
        return res.json(users);
      }
    );
  });

  app.post("/friend/send-request", async (req, res) => {
    const sender = await User.findOne({
      _id: req.body.senderId
    });
    const receiver = await User.findOne({
      _id: req.body.receiverId
    });

    const getRequest = await FriendRequest.findOne(
      {
        "sender.id": sender.id,
        "receiver.id": receiver.id
      },
      (err, request) => {
        if (err) {
          return console.log(err);
        }
        return request;
      }
    );

    // add logic to find existing request to update here
    // console.log(getRequest);
    if (!getRequest) {
      new FriendRequest({
        "sender.id": sender.id,
        "receiver.id": receiver.id,
        status: 1
      })
        .save()
        .then(result => {
          // console.log(result);
          return res.send(result);
        })
        .catch(err => {
          return res.send(err);
        });
    } else if (getRequest.status == 3) {
      // console.log("it's updating it", getRequest.status);
      await getRequest.updateOne({ $set: { status: 1 } });
      return res.send(getRequest);
    }
  });

  app.get("/friend/get-requests", isLoggedIn, async (req, res) => {
    const user = req.user;

    // const getRequests = await FriendRequest.find(
    //   { "receiver.id": user._id },
    //   (err, requests) => {
    //     if (err) {
    //       return res.send("Something went wrong", err);
    //     }
    //     return requests;
    //   }
    // );

    const usersRequests = await FriendRequest.find(
      {
        $and: [{ "receiver.id": user._id }, { status: 1 }]
      },
      (err, requests) => {
        if (err) {
          return res.send("Something went wrong", err);
        }
      }
    )
      .populate({
        path: "sender",
        model: "users",
        select: [
          "-local.password",
          "-friends",
          "-facebook",
          "-google",
          "-twitter"
        ]
      })
      .exec();

    // console.log(usersRequests);

    res.send(usersRequests);
  });

  app.get("/friend/get-pending", isLoggedIn, async (req, res) => {
    const user = req.user;

    // const getRequests = await FriendRequest.find(
    //   { "receiver.id": user._id },
    //   (err, requests) => {
    //     if (err) {
    //       return res.send("Something went wrong", err);
    //     }
    //     return requests;
    //   }
    // );

    const pendingRequests = await FriendRequest.find(
      {
        $and: [{ "sender.id": user._id }, { status: 1 }]
      },
      (err, requests) => {
        if (err) {
          return res.send("Something went wrong", err);
        }
      }
    )
      .populate({
        path: "receiver",
        model: "users",
        select: [
          "-local.password",
          "-friends",
          "-facebook",
          "-google",
          "-twitter"
        ]
      })
      .exec();

    console.log(pendingRequests);

    res.send(pendingRequests);
  });

  app.post("/friend/add-friend", isLoggedIn, async (req, res) => {
    const requestId = req.body.rejectId || req.body.acceptId;

    const friendRequest = await FriendRequest.findOne(
      { _id: requestId },
      (err, requests) => {
        if (err) {
          return res.send("Something went wrong", err);
        }
      }
    )
      .populate({
        path: "sender",
        model: "users",
        lean: true,
        select: [
          "-local.password",
          "-friends",
          "-facebook",
          "-google",
          "-twitter"
        ]
      })
      .populate({
        path: "receiver",
        model: "users",
        lean: true,
        select: [
          "-local.password",
          "-friends",
          "-facebook",
          "-google",
          "-twitter"
        ]
      })
      .exec();

    const sender = friendRequest.sender.toJSON()[0].id;
    const receiver = friendRequest.receiver.toJSON()[0].id;

    if (req.body.acceptId !== undefined) {
      await User.findOneAndUpdate(
        { _id: req.user.id },
        { $push: { friends: sender } }
      ).exec(function(err, user) {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        } else {
          // res.send("Success!");
        }
      });

      await User.findOneAndUpdate(
        { _id: sender },
        { $push: { friends: receiver } }
      ).exec(function(err, user) {
        if (err) {
          console.log(err);
          res.status(500).send(err);
        } else {
          console.log(user);
          // res.send("Success!");
        }
      });

      await friendRequest.updateOne({ $set: { status: 2 } });
    } else {
      await friendRequest.updateOne({ $set: { status: 3 } });
    }
    return res.send(friendRequest);
    // console.log(friendRequest);
  });

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

    const friendIsSender = await FriendRequest.findOne(
      { "sender.id": friendToDelete },
      { "receiver.id": currentUser._id }
    );

    const userIsSender = await FriendRequest.findOne({
      $and: [
        { "sender.id": currentUser._id },
        { "receiver.id": friendToDelete }
      ]
    });

    console.log("user", userIsSender);
    console.log("friend", friendIsSender);

    const friendRequest = userIsSender == null ? friendIsSender : userIsSender;

    await friendRequest.updateOne({ $set: { status: 3 } });

    res.send("success");
  });
};
