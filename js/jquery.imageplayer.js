;(function($) {
    $.fn.imagePlayer = function(options) {
    
        var rotator = null;
    
    	var settings = $.extend( {
    		stageWidth:400,
    		stageHeight:300,
    		autoStart:true,
    		pauseOnHover:true,
    		delay:5,
    		transition:'slow',
    		loop:true
    		},options);
    
        $(this).each(function() {
        
            // Get playlist object, and its ID.
            playlist = $(this);
            player_id = this.id;
            
            // Get a list of images inside the player.
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
            stage.bind('mouseover', function(e) { handle_image_hover(e, this) }).bind('mouseout', function(e) { handle_image_out(e, this) });
            play_pause.bind('click', function(e) { handle_control_click(e, this) });
            scrubber.bind('click', function(e) { handle_scrubber_click(e, this) });
    
            // Build the player.
            player.append(stage).append(controls.append(play_pause).append(scrubber.append(scrubber_handle)));
            
            playlist.hide().after(player);
            
            // Scrubber incriments for image switching.
            incriment = Math.floor(scrubber.width() / images.length);
           
            if(settings.autoStart === true) {
                image_cycle();
            }
        });
        
        function handle_image_hover(e, elem) {
            if(settings.pauseOnHover===true && play_pause.attr('class') === 'pause') handle_control_click(e, play_pause);
        }
        
        function handle_image_out(e, elem) {
            if(settings.pauseOnHover===true && play_pause.attr('class') === 'play') handle_control_click(e, play_pause);
        }
        
        function handle_control_click(e, elem) {
            e.preventDefault();
            elem = $(elem);

            // hasClass is buggy here for some reason...
            if(elem.attr('class') == 'play') {
                elem.attr('class', 'pause');
                image_cycle();
            } else {
                elem.attr('class', 'play');
                clearTimeout(rotator);
                scrubber_handle.stop(true, true);
            }
        }
        
        function handle_scrubber_click(e, elem) {
            e.preventDefault();
            elem = $(elem);
            pos = elem.offset();
            clearTimeout(rotator);
            scrubber_handle.stop();
            
            x_coord = Math.ceil(e.pageX - pos.left);
            scrubber_handle.css('left', x_coord + 'px');
            i = Math.floor(x_coord / incriment);
            image_cycle();

        }
        
        function image_transition(img) {
            clearTimeout(rotator);
            stage.fadeOut(settings.transition, function() {
                max_left = incriment*i;
                current_left = parseFloat(scrubber_handle.css('left'));
                remaining = max_left - current_left;
                percent = remaining/incriment;
                scrubber_handle.animate({left:'+='+remaining+'px'}, settings.delay*(1000*percent));
                image = $('<img>').attr({
                    src:img,
                    alt:'Side '+i+1
                });
                stage.html(image);
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
            
                if(heights[i] > settings.stageHeight){
                    ratio = settings.stageHeight / heights[i];
                    dimensions = {
                        width:widths[i]*ratio,
                        height:settings.stageHeight
                    }
                    image.css(dimensions).attr(dimensions);
                }
                stage.fadeIn(settings.transition, function() {
                    rotator = setTimeout(image_cycle, settings.delay*1000);
                });
            });
        }
        
        function image_cycle() {
            clearTimeout(rotator);
            if(typeof i == "undefined") i=0;
            if(settings.loop===true) {
                if(i > images.length-1) i=0;
            } else {
                clearTimeout(rotator);
                scrubber_handle.stop(true, true);
            }
            if(i<images.length) {                 
               if(i===0 && parseFloat(scrubber_handle.css('left')) > incriment) scrubber_handle.css('left', '0');
                image_transition(images[i]);
            }
            i++;
        }
    }
})(jQuery);
