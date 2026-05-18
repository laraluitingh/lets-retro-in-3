# Product Requirements Document — Retrospective App

## Overview

A web application that enables teams to run structured retrospective sessions. Users can collaborate in real time, share feedback, and track action items across sprints.

---

## Features

### Authentication
- Users can register and log in with an email and password.
- Sessions are persisted so users stay logged in across page reloads.

### Teams
- Users can create a team and invite other members.
- A user can belong to multiple teams.
- Team members can view all boards belonging to their team.

### Boards
- Any team member can create a retrospective board for their team.
- A board has a title and is associated with a specific team.
- Boards can be listed, opened, and deleted by team members.

### Columns
- Each board starts with three default columns:
  1. **What Went Well**
  2. **What We Can Improve**
  3. **Action Items**
- Users can rename, add, reorder, and delete columns.

### Cards
- Users can create a card (sticky note) in any column.
- Cards have a text body and display the author's name.
- Users can edit the text of their own cards.
- Users can delete their own cards; board owners can delete any card.

### Voting
- Users can upvote cards to surface the most important topics.
- Each user gets one vote per card (toggle on/off).
- Cards display the total vote count and can be sorted by votes.

---

## Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Python / FastAPI
- **Database:** TBD

---

## Out of Scope (v1)
- Real-time collaboration / websockets
- Email notifications
- Export to PDF / CSV
