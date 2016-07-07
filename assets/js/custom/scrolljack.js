//jQuery(document).ready(function($){

	//variables
	var hijacking = 'off',
        delta = 500,
        scrollThreshold = 5,
        actual = 1,
        animating = false;
        scrollDelay = false;

    //DOM elements
    var sectionsAvailable = $('.cd-section'),
    verticalNav = $('.cd-vertical-nav'),
    prevArrow = verticalNav.find('a.cd-prev'),
    nextArrow = verticalNav.find('a.cd-next');

    //check the media query and bind corresponding events
    var MQ = deviceType(),
    bindToggle = false;
    /*initScrolljack(MQ, true);*/

    $(window).on('resize', function(){
        MQ = deviceType();
        initScrolljack(MQ, bindToggle);
        if( MQ == 'mobile' ) bindToggle = true;
        if( MQ == 'desktop' ) bindToggle = false;
    });


    function wheelDirection(evt){
      if (!evt) evt = event;
      return (evt.detail<0) ? 1 : (evt.wheelDelta>0) ? 1 : -1;
    }

    function initScrolljack(MQ, bool) {

        /////FOR TESTING ONLY
        MQ = 'desktop';
        //////////////

        if( MQ == 'desktop' && bool) {

            //bind the animation to the window scroll event, arrows click and keyboard
            initHijacking();
            $(window).on('mousewheel', scrollHijacking);
            $(window).on('DOMMouseScroll', scrollHijacking);

            prevArrow.on('click', prevSection);
            nextArrow.on('click', nextSection);

            $(document).on('keydown', function(event){
                if( event.which=='40' && !nextArrow.hasClass('inactive') ) {
                    event.preventDefault();
                    nextSection();
                } else if( event.which=='38' && (!prevArrow.hasClass('inactive') || (prevArrow.hasClass('inactive') && $(window).scrollTop() != sectionsAvailable.eq(0).offset().top) ) ) {
                    event.preventDefault();
                    prevSection();
                }
            });
            //set navigation arrows visibility
            checkNavigation();
        } else if( MQ == 'mobile' ) {
            //reset and unbind
            resetSectionStyle();
            $(window).off('DOMMouseScroll mousewheel', scrollHijacking);
            prevArrow.off('click', prevSection);
            nextArrow.off('click', nextSection);
            $(document).off('keydown');
        }
    }

    function initHijacking() {
		// initialize section style - scrollhijacking
		var visibleSection = sectionsAvailable.filter('.visible'),
			topSection = visibleSection.prevAll('.cd-section'),
			bottomSection = visibleSection.nextAll('.cd-section'),
			animationParams = selectAnimation(),
            animationVisible = animationParams[0],
            animationTop = animationParams[1],
            animationBottom = animationParams[2];

		visibleSection.children('div').velocity(animationVisible, 1, function(){
			visibleSection.css('opacity', 1);
	    	topSection.css('opacity', 1);
	    	bottomSection.css('opacity', 1);
		});

        topSection.children('div').velocity(animationTop, 0);
        bottomSection.children('div').velocity(animationBottom, 0);
	}

    function scrollHijacking (event) {

        if(!animating && !scrollDelay){
            // on mouse scroll - check if animate section
            scrollDelay = true;
            setTimeout( function(){scrollDelay = false;}, 10);
            if (event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0) {
                delta--;
                ( Math.abs(delta) >= scrollThreshold) && prevSection();
            } else {
                delta++;
                (delta >= scrollThreshold) && nextSection();
            }
            return false;
        }

    }

    function prevSection(event) {
        //go to previous section
        typeof event !== 'undefined' && event.preventDefault();

        var visibleSection = sectionsAvailable.filter('.visible'),
        animationParams = selectAnimation();
        //unbindScroll(visibleSection.prev('.cd-section'), animationParams[3]);

        if( !animating && !visibleSection.is(":first-child") ) {
            animating = true;
            visibleSection.removeClass('visible').children('div').velocity(animationParams[2], animationParams[3], animationParams[4])
            .end().prev('.cd-section').addClass('visible').children('div').velocity(animationParams[0] , animationParams[3], animationParams[4], function(){

                animating = false;
                //if( hijacking == 'off') $(window).on('scroll', scrollAnimation);
            });

            actual = actual - 1;
        }

        resetScroll();
    }

    function nextSection(event) {
        //go to next section
        typeof event !== 'undefined' && event.preventDefault();

        var visibleSection = sectionsAvailable.filter('.visible'),
		nextSection = visibleSection.next('.cd-section'),
        animationParams = selectAnimation();
        //unbindScroll(visibleSection.next('.cd-section'), animationParams[3]);

        if(!animating && !visibleSection.is(":last-of-type") ) {
            animating = true;
            visibleSection.removeClass('visible').children('div').velocity(animationParams[1], animationParams[3], animationParams[4] )
            .end().next('.cd-section').addClass('visible').children('div').velocity(animationParams[0], animationParams[3], animationParams[4], function(){
                animating = false;
				scrollEvent(nextSection);
                //if( hijacking == 'off') $(window).on('scroll', scrollAnimation);
            });

            actual = actual +1;
        }

        resetScroll();
    }

	function scrollEvent(section) {
		if(section.hasClass('cd-section--about')){
			$aboutbg = $(".aboutbg"); //or what element you like
			$animateborder = $(".animateborder");
			$aboutbg.addClass("aboutbg--visible");
			$animateborder.addClass("animateborder--expand");
		}
	}

    function unbindScroll(section, time) {
        //if clicking on navigation - unbind scroll and animate using custom velocity animation
        if( hijacking == 'off') {
            $(window).off('scroll', scrollAnimation);
            ( animationType == 'catch') ? $('body, html').scrollTop(section.offset().top) : section.velocity("scroll", { duration: time });
        }
    }

    function resetScroll() {
        delta = 0;
        checkNavigation();
    }

    function checkNavigation() {
        //update navigation arrows visibility
        ( sectionsAvailable.filter('.visible').is(':first-of-type') ) ? prevArrow.addClass('inactive') : prevArrow.removeClass('inactive');
        ( sectionsAvailable.filter('.visible').is(':last-of-type')  ) ? nextArrow.addClass('inactive') : nextArrow.removeClass('inactive');
    }

    function resetSectionStyle() {
        //on mobile - remove style applied with jQuery
        sectionsAvailable.children('div').each(function(){
            $(this).attr('style', '');
        });
    }

    function deviceType() {
        //detect if desktop/mobile
        return window.getComputedStyle(document.querySelector('body'), '::before').getPropertyValue('content').replace(/"/g, "").replace(/'/g, "");
    }

    function selectAnimation() {
		// select section animation - scrollhijacking
		var animationVisible = 'translateNone',
			animationTop = 'translateUp',
			animationBottom = 'translateDown',
			easing = 'ease',
			animDuration = 800;

		return [animationVisible, animationTop, animationBottom, animDuration, easing];
	}
//});

$.Velocity
    .RegisterEffect("translateUp", {
    	defaultDuration: 1,
        calls: [
            [ { translateY: '-100%'}, 1]
        ]
    });
$.Velocity
    .RegisterEffect("translateDown", {
    	defaultDuration: 1,
        calls: [
            [ { translateY: '100%'}, 1]
        ]
    });
$.Velocity
    .RegisterEffect("translateNone", {
    	defaultDuration: 1,
        calls: [
            [ { translateY: '0', opacity: '1', scale: '1', rotateX: '0', boxShadowBlur: '0'}, 1]
        ]
    });
