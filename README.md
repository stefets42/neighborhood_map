## Neighborhood Map Project
The Neighborhood Map Project is a single page application featuring a map of a Saint-Lazare neighborhood in Paris with functionalities such as highlighted locations, third-party data about those locations and various ways to browse the content.

### How to run the application locally
1. Go to the following github page: https://github.com/stefets42/neighborhood_map
2. Click on the green "Clone or download" button
3. Copy the address: https://github.com/stefets42/neighborhood_map.git
4. Open the terminal
5. Go to the folder where you want to copy this project
6. Run the server
    1. If you have Python 2, run: python -m SimpleHTTPServer 8000
    2. If you have Python 3, run: python -m http.server 8000
7. On your browser, navigate to: http://localhost:8000/
    1. As there is a file called index.html in the directory, it should automatically show up
    2. If not, you should see the files in that directory listed: click on the index.html file and watch it load

### Third-party APIs
1. The map was powered with Google Maps API.
2. Details on places were gathered using Foursquare API.