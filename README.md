# get-up-and-play
A web app I've been working on in my spare time. 

Essentially, users can create public or private "events"  or "meet ups" centering around physical activity. Looking for a group that wants to play pickup basketball? Search public basketball events that have been created by other users close to your zip code. Cycling? Search cycling events. Tennis? Racquetball?  A group run? You get the idea. For any sport or activity, members can create either public or private events (private events you can send invitations to your friends who are registered on the app) where you select an activity, a location (gym, park, tennis court, bike route, etc.), number of people you're looking to play with,  and you'll be able to link up with other people looking to GetUp&Play!

I plan to finish the back-end first, and then do the entire front-end using REACT. 

<b><u>7/26/2019</u></b>

The auth flow is complete (create account, link local account, register using local account, confirm email, reset password etc). I added a ton of logic to link all accounts to a registered email (meaning connected social media accounts). Users also won't be added until they confirm their email address (I added that functionality myself as well). 

I also created an "instant" search feature for the "Friends Search" at the top of the page. As you type characters, the search will return names that match those characters. 

I finished the Friend Request and Friend logic as well. Users can send, accept, or deny friend requests. Users can then delete friends after the fact.

In the friend section, there's also a "friend filter" that works similiar to the new friend instant search I just described.

Next up is creating groups, and then events.


<b><u>4/26/2019</u></b>

As of right now, I have the authentication flow completed. 
