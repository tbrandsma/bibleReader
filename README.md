# bibleReader App for Google Home/Assistant

When the Google Home came out last year, I had the idea to try and use the APIs available to write a program that would ask a user for a passage in the Bible and read it to them. I chose to use the API.ai (https://api.ai) speech recognition engine along with Actions on Google API to do this. For the Bible translations and passages, I used the freely available bibles.org API (https://bibles.org/pages/api) to do the look ups and return the text.

## Revision History

### v1.0

This app is still in its infancy. It currently can:

    - take a user's spoken input
    - parse out the Book, Chapter, and Verse
    - run a http GET request to bibles.org API and return the JSON response
    - parse the JSON response and pull out the actual text
    - respond via the Actions on Google API with the text before closing

## Future Features

Here are some ideas I have for the moment:

    - Use API.ai's Context feature to make the app run as long as the user wants to hear verses
    - Add a verse of the day feature that gives the verse of the day from bibles.org
