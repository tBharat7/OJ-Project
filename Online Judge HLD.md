# Online Judge

**Problem Statement :**

A coding challenge is a competitive event in which a group of
participants solve a set of coding questions within a specified
timeframe, typically ranging from a few hours to a few days.
Participants who have registered beforehand compete by
submitting their solutions, which are evaluated against concealed
test cases. Based on the test results, participants are assigned
scores. An online judge is a platform that hosts these coding
challenges, providing the infrastructure to manage and execute
the competitions. Examples of online judges include Codechef
Codeforces etc.

## High Level Design

**UI**

1. Login/SignUp
2. Dashboard/ Home screen where user can see a list of problems to solve
3. Individual Problem screen to run/submit
4. Leaderboard

### User Registration

- User details stored in MongoDB with hashed passwords (using bcrypt).
- Login/logout APIs with JWT for authentication.
- Profile API to fetch user info and competition history (submissions, scores).
    
    API
    
    - POST /api/register: Register a new user
    - POST /api/login: User login and authentication
    - GET /api/profile: Fetch user profile

### Solution Submission & Evaluation

- Submit solutions via REST API with problem ID and source code.
- After submissions, it runs code inside secure containers (e.g., Docker), and checks against test cases.
- Evaluation result (Accepted/Rejected, errors) and scores stored back in database linked to submission.
- User get notifications about submission status asynchronously.
    
    API
    
    - GET /api/submissions/:id/status: Get submission evaluation result

### Competition Leaderboard

- Aggregate scores per participant per competition.
- Leaderboard API fetches sorted user rankings for each contest.
    
    API
    
    - POST /api/competitions/:id/submit: Submit solution for competition problem (real test cases)
    - GET /api/competitions/:id/leaderboard: Get competition leaderboard

### Practice Problems

- Problems served via API that is separate from contest problems.
- No scoring or ranking; used for practice and skill-building; user can access solution submission & evaluation for practice problems.
    
    API
    
    - GET /api/problems: List practice problems
    - POST /api/problems/:id/run: Only run manual/hard coded test cases

### Data Model

- User: { _id, name, email, hashedPassword, profileDetails, competitionHistory: [competitionID, score] }
- Problem: { _id, title, description, difficulty, testCases, tags }
- Submission: { _id, userID, problemID, sourceCode, status, score, timestamp }
- Competition: { _id, title, startTime, endTime, participantIDs, problems: [problemIDs] }
- Leaderboard: { _id, competitionID, [{ userID, score, rank }] }

##