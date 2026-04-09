# Capstone-SSO - please reference README Docs. folder

## 30-Second Elevator Pitch

My capstone project is called the Secret Santa Organizer, it's a full-stack web application that helps families, friends, classrooms, and workplaces manage gift exchanges digitally in one place.

Instead of organizing Secret Santa manually through scratch paper, group chats or spreadsheets, users can create an event, invite participants, set exclusions so certain people are not matched together, and generate private Secret Santa assignments automatically. Participants can also create wishlists with links to products from real retail sites such as Amazon, Target, and Macy’s, making gift shopping easier and more organized.

Concrete core features that will be implemented in the MVP are listed here:

1. User Authentication
   Users can register, log in, and log out securely.

2. Create and Manage a Secret Santa Event
   A logged-in user can create an event with a title, event date, budget, and optional description.

3. Add Participants to an Event
   The event organizer can add participants to a group.

4. Set Exclusions
   The organizer can define exclusions so certain participants are not matched together.

5. Generate Secret Santa Matches
   The app will randomly assign each participant a recipient while respecting exclusions.

6. Private Assignment Reveal
   Each participant can log in and only see their own assigned recipient.

7. Wishlist Creation
   Participants can create wishlists with:

item name
optional notes
store name
product link
optional price

8. Organizer Dashboard
   The organizer can view event details, participants, exclusions, and assignment status.

Stretch Goal Features
If I have time, I would like to add:

email invitations
RSVP tracking
wishlist item images
mark wishlist items as purchased or reserved
anonymous messaging between Santas and recipients
countdown timer to exchange date
multiple events per user
store auto-detection from pasted links
mobile-first UI improvements

My priority is to complete the core Secret Santa workflow first: authentication, event creation, participant management, exclusions, match generation, private assignment reveal, and wishlist links. Additional features such as email invites and RSVP tracking will be treated as stretch goals if time allows.

Project Management System

I will use GitHub Projects to manage the capstone workflow. I will create issues for each feature, bug, and setup task, then organize them on a project board with columns for To Do, In Progress, and Completed. I also plan to use labels such as frontend, backend, database, bug, and stretch goal to keep work organized. This system will help me track progress, prioritize MVP tasks, and document development clearly throughout the project.

Since this is an individual capstone project, all tickets will be assigned to me. I will focus on completing MVP tickets first, then move any remaining ideas into stretch goals. Here's a breakdown where the core functionality is completed before optional features are added.

project setup and database
authentication
event creation
participants
exclusions
matching logic
private reveal page
wishlist
UI polish
stretch goals

---

Technical Details- Detailed Database Schema

1. users

//Stores registered users.

Column Type Notes
id SERIAL PRIMARY KEY unique user ID
username VARCHAR(50) UNIQUE NOT NULL login/display name
email VARCHAR(100) UNIQUE NOT NULL user email
password TEXT NOT NULL hashed password
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP record timestamp

2. events

//Stores each Secret Santa event.

Column Type Notes
id SERIAL PRIMARY KEY unique event ID
organizer_id INTEGER REFERENCES users(id) ON DELETE CASCADE creator of event
title VARCHAR(100) NOT NULL event name
description TEXT optional
event_date DATE exchange date
budget DECIMAL(10,2) optional spending limit
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP record timestamp

3. participants

//Stores participants belonging to an event.

Column Type Notes
id SERIAL PRIMARY KEY unique participant ID
event_id INTEGER REFERENCES events(id) ON DELETE CASCADE linked event
user_id INTEGER REFERENCES users(id) ON DELETE CASCADE linked user
display_name VARCHAR(100) NOT NULL participant name
joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP record timestamp

4. exclusions

//Stores participant pairs that cannot be matched.

Column Type Notes
id SERIAL PRIMARY KEY unique exclusion ID
event_id INTEGER REFERENCES events(id) ON DELETE CASCADE linked event
giver_participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE participant 1
receiver_participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE participant 2

5. assignments

//Stores Secret Santa match results.

Column Type Notes
id SERIAL PRIMARY KEY unique assignment ID
event_id INTEGER REFERENCES events(id) ON DELETE CASCADE linked event
giver_participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE assigned giver
receiver_participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE assigned recipient
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP record timestamp

6. wishlist_items

//Stores gift ideas for each participant.

Column Type Notes
id SERIAL PRIMARY KEY unique wishlist item ID
participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE linked participant
item_name VARCHAR(150) NOT NULL gift item
notes TEXT size, color, preference
store_name VARCHAR(100) Amazon, Target, Macy’s, etc.
product_url TEXT external shopping link
price DECIMAL(10,2) optional
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP record timestamp

---

Table Relationships-
one user can create many events
one event has many participants
one participant belongs to one event
one event has many exclusions
one event has many assignments
one participant can have many wishlist_items
one assignment links one giver participant to one receiver participant

---

API Endpoints-

    Auth Routes:

POST /api/auth/register
Creates a new user in the users table.

POST /api/auth/login
Verifies credentials from users and returns a token.

GET /api/auth/me
Returns the currently logged-in user.

    Event Routes"

GET /api/events
Returns all events created by the logged-in user from events.

POST /api/events
Creates a new event in events.

GET /api/events/:id
Returns one event and related event details.

PUT /api/events/:id
Updates event data in events.

DELETE /api/events/:id
Deletes an event and all related participants, exclusions, assignments, and wishlist items through cascading relations.

    Participant Routes:

GET /api/events/:id/participants
Returns all participants for an event from participants.

POST /api/events/:id/participants
Adds a participant to participants.

DELETE /api/participants/:participantId
Deletes a participant.

    Exclusion Routes:

GET /api/events/:id/exclusions
Returns all exclusions for an event from exclusions.

POST /api/events/:id/exclusions
Creates an exclusion pair in exclusions.

DELETE /api/exclusions/:id
Deletes an exclusion.

    Assignment Routes:

POST /api/events/:id/assignments/generate
Runs the Secret Santa matching algorithm and saves results to assignments.

GET /api/events/:id/assignments
Returns all assignments for the organizer.

GET /api/events/:id/my-assignment
Returns only the logged-in participant’s assignment.

    Wishlist Routes:

GET /api/participants/:participantId/wishlist
Returns wishlist items from wishlist_items.

POST /api/participants/:participantId/wishlist
Adds a wishlist item.

PUT /api/wishlist/:id
Updates a wishlist item.

DELETE /api/wishlist/:id
Deletes a wishlist item.

---

Main Pages

1. Landing Page

Purpose:

introduce the app
explain what it does
show login/register buttons

Sections:

hero section
short app description
call-to-action buttons

Route:

"/"

2. Register Page

Form fields:

username
email
password

Route:

".../register"

3. Login Page

Form fields:

email
password

Route:

".../login"

4. User Dashboard

Displays:

user’s events
create new event button

Route:

".../dashboard"

5. Create Event Page

Form fields:

title
description
event date
budget

Route:

".../events/new"

6. Event Details Page

Displays:

event information
participant list
exclusion list
generate matches button
organizer controls

Forms on page:

add participant form
add exclusion form

Route:

".../events/:id"

7. My Assignment Page

Displays:

assigned recipient name
recipient wishlist

Route:

".../events/:id/my-assignment"

8. Wishlist Page

Displays:

user’s wishlist items
add/edit/delete wishlist items

Form fields:

item name
notes
store name
product URL
price

Route:

".../events/:id/wishlist"

---

Navigation

Navbar links:

1 Home
2 Dashboard
3 Create Event
4 My Assignment
5 Wishlist
6 Logout

---

User Flow ->
User registers or logs in >
User creates a Secret Santa event >
User adds participants >
User sets exclusions >
User generates assignments >
Participants log in or register to see their assigned recipient >
Participants create or view wishlists >
Gift-givers use optional retailer links to shop

---

User Stories for MVP Features

1. Authentication

As a user, I want to create an account and log in securely so that I can manage my Secret Santa events and personal assignment information.

2. Create Event

As an organizer, I want to create a Secret Santa event so that I can manage a gift exchange for my group.

3. Add Participants

As an organizer, I want to add participants to an event so that everyone in the group can be included in the exchange.

4. Set Exclusions

As an organizer, I want to prevent certain participants from being matched together so that the exchange follows group rules and avoids unwanted pairings.

5. Generate Matches

As an organizer, I want the app to automatically generate Secret Santa assignments so that I do not have to assign participants manually.

6. Private Assignment Reveal

As a participant, I want to see only my own Secret Santa assignment so that the exchange remains private and fair.

7. Wishlist Creation

As a participant, I want to create a wishlist with gift ideas and store links so that my Secret Santa can shop more easily.

8. Organizer Dashboard

As an organizer, I want to see my event details, participants, and matching status in one place so that I can manage the exchange efficiently.
