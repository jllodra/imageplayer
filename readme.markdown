jQuery Image Player
===================

I wanted an image player/slideshow that looked and functioned similarly to a video player. After some playing around, this was the result. You can click different points on the scrubber to jump back and forth within the slideshow, and hovering over the image will pause the show. Of course, you can also use the play/pause button.

I had intended to add support for dragging the scrubber, but I haven't gotten to it yet. I also plan to add automatic image resizing at some point, so large images will be scaled down to fit inside the stage. As it is now, they're simply clipped.

Example:
--------

    <ul id="image_player">
      <li><img src="./images/photos/sample1.png"></li>
      <li><img src="./images/photos/sample2.png"></li>
      <li><img src="./images/photos/sample3.png"></li>
    </ul>
    
    <script type="text/javascript" src="js/jquery.lumen.js">
      $(function() {
        var options = {
          stageWidth:400,
          stageHeight:300,
          autoStart:true,
          pauseOnHover:true,
          delay:5,
          transition:'slow'
        };
        $('#image_player').imagePlayer(options);
      });
    </script>

For more info and a live example, see the [project home page](http://kellishaver.com/projects/player).
