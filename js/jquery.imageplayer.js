if (typeof(jQuery) == 'undefined') alert('jQuery library was not found.');

(function ($) {
    
    $.fn.extend({
        imagePlayer: function(options) {
            if (options && typeof(options) == 'object') {
                options = $.extend({}, $.imagePlayer.settings, options);
            }
            return this.each(function() {
                new $.imagePlayer(this, options);
            });
        } 
    });
    
    $.imagePlayer = function (self, options) {
        var playlist = $(self);
        var player_id = self.id;
        var images = [], widths = [], heights = [];
        var player, stage, controls, play_pause, scrubber, scrubber_handle, image = null;
        var inc; // delta inc for scrubber
        var i = 0; // current image
        var rotator = null;
        var settings = options;
        playlist.find('img').each(function() {
            images.push(this.src);
            widths.push($(this).width());
            heights.push($(this).height());
        });
        
        create_player();
        if(settings.autoStart === true) {
            image_cycle();
        }

        function create_player() {
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
            (settings.autoStart===true) ? play_pause.addClass('pause') : play_pause.addClass('play');
            // Bind mouse interactions
            stage.bind('mouseenter', function(e) {
                handle_image_hover(e, this);
            }).bind('mouseleave', function(e) {
                handle_image_out(e, this);
            }); // .hover seems not tow work?
            play_pause.bind('click', function(e) {
                handle_control_click(e, this);
            });
            scrubber.bind('click', function(e) {
                handle_scrubber_click(e, this);
            });
            // Build the player.
            player.append(stage).append(controls.append(play_pause).append(scrubber.append(scrubber_handle)));         
            playlist.hide().after(player);
            inc = Math.floor(scrubber.width() / images.length);
        }
        
        function image_cycle() {
            console.log(i);
            clearTimeout(rotator);
            if(settings.loop === true) {
                if (i > images.length - 1) {
                    i = 0;
                    // stop animation
                    console.log("I'm here");
                    scrubber_handle.stop(true, true);
                    scrubber_handle.css('left', '0');
                }
            } else {
            // clearTimeout
            // stop animation
            }
            if (i < images.length) {
                image_transition(images[i]);
            }
            i++;
        }
        
        function image_transition(img) {
            var image_object = { src: img, alt: 'Slide ' + i + 1 };
            if (image === null) {
                image = $('<img>').attr(image_object);
                stage.html(image);
            } else {
                image.attr(image_object);         
            }
            if(image.width() != settings.stageWidth &&
                image.height() != settings.stageHeight) { // adjust w&h
                image.css({
                    width: settings.stageWidth,
                    height: settings.stageHeight
                }).attr({
                    width: settings.stageWidth,
                    height: settings.stageHeight
                });
            }
            // animate scrubber
            var remaining = inc*(i+1) - parseFloat(scrubber_handle.css('left'));
            var percent = Math.floor(remaining / inc);
            scrubber_handle.stop(true, true);
            scrubber_handle.animate({
                left: '+='+remaining+'px'
            }, settings.delay*1000, 'linear');
            rotator = setTimeout(image_cycle, settings.delay * 1000);
        }
        
        function handle_image_hover(e, elem) {
            
        }
        
        function handle_image_out(e, elem) {
            
        }
        
        function handle_control_click(e, elem) {
            e.preventDefault();
            elem = $(elem, player);
            console.log(elem);
            // see if we can use "hasClass"
            if(elem.attr('class') == 'play') { // play (then pause)
                elem.attr('class', 'pause');
            } else { // pause (resume play)
                image_cycle();
                elem.attr('class', 'play');
            // clearTimeout
            // ...
            }
        }
        
        function handle_scrubber_click(e, elem) {
            
        }
        
        // Debug
        console.log(playlist);
        console.log(player_id);
    };
    
    $.imagePlayer.settings = {
        stageWidth:400,
        stageHeight:300,
        autoStart:true,
        pauseOnHover:true,
        delay:1,
        transition:0, // can be 'slow', 'fast' or time in ms. TODO: REMOVE TRANSITION SUPPORT
        loop:true
    };
    
})(jQuery);