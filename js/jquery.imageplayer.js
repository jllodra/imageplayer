;(function($) {
    $.fn.imagePlayer = function(options) {
    
        var rotator = null;
        var clicked = false;
    
    	var settings = $.extend( {
    		stageWidth:400,
    		stageHeight:300,
    		autoStart:true,
    		pauseOnHover:true,
    		delay:5,
    		transition:'slow', // can be 'slow', 'fast' or time in ms.
    		loop:true
    		},options);
    
        $(this).each(function() {
        
            // Get playlist object, and its ID.
            playlist = $(this);
            player_id = this.id;
            
            // Get a list of images inside the player,
            // as well as their widths and height.
            // This is probably not the msot efficient way to do it,
            // but it doesn't rely on width/height being set in the
            // playlist HTML.
            images  = [];
            widths  = [];
            heights = [];
            playlist.find('img').each(function() {
                images.push(this.src)
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
            if(settings.autoStart===true) play_pause.addClass('pause');
            else play_pause.addClass('play');
    
            // Bind mouse interactions
            stage.bind('mouseenter', function(e) { handle_image_hover(e, this) }).bind('mouseleave', function(e) { handle_image_out(e, this) }); // .hover seems not tow work?
            play_pause.bind('click', function(e) { handle_control_click(e, this) });
            scrubber.bind('click', function(e) { handle_scrubber_click(e, this) });
    
            // Build the player.
            player.append(stage).append(controls.append(play_pause).append(scrubber.append(scrubber_handle)));
            
            playlist.hide().after(player);
            
            // Scrubber incriments for image switching.
            incriment = Math.floor(scrubber.width() / images.length);
           
            // Start cycling images.
            if(settings.autoStart === true) image_cycle();
        });
        
        // When we hover over an image on the stage, pause if
        // set to do so.
        function handle_image_hover(e, elem) {
            if(clicked !== true &&settings.pauseOnHover===true && play_pause.attr('class') === 'pause') {
                play_pause.attr('class', 'play');
                clearTimeout(rotator);
                scrubber_handle.stop(true, true);
            }
        }
        // Resume on mouseout, if playback wasn't manually paused
        function handle_image_out(e, elem) {
            if(clicked !== true && settings.pauseOnHover===true && play_pause.attr('class') === 'play') {
                play_pause.attr('class', 'pause');
                image_cycle();
            }
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
                clearTimeout(rotator);
                scrubber_handle.stop(true, true);
                clicked=true;
            }
        }
        // Clicking the scrubber bat jumps around in the playback
        // timeline, just as you'd expect.
        function handle_scrubber_click(e, elem) {
            e.preventDefault();
            elem = $(elem);
            clearTimeout(rotator);  // Stop all playback,
            scrubber_handle.stop(); // and animation.
            
            // Set new scrubber position.
            pos = elem.offset();
            x_coord = Math.ceil(e.pageX - pos.left);
            scrubber_handle.css('left', x_coord + 'px');
            i = Math.floor(x_coord / incriment);
            // Resume playback.
            play_pause.attr('class', 'pause');
            clicked=false;
            image_cycle();

        }
        
        function image_transition(img) {
            clearTimeout(rotator);
            stage.fadeOut(settings.transition, function() {
                max_left = incriment*i; // Scrubber range.
                current_left = parseFloat(scrubber_handle.css('left')); // Current position.
                remaining = max_left - current_left; // Distance from current position to destination for this image.
                percent = remaining/incriment; // What percentage is that?
                scrubber_handle.animate({left:'+='+remaining+'px'}, settings.delay*(1000*percent)); // Set scrubber animaton.
                image = $('<img>').attr({ // Image object.
                    src:img,
                    alt:'Slide '+i+1
                });
                stage.html(image); // Add to stage.
                // Scale horizintally if image is too wide for stage.
                if(widths[i] > settings.stageWidth) {
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
                }
                // Show the stage and re-start the cycle.
                stage.fadeIn(settings.transition, function() {
                    rotator = setTimeout(image_cycle, settings.delay*1000);
                });
            });
        }
        
        function image_cycle() {
            if(typeof i == "undefined") i=0; // Default location in timeline.
            if(settings.loop===true) { // Loop.
                if(i > images.length-1) i=0;
            } else { // Don't loop.
                clearTimeout(rotator); 
                scrubber_handle.stop(true, true);
            }
            if(i<images.length) { // Play image and reset scrubber position as-needed.                
               if(i===0 && parseFloat(scrubber_handle.css('left')) > incriment) scrubber_handle.css('left', '0');
               image_transition(images[i]);
            }
            i++; // Next image.
        }
    }
})(jQuery);
