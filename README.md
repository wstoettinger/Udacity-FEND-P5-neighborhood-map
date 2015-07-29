## Website Performance Optimization portfolio project

this page is hosted here to run tests: https://secure-fjord-1029.herokuapp.com/

alternatively you can download the source and open the index.html (the index.php is just a wrapper so heroku detects which build pack to use).

## Optimizations:

i implemented all optimizations i could find in all of the documentations and external resources.

in general:
- image compression
- serving images in the right size and fileformat
- loading external dependencies async where possible.
- removed Google Analytics JS because i don't need it here.
- minified files (although I didn't include the main.min.js but the main.js for development reasons, but it's there!)
- activated webserver compression
- enabled browser caching

most important ones of pizza.html:
- removed all unneccessary pizzas from the background
- minimized interaction with the DOM and CSSOM while generation of the page and during the animations by 
-- creating elements as text first and then injecting them as a whole
-- saving elements and other values in variables in the main.js for regular use (instead of requesting them often).
- put each pizza.mover in a separate layer via a css hack.
- scroll rendering via requestAnimationFrame (while preventing multiple renderings at the same time).

what i didn't do (yet):
- use flexbox for layouting

In case there is more i can do, let me know ;) #perfmatters 

PS: after doing all the performance optimizations i figured that the Udacity page is doing a quite poor job in terms of performance, maybe I should have a look at it ;P


## Build Process

I implemented a sample gulpfile.js to demonstrate how to minify/uglify main.js and style.css of the pizza.html.