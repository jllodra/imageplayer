if (typeof(jQuery) == 'undefined') alert('jQuery library was not found.');

(function ($) {
    
    $.fn.extend({
        imagePlayer: function(options) {
            if (options && typeof(options) == 'object') {
                options = $.extend({}, $.imagePlayer.settings, options);
            } else {
			   	 options = $.imagePlayer.settings;
			}
            return this.each(function() {
                try {
                    new $.imagePlayer(this, options);
                } catch (e) {
                    console.error(e);
                }
            });
        } 
    });
    
    $.imagePlayer = function (self, options) {
        var settings = options;
        var playlist = $(self);
        var images = [];
        var imagesEl = [];
        var imagesLoaded = 0;
        var body = null;
        var player, stage, controls, start, prev, play_pause, next, end, scrubber, scrubber_handle, fullscreen, frame_count, caption, image = null;
        var last_frame_scrubber_pos = 0;
        var full = false;
        var pauseOnHover = settings.pauseOnHover;
        var inc; // delta inc for scrubber
        var i = 0; // current image
        var rotator = null;
        playlist.find('img').each(function() {
            images.push(this.src);
            imagesEl.push(this);
        });
        
        if(images.length == 0) {
            throw "No images found!";
        }

        create_player();
        
        // Check if all images are loaded here. http://api.jquery.com/load-event/
        $.each(imagesEl, function(index, el) {
            $(el).load(function() {
                imagesLoaded++;
                if(imagesLoaded >= images.length) {
                    if(settings.autoStart === true) {
                        image_cycle();
                    } else {
                        set_image(images[0]);
                    }
                    create_bindings();
                }
            });
        });

        function create_player() {
            // Player elements.
            player          = $('<div>').addClass('img_player');
            stage           = $('<div>').addClass('stage');
            controls        = $('<div>').addClass('controls');
            start           = $('<a>').attr('href', '#').addClass('start');
            prev            = $('<a>').attr('href', '#').addClass('prev');            
			play_pause      = $('<a>').attr('href', '#');
            next            = $('<a>').attr('href', '#').addClass('next');
			end             = $('<a>').attr('href', '#').addClass('end');
            scrubber        = $('<div>').addClass('scrubber');
            scrubber_handle = $('<a>').attr('href', '#');
            fullscreen      = $('<a>').attr('href', '#').addClass('fullscreen');
            frame_count     = $('<span>').addClass('frame_count');
            caption         = $('<div>').addClass('caption');
            // Set dimensions
            player.css({
                width:settings.stageWidth + 'px',
                height:settings.stageHeight + 40 + 'px' // 40 is control bar height
            });
            stage.css({
                width:settings.stageWidth + 'px',
                height:settings.stageHeight + 'px'
            });
            controls.css({
                width:settings.stageWidth + 'px'
            });
            scrubber.css({
				width: Math.floor((settings.stageWidth - 297) / images.length)*(images.length + 1) + 'px'
            });
            // Set the right control for play/pause.
            (settings.autoStart===true) ? play_pause.addClass('pause') : play_pause.addClass('play');
            // Build the player.
            player.append(stage.append(caption)).append(controls.append(start).append(prev).append(play_pause).append(next).append(end).append(scrubber.append(scrubber_handle)).append(fullscreen).append(frame_count));         
            playlist.hide().after(player);
            inc = Math.floor(scrubber.width() / images.length);
        }
        
        function create_bindings() {
            // Bind mouse interactions
            stage.bind('mouseenter', function(e) {
                handle_image_hover(e, this);
            }).bind('mouseleave', function(e) {
                handle_image_out(e, this);
            }); // .hover seems not tow work?
            play_pause.bind('click', function(e) {
                handle_control_click(e, this);
            });
            prev.bind('click', function(e) {
                handle_prev_click(e, this);
            });
            next.bind('click', function(e) {
                handle_next_click(e, this);
            });
            start.bind('click', function(e) {
                handle_start_click(e, this);
            });
            end.bind('click', function(e) {
                handle_end_click(e, this);
            });
            fullscreen.bind('click', function(e) {
                handle_fullscreen_click(e, this);
            });
            scrubber.bind('click', function(e) {
                handle_scrubber_click(e, this);
            });            
        }
        
        function set_image(img) {
            var w = (full === true) ? $(window).innerWidth() : settings.stageWidth;
            var h = (full === true) ? $(window).innerHeight() - 40 : settings.stageHeight;
            var image_object = {
                src: img, 
                alt: 'Slide ' + i + 1, 
                width: w, 
                height: h
            };
            if (image === null) {
                image = $('<img>').attr(image_object);
                stage.append(image);
            } else {
                image.attr(image_object);
            }
            set_caption(i+1);
            frame_count.html(i+1 + '/' + images.length);
        }
        
        function set_caption(frame) {
            if (settings.captions === null || !(frame in settings.captions)) return;
            caption.html(settings.captions[frame]);
        }
        
        function image_cycle() {
            clearTimeout(rotator);
            if(settings.loop === true) {
                if (i > images.length - 1) {
                    i = 0;
                    // stop animation
                    scrubber_handle.stop(true, true);
                    scrubber_handle.css('left', '0');
                }
            }
            if (i < images.length) {
                image_transition(images[i]);
            }
            i++;
        }
        
        function image_transition(img) {
            set_image(img);
            // animate scrubber
            last_frame_scrubber_pos = parseFloat(scrubber_handle.css('left'));
            var remaining = inc*(i+1) - last_frame_scrubber_pos;
            // var percent = Math.floor(remaining / inc);
            scrubber_handle.stop(true, true);
            scrubber_handle.animate({
                left: '+='+remaining+'px'
            }, settings.delay*1000, 'linear');
            rotator = setTimeout(image_cycle, settings.delay * 1000);
        }
        
        function handle_image_hover(e, elem) {
            if(pauseOnHover === true && play_pause.attr('class') === 'pause') { // is playing
                clearTimeout(rotator);
                scrubber_handle.stop(true, true);  
            }
        }
        
        function handle_image_out(e, elem) {
            if(pauseOnHover === true && play_pause.attr('class') === 'pause') {   
                image_cycle();
            }
        }
        
        function handle_control_click(e, elem) {
            e.preventDefault();
            elem = $(elem, player);
            // try if we can use "hasClass"
            if(elem.attr('class') == 'pause') { // it's playing (then pause)
                elem.attr('class', 'play');
                clearTimeout(rotator);
                scrubber_handle.stop(true, false);
                scrubber_handle.css('left', last_frame_scrubber_pos + 'px');
                i--;
            } else { // paused (we have to resume playback)
                image_cycle();
                elem.attr('class', 'pause');
            }
        }

		  // TODO: prev/next/start/end have a lot in common

        function handle_prev_click(e, elem) {
            e.preventDefault();
            elem = $(elem, player);
            clearTimeout(rotator);
            scrubber_handle.stop(true, false);
			i = (i - 1 < 0) ? 0 : i - 1;
            scrubber_handle.css('left', inc*i + 'px');
            if(play_pause.attr('class') === 'pause') { // was playing
                image_cycle();
            } else {
                set_image(images[i]);
            }
        }

        function handle_next_click(e, elem) {
            e.preventDefault();
            elem = $(elem, player);
            clearTimeout(rotator);
            scrubber_handle.stop(true, false);
			i = (i + 1 > images.length - 1) ? images.length - 1 : i + 1;
            scrubber_handle.css('left', inc*i + 'px');
            if(play_pause.attr('class') === 'pause') { // was playing
                image_cycle();
            } else {
                set_image(images[i]);
            }
        }
  
        function handle_start_click(e, elem) {
            e.preventDefault();
            elem = $(elem, player);
            clearTimeout(rotator);
            scrubber_handle.stop(true, false);
            i = 0;
            scrubber_handle.css('left', '0px');
            if(play_pause.attr('class') === 'pause') { // was playing
                image_cycle();
            } else {
                set_image(images[i]);
            }
        }
        
        function handle_end_click(e, elem) {
            e.preventDefault();
            elem = $(elem, player);
            clearTimeout(rotator);
            scrubber_handle.stop(true, false);
            i = images.length - 1;
            scrubber_handle.css('left', i*inc + 'px');
            if(play_pause.attr('class') === 'pause') { // was playing
                image_cycle();
            } else {
                set_image(images[i]);
            }
        }
        
        function handle_fullscreen_click(e, elem) {
            e.preventDefault();
            if(!player.hasClass('full')) {
                full = true;
                pauseOnHover = false; // while we are in fullscreen
                // enter fullscreen
                player.addClass('full');
                player.css('width', $(window).innerWidth() + 'px');
                player.css('height', ($(window).innerHeight()) + 'px');
                stage.css('width', $(window).innerWidth() + 'px');
                stage.css('height', ($(window).innerHeight() - 40) + 'px');
                image.attr('width', $(window).innerWidth());
                image.attr('height', $(window).innerHeight() - 40);
                $(player).siblings().filter(':visible').addClass('invisibleimageplayer');
            } else {
                full = false;
                pauseOnHover = settings.pauseOnHover; // restore
                // exit fullscreen
                player.removeClass('full');
                player.css({
                    width:settings.stageWidth + 'px',
                    height:settings.stageHeight + 40 + 'px'
                });
                stage.css({
                    width:settings.stageWidth + 'px',
                    height:settings.stageHeight + 'px'
                });
                image.attr('width', settings.stageWidth);
                image.attr('height', settings.stageHeight);
                $(player).siblings().removeClass('invisibleimageplayer');
                $('body').scrollTop(player.offset().top);
            } 
        }
        
        function handle_scrubber_click(e, elem) {
            var pos, x_coord, delta_p, delta_n;
            e.preventDefault();
            elem = $(elem, player);
            clearTimeout(rotator);
            scrubber_handle.stop(true, false);
            pos = elem.offset();
            x_coord = Math.ceil(e.pageX - pos.left);
            i = Math.floor(x_coord / inc);
            delta_p = Math.abs(inc*i - x_coord);
            delta_n = Math.abs(inc*(i+1) - x_coord);
			if(i < images.length) {
               if(delta_p <= delta_n) {
                	scrubber_handle.css('left', (x_coord - delta_p) + 'px');
            	} else {
                	scrubber_handle.css('left', (x_coord + delta_n) + 'px');
                	if(i < images.length - 1) i++;
            	}
            	if(play_pause.attr('class') === 'pause') { // was playing
                	image_cycle();
            	} else {
                	set_image(images[i]);
            	}
			}
        }
        
    };
    
    $.imagePlayer.settings = {
        stageWidth:400,
        stageHeight:300,
        autoStart:false,
        pauseOnHover:true,
        delay:1,
        loop:true,
        captions: null
    };
    
})(jQuery);