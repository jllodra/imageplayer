if (typeof(jQuery) == 'undefined') alert('jQuery library was not found.');

(function($) {
    $.fn.imagePlayer = function(options) {
    
        var rotator = null;
        var clicked = false;
        
        var last_scrubber_pos = 0;
    
        var settings = $.extend( {
            stageWidth:400,
            stageHeight:300,
            autoStart:false,
            pauseOnHover:true,
            delay:1,
            transition:0, // can be 'slow', 'fast' or time in ms.
            loop:true
        },options);
    
        return $(this).each(function() {
        
            // Get playlist object, and its ID.
            playlist = $(this);
            player_id = this.id;
            
            // Get a list of images inside the player,
            // as well as their widths and height.
            // This is probably not the most efficient way to do it,
            // but it doesn't rely on width/height being set in the
            // playlist HTML.
            images  = [];
            widths  = [];
            heights = [];
            playlist.find('img').each(function() {
                images.push(this.src);
                widths.push($(this).width());
                heights.push($(this).height());
            });
            
            // Player elements.
            player          = $('<div>').addClass('img_player');
            stage           = $('<div>').addClass('stage');
            controls        = $('<div>').addClass('controls');
            play_pause      = $('<a>').attr('href', '#');
            scrubber        = $('<div>').addClass('scrubber');
            scrubber_handle = $('<a>').attr('href', '#');
            
            // Set dimensions
            player.css({
                width:settings.stageWidth + 'px',
                height:settings.stageHeight + 50 + 'px'
            });
            stage.css({
                width:settings.stageWidth + 'px',
                height:settings.stageHeight + 'px'
            });
            controls.css({
                width:settings.stageWidth + 'px'
            });
            scrubber.css({
                width:settings.stageWidth - 50 + 'px'
            });
            
            // Set the right control for play/pause.
            if(settings.autoStart===true) { 
                play_pause.addClass('pause');
            } else {
                play_pause.addClass('play');
            }
    
            // Bind mouse interactions
            stage.bind('mouseenter', function(e) {
                handle_image_hover(e, this)
            }).bind('mouseleave', function(e) {
                handle_image_out(e, this)
            }); // .hover seems not tow work?
            play_pause.bind('click', function(e) {
                handle_control_click(e, this)
            });
            scrubber.bind('click', function(e) {
                handle_scrubber_click(e, this)
            });
    
            // Build the player.
            player.append(stage).append(controls.append(play_pause).append(scrubber.append(scrubber_handle)));
            
            playlist.hide().after(player);
            
            // Scrubber incriments for image switching.
            inc = Math.floor(scrubber.width() / images.length);
           
            // Start cycling images.
            if(settings.autoStart === true) image_cycle();
        });
        
        function image_transition(img) {
            clearTimeout(rotator); rotator = null;
            stage.fadeOut(settings.transition, function() {
                max_left = inc*(i+1); // Scrubber range.
                console.log(max_left);
                current_left = parseFloat(scrubber_handle.css('left')); // Current position.
                last_scrubber_pos = current_left;
                console.log(current_left);
                remaining = max_left - current_left; // Distance from current position to destination for this image.
                console.log(remaining);
                percent = remaining/inc; // What percentage is that?
                scrubber_handle.animate({
                    left:'+='+remaining+'px'
                    }, (settings.delay)*(1000*percent)+settings.transition*2, 'linear'); // Set scrubber animaton.
                image = $('<img>').attr({ // Image object.
                    src:img,
                    alt:'Slide '+i+1
                });
                stage.html(image); // Add to stage.
                // Scale horizintally if image is too wide for stage.
                /*if(widths[i] > settings.stageWidth) {
                    ratio = settings.stageWidth / widths[i];
                    heights[i] = heights[i]*ratio;
                    dimensions = {
                        width:settings.stageWidth,
                        height:heights[i],
                        'margin-top':settings.stageHeight/2 - heights[i]/2
                    }
                    image.css(dimensions).attr(dimensions);
                }
            
                // Scale vertically if image is still too tall for stage.
                if(heights[i] > settings.stageHeight){
                    ratio = settings.stageHeight / heights[i];
                    dimensions = {
                        width:widths[i]*ratio,
                        height:settings.stageHeight
                    }
                    image.css(dimensions).attr(dimensions);
                }*/
                
                // I think the best solution is to adapt image source width and height to the stage width and height:
                image.css({width: settings.stageWidth, height: settings.stageHeight}).attr({width: settings.stageWidth, height: settings.stageHeight});
                
                // Show the stage and re-start the cycle.
                stage.fadeIn(settings.transition, function() {
                    rotator = setTimeout(image_cycle, settings.delay*1000);
                });
            });
        }
        
        function image_cycle() {
            if(typeof i == "undefined") i=0; // Default location in timeline.
            if(settings.loop===true) { // Loop.
                if(i > images.length-1) { 
                    i=0;
                    scrubber_handle.css('left', '0');
                    scrubber_handle.stop(true, true);
                }
            } else { // Don't loop.
                clearTimeout(rotator); rotator = null;
                scrubber_handle.stop(true, true);
            }
            if(i<images.length) { // Play image and reset scrubber position as-needed.   
                if(i===0 && parseFloat(scrubber_handle.css('left')) > inc) {
                    scrubber_handle.css('left', '0');
                }
                image_transition(images[i]);
                console.log("Transition");
            }
            i++; // Next image.
        }

        // When we hover over an image on the stage, pause if
        // set to do so.
        function handle_image_hover(e, elem) {
            if(clicked !== true && settings.pauseOnHover===true && play_pause.attr('class') === 'pause') {
                clearTimeout(rotator); rotator = null;
                scrubber_handle.stop(true, true); // could set to false and reposition scrubber to frame
            }
        }
        // Resume on mouseout, if playback wasn't manually paused
        function handle_image_out(e, elem) {
            if(clicked !== true && settings.pauseOnHover===true && play_pause.attr('class') === 'pause') {            
                image_cycle();
            } else {
                return;
            }
            play_pause.attr('class', 'pause');
        }
        // Clicking the play/pause button
        function handle_control_click(e, elem) {
            e.preventDefault();
            elem = $(elem, player);

            // hasClass is buggy here for some reason...
            if(elem.attr('class') == 'play') { // play
                elem.attr('class', 'pause');
                clicked=false;
                image_cycle();
            } else { // pause
                elem.attr('class', 'play');
                clearTimeout(rotator); rotator = null;
                scrubber_handle.stop(true, false); // do not jump to end
                scrubber_handle.css('left', last_scrubber_pos + 'px');
                i--;
                clicked=true;
            }
        }
        // Clicking the scrubber bar jumps around in the playback
        // timeline, just as you'd expect.
        function handle_scrubber_click(e, elem) {
            var wasplaying = false;
            e.preventDefault();
            elem = $(elem);
            if(rotator != null) {
                wasplaying = true;
                clearTimeout(rotator); rotator = null;// Stop all playback,
                scrubber_handle.stop(); // and animation.
            }
            console.log(rotator);
            // Set new scrubber position.
            pos = elem.offset();
            x_coord = Math.ceil(e.pageX - pos.left);
            console.log("x_coord: " + x_coord);
            
            
            i = Math.floor(x_coord / inc);
            console.log("i: "+ i);
            console.log("inc*i: " + inc*(i)); // Start of frame
            console.log("inc*i+1: " + inc*(i+1)); // Start of next frame
            // Decide which frame is nearer
            var delta_c = Math.abs(inc*i - x_coord);
            var delta_n = Math.abs(inc*(i+1) - x_coord);
            if(delta_c <= delta_n) { 
                scrubber_handle.css('left', (x_coord - delta_c) + 'px');
            } else {
                scrubber_handle.css('left', (x_coord + delta_n) + 'px');
                if(i < images.length-1) {
                    i++;
                }
            }
            // Resume playback if playing.
            if(wasplaying) {
                play_pause.attr('class', 'pause');
                clicked=false;
                image_cycle();
            } else {
                image = $('<img>').attr({ // Image object.
                    src:images[i],
                    alt:'Slide '+i+1
                });
                image.css({width: settings.stageWidth, height: settings.stageHeight}).attr({width: settings.stageWidth, height: settings.stageHeight});
                stage.html(image);
            }
        }
    }
})(jQuery);
