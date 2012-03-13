jQuery Image Player
===================

This is a rewrite of ImagePlayer plug-in originally written by Kelli Shaver.

It is a player/slideshow that looks and works similarly to a conventional video player. 
You can play/pause, go to the beginning, go to the end, click different points on the scrubber to jump back and forth, 
and you can enable an option that will pause the playback while hovering over the image. 
Images are scaled automatically to fit in the player. You can also switch to full-screen.

Works perfectly in chrome/safari/firefox, and not that perfect for IE yet. 

Example:
--------

    <ul id="image_player">
      <li><img src="./images/photos/sample1.png"></li>
      <li><img src="./images/photos/sample2.png"></li>
      <li><img src="./images/photos/sample3.png"></li>
    </ul>
    
    <script type="text/javascript" src="js/jquery.imageplayer.js">
      $(function() {
        var options = {
          stageWidth:400,
          stageHeight:300,
          autoStart:true,
          pauseOnHover:true,
          delay:5,
          loop:true
        };
        $('#image_player').imagePlayer(options);
      });
    </script>

Josep Llodrà Grimalt (jlg.hrtc@gmail.com)