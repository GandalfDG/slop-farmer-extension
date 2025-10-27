# Slop Farmer
a browser extension to crowdsource reports of AI slop articles and pages, and to flag or hide links to slop from search results.

This is a work in progress.

## Features
- Report a page as slop, and its domain and path will be stored in your browser and pushed to the backend API
- Search on DuckDuckGo and your results will be checked against known slop domains and paths so anything known to be slop will appear as a red link

## TODOs
- Implement signup with email verification
- Enable link checking without signup using a proof-of-work check to limit bot access to API
- Enable voting on reported slop to get rid of false reports
- Improve user experience
- Port to chromium-based browsers

## Stretch Goals
- webapp to allow users to go through a list of pages and report them as slop or not to proactively gather more reports outside of normal browsing activity
