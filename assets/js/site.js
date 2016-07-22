// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());
// Place any jQuery/helper plugins in here.
function debounce(fn, delay) {
  var timer = null;
  return function () {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      fn.apply(context, args);
    }, delay);
  };
}

function throttle(fn, threshhold, scope) {
  threshhold || (threshhold = 250);
  var last,
      deferTimer;
  return function () {
    var context = scope || this;

    var now = +new Date,
        args = arguments;
    if (last && now < last + threshhold) {
      // hold on to it
      clearTimeout(deferTimer);
      deferTimer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, threshhold);
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
}

function wheelDirection(evt){
  if (!evt) evt = event;
  return (evt.detail<0) ? 1 : (evt.wheelDelta>0) ? 1 : -1;
}

//jQuery(document).ready(function($){

	//variables
	var hijacking = 'off',
        delta = 500,
        scrollThreshold = 3,
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
    	if(section.hasClass('cd-section--contact')){
    		$aboutbg = $(".contactbg"); //or what element you like
    		$aboutbg.addClass("contactbg--visible");
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

//(function() {
    'use strict';
    // 'To actually be able to display anything with Three.js, we need three things:
    // A scene, a camera, and a renderer so we can render the scene with the camera.'
    // - http://threejs.org/docs/#Manual/Introduction/Creating_a_scene

    var scene, camera, renderer;

    // I guess we need this stuff too
    var container,
        spaceWrapper,
        HEIGHT,
        WIDTH,
        fieldOfView,
        aspectRatio,
        nearPlane,
        farPlane,
        geometry,
        particleCount,
        i,
        h,
        color,
        size,
        materials = [],
        mouseX = 0,
        mouseY = 0,
        windowHalfX,
        windowHalfY,
        cameraZ,
        fogHex,
        fogDensity,
        parameters = {},
        parameterCount,
        particles;

        spaceWrapper = document.querySelector('.js-space-wrapper');

    //spaceInit();
/*    animate();*/

    function spaceInit() {

        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        windowHalfX = WIDTH / 2;
        windowHalfY = HEIGHT / 2;

        fieldOfView = 75;
        aspectRatio = WIDTH / HEIGHT;
        nearPlane = 1;
        farPlane = 10000;

        /* 	fieldOfView — Camera frustum vertical field of view.
	       aspectRatio — Camera frustum aspect ratio.
	          nearPlane — Camera frustum near plane.
	             farPlane — Camera frustum far plane.

	- http://threejs.org/docs/#Reference/Cameras/PerspectiveCamera

	In geometry, a frustum (plural: frusta or frustums)
	is the portion of a solid (normally a cone or pyramid)
	that lies between two parallel planes cutting it. - wikipedia.		*/

        cameraZ = 1250; /*	So, 1500? Yes! move on!	*/
        fogHex = 0x000000; /* As black as your heart.	*/
        fogDensity = 0.001; /* So not terribly dense? NO FOG IN SPACE	*/

        camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
        camera.position.z = cameraZ;

        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(fogHex, fogDensity);

        container = document.querySelector('.spaaace');

        geometry = new THREE.Geometry(); /*	NO ONE SAID ANYTHING ABOUT MATH! UGH!	*/

        particleCount = 90000; /* Leagues under the sea */

        /*
        Hope you took your motion sickness pills;
	    We're about to get loopy.
        generate coordinates for our particles
         */

        for (i = 0; i < particleCount; i++) {

            var vertex = new THREE.Vector3();
            /*vertex.x = Math.random() * 2000 - 1000;
            vertex.y = Math.random() * 2000 - 1000;
            vertex.z = Math.random() * 2000 - 1000; */

            vertex.x = Math.random() * 2000 - 1000;
            vertex.y = Math.random() * 2000 - 1000;
            vertex.z = Math.random() * 10000 - 1000;

            geometry.vertices.push(vertex);
        }

        /*	We can't stop here, this is bat country!	*/

        //generate particle size and opacity for 5 difference point clouds
        parameters = [
            [
                [1, 1, 1], 2
            ],
            [
                [0.95, 1, 1], 2
            ],

            [
                [0.95, 1, 1], 1
            ],

            [
                [0.9, 1, 0.9], 1
            ],
            [
                [0.8, 1, 0.8], 1
            ]
        ];

        parameterCount = parameters.length;

        /*	I told you to take those motion sickness pills.
	       Clean that vommit up, we're going again!	*/
        //loop over the oarameters to rended the 5 different clouds and apply a random rotation to each one
        for (i = 0; i < parameterCount; i++) {

            color = parameters[i][0];
            size = parameters[i][1];

            materials[i] = new THREE.PointsMaterial({
                size: size,
                map: THREE.ImageUtils.loadTexture(
                  "assets/img/particle2.png"
                ),
                blending: THREE.AdditiveBlending,
                transparent: true
            });

            //each cloud takes the geometry points generated earlier and the size from the array we're looping over
            particles = new THREE.Points(geometry, materials[i]);

            particles.sortParticles = true;

            //randomly rotate each cloud so the points aren't all on top of each other
            particles.rotation.x = Math.random() * 6;
            particles.rotation.y = Math.random() * 6;
            particles.rotation.z = Math.random() * 6;

            scene.add(particles);
        }

        /*	If my calculations are correct, when this baby hits 88 miles per hour...
	you're gonna see some serious shit.	*/

        renderer = new THREE.WebGLRenderer( { alpha: true }); /*	Rendererererers particles. Alpha allows for a transparent bg	*/
        renderer.setPixelRatio(window.devicePixelRatio); /*	Probably 1; unless you're fancy.	*/
        renderer.setSize(WIDTH, HEIGHT); /*	Full screen baby Wooooo!	*/

        container.appendChild(renderer.domElement); /* Let's add all this crazy junk to the page.	*/

        /*	I don't know about you, but I like to know how bad my
		code is wrecking the performance of a user's machine.
		Let's see some damn stats!	*/

        /* Event Listeners */

        window.addEventListener('resize', onWindowResize, false);
        //yup, mousemove function
        document.addEventListener('mousemove', onDocumentMouseMove, false);
        document.addEventListener('touchstart', onDocumentTouchStart, false);
        document.addEventListener('touchmove', onDocumentTouchMove, false);

    }

    function animate() {

        var sceneVisible = checkVisible();
        requestAnimationFrame(animate);

        if(sceneVisible){
            render();
        }
    }

    function checkVisible() {

        var elementVisible = true;
        if(spaceWrapper.classList.contains('visible')){
            elementVisible = true;
        } else {
            elementVisible = false;
        }

        if(elementVisible){
            return true;
        }
        else{
            return false;
        }
    }

    function render() {
        var time = Date.now() * 0.00005;

        //set camera facing based on mouse position
        // mouseX & mouseY retreived using the function called on mousemove
        // the multiplication by 0.05 gives it the feeling of acceleration as it moves the camera incrementallly more than the mouse
        camera.position.x += (mouseX/25 - camera.position.x) * 0.025;
        camera.position.y += (-mouseY/25 - camera.position.y) * 0.025;
        //camera.position.z += (-mouseX/10 - camera.position.x) * 0.025;
        //camera.position.z += (mouseY/10 - camera.position.y) * 0.025;

        camera.position.z -= 2.6;
        //camera.position.z += 1;



        camera.lookAt(scene.position);

        //idk
        for (i = 0; i < scene.children.length; i++) {

            var object = scene.children[i];

            if (object instanceof THREE.PointCloud) {

                //wtf halp plz
                object.rotation.y = time * (i < 4 ? i + 1 : -(i + 1));
            }
        }

        //applies differet colouring over time
        for (i = 0; i < materials.length; i++) {

            color = parameters[i][0];

            h = (360 * (color[0] + time) % 360) / 360;
            materials[i].color.setHSL(h, color[1], color[2]);
        }


        renderer.render(scene, camera);
    }

    function onDocumentMouseMove(e) {
        mouseX = e.clientX - windowHalfX;
        mouseY = e.clientY - windowHalfY;
        //mouseX = e.clientX;
        //mouseY = e.clientY;
    }

    /*	Mobile users?  I got your back homey	*/

    function onDocumentTouchStart(e) {

        if (e.touches.length === 1) {

            e.preventDefault();
            mouseX = e.touches[0].pageX - windowHalfX;
            mouseY = e.touches[0].pageY - windowHalfY;
        }
    }

    function onDocumentTouchMove(e) {

        if (e.touches.length === 1) {

            e.preventDefault();
            mouseX = e.touches[0].pageX - windowHalfX;
            mouseY = e.touches[0].pageY - windowHalfY;
        }
    }

    function onWindowResize() {

        windowHalfX = window.innerWidth / 2;
        windowHalfY = window.innerHeight / 2;

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
//})();

(function() {
    initScrolljack(MQ, true);
    spaceInit();
    animate(spaceWrapper);
})();

$(document).ready(function(){
    // init jquery smoothscroll and slider
  $('.portfolio__slider-js').slick({
      speed:1000,
      prevArrow:'.portfolio-nav__link--left',
      nextArrow:'.portfolio-nav__link--right'
  });

  $('a[href*="#"]').on('click', function (e) {
      // prevent default action and bubbling
      e.preventDefault();
      e.stopPropagation();
      // set target to anchor's "href" attribute
      var target = $(this).attr('href');
      // scroll to each target
      $(target).velocity('scroll', {
          duration: 1000,
          easing: 'ease-in-out'
      });
  });

});

(function() {
    'use strict';

    var portfolioContainer,
    aboutContainer,
    contactContainer,
    HEIGHT,
    WIDTH;

    init();

    function init(){
        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;

        portfolioContainer = document.querySelector('.portfolio-js');
        aboutContainer = document.querySelector('.about-js');
        contactContainer = document.querySelector('.contact-js');

        portfolioContainer.style.height = HEIGHT;
        aboutContainer.style.height = HEIGHT;
        contactContainer.style.height = HEIGHT;

    }

})();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBsdWdpbnMuanMiLCJzY3JvbGxqYWNrLmpzIiwic3BhY2UuanMiLCJtYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDek9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJzaXRlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gQXZvaWQgYGNvbnNvbGVgIGVycm9ycyBpbiBicm93c2VycyB0aGF0IGxhY2sgYSBjb25zb2xlLlxuKGZ1bmN0aW9uKCkge1xuICAgIHZhciBtZXRob2Q7XG4gICAgdmFyIG5vb3AgPSBmdW5jdGlvbiAoKSB7fTtcbiAgICB2YXIgbWV0aG9kcyA9IFtcbiAgICAgICAgJ2Fzc2VydCcsICdjbGVhcicsICdjb3VudCcsICdkZWJ1ZycsICdkaXInLCAnZGlyeG1sJywgJ2Vycm9yJyxcbiAgICAgICAgJ2V4Y2VwdGlvbicsICdncm91cCcsICdncm91cENvbGxhcHNlZCcsICdncm91cEVuZCcsICdpbmZvJywgJ2xvZycsXG4gICAgICAgICdtYXJrVGltZWxpbmUnLCAncHJvZmlsZScsICdwcm9maWxlRW5kJywgJ3RhYmxlJywgJ3RpbWUnLCAndGltZUVuZCcsXG4gICAgICAgICd0aW1lbGluZScsICd0aW1lbGluZUVuZCcsICd0aW1lU3RhbXAnLCAndHJhY2UnLCAnd2FybidcbiAgICBdO1xuICAgIHZhciBsZW5ndGggPSBtZXRob2RzLmxlbmd0aDtcbiAgICB2YXIgY29uc29sZSA9ICh3aW5kb3cuY29uc29sZSA9IHdpbmRvdy5jb25zb2xlIHx8IHt9KTtcblxuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBtZXRob2QgPSBtZXRob2RzW2xlbmd0aF07XG5cbiAgICAgICAgLy8gT25seSBzdHViIHVuZGVmaW5lZCBtZXRob2RzLlxuICAgICAgICBpZiAoIWNvbnNvbGVbbWV0aG9kXSkge1xuICAgICAgICAgICAgY29uc29sZVttZXRob2RdID0gbm9vcDtcbiAgICAgICAgfVxuICAgIH1cbn0oKSk7XG4vLyBQbGFjZSBhbnkgalF1ZXJ5L2hlbHBlciBwbHVnaW5zIGluIGhlcmUuXG5mdW5jdGlvbiBkZWJvdW5jZShmbiwgZGVsYXkpIHtcbiAgdmFyIHRpbWVyID0gbnVsbDtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgZm4uYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgfSwgZGVsYXkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0aHJvdHRsZShmbiwgdGhyZXNoaG9sZCwgc2NvcGUpIHtcbiAgdGhyZXNoaG9sZCB8fCAodGhyZXNoaG9sZCA9IDI1MCk7XG4gIHZhciBsYXN0LFxuICAgICAgZGVmZXJUaW1lcjtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY29udGV4dCA9IHNjb3BlIHx8IHRoaXM7XG5cbiAgICB2YXIgbm93ID0gK25ldyBEYXRlLFxuICAgICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgIGlmIChsYXN0ICYmIG5vdyA8IGxhc3QgKyB0aHJlc2hob2xkKSB7XG4gICAgICAvLyBob2xkIG9uIHRvIGl0XG4gICAgICBjbGVhclRpbWVvdXQoZGVmZXJUaW1lcik7XG4gICAgICBkZWZlclRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxhc3QgPSBub3c7XG4gICAgICAgIGZuLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgfSwgdGhyZXNoaG9sZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxhc3QgPSBub3c7XG4gICAgICBmbi5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB9XG4gIH07XG59XG5cbmZ1bmN0aW9uIHdoZWVsRGlyZWN0aW9uKGV2dCl7XG4gIGlmICghZXZ0KSBldnQgPSBldmVudDtcbiAgcmV0dXJuIChldnQuZGV0YWlsPDApID8gMSA6IChldnQud2hlZWxEZWx0YT4wKSA/IDEgOiAtMTtcbn1cbiIsIi8valF1ZXJ5KGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigkKXtcblxuXHQvL3ZhcmlhYmxlc1xuXHR2YXIgaGlqYWNraW5nID0gJ29mZicsXG4gICAgICAgIGRlbHRhID0gNTAwLFxuICAgICAgICBzY3JvbGxUaHJlc2hvbGQgPSAzLFxuICAgICAgICBhY3R1YWwgPSAxLFxuICAgICAgICBhbmltYXRpbmcgPSBmYWxzZTtcbiAgICAgICAgc2Nyb2xsRGVsYXkgPSBmYWxzZTtcblxuICAgIC8vRE9NIGVsZW1lbnRzXG4gICAgdmFyIHNlY3Rpb25zQXZhaWxhYmxlID0gJCgnLmNkLXNlY3Rpb24nKSxcbiAgICB2ZXJ0aWNhbE5hdiA9ICQoJy5jZC12ZXJ0aWNhbC1uYXYnKSxcbiAgICBwcmV2QXJyb3cgPSB2ZXJ0aWNhbE5hdi5maW5kKCdhLmNkLXByZXYnKSxcbiAgICBuZXh0QXJyb3cgPSB2ZXJ0aWNhbE5hdi5maW5kKCdhLmNkLW5leHQnKTtcblxuICAgIC8vY2hlY2sgdGhlIG1lZGlhIHF1ZXJ5IGFuZCBiaW5kIGNvcnJlc3BvbmRpbmcgZXZlbnRzXG4gICAgdmFyIE1RID0gZGV2aWNlVHlwZSgpLFxuICAgIGJpbmRUb2dnbGUgPSBmYWxzZTtcbiAgICAvKmluaXRTY3JvbGxqYWNrKE1RLCB0cnVlKTsqL1xuXG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbigpe1xuICAgICAgICBNUSA9IGRldmljZVR5cGUoKTtcbiAgICAgICAgaW5pdFNjcm9sbGphY2soTVEsIGJpbmRUb2dnbGUpO1xuICAgICAgICBpZiggTVEgPT0gJ21vYmlsZScgKSBiaW5kVG9nZ2xlID0gdHJ1ZTtcbiAgICAgICAgaWYoIE1RID09ICdkZXNrdG9wJyApIGJpbmRUb2dnbGUgPSBmYWxzZTtcbiAgICB9KTtcblxuXG4gICAgZnVuY3Rpb24gd2hlZWxEaXJlY3Rpb24oZXZ0KXtcbiAgICAgIGlmICghZXZ0KSBldnQgPSBldmVudDtcbiAgICAgIHJldHVybiAoZXZ0LmRldGFpbDwwKSA/IDEgOiAoZXZ0LndoZWVsRGVsdGE+MCkgPyAxIDogLTE7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdFNjcm9sbGphY2soTVEsIGJvb2wpIHtcblxuICAgICAgICAvLy8vL0ZPUiBURVNUSU5HIE9OTFlcbiAgICAgICAgTVEgPSAnZGVza3RvcCc7XG4gICAgICAgIC8vLy8vLy8vLy8vLy8vXG5cbiAgICAgICAgaWYoIE1RID09ICdkZXNrdG9wJyAmJiBib29sKSB7XG5cbiAgICAgICAgICAgIC8vYmluZCB0aGUgYW5pbWF0aW9uIHRvIHRoZSB3aW5kb3cgc2Nyb2xsIGV2ZW50LCBhcnJvd3MgY2xpY2sgYW5kIGtleWJvYXJkXG4gICAgICAgICAgICBpbml0SGlqYWNraW5nKCk7XG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ21vdXNld2hlZWwnLCBzY3JvbGxIaWphY2tpbmcpO1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdET01Nb3VzZVNjcm9sbCcsIHNjcm9sbEhpamFja2luZyk7XG5cbiAgICAgICAgICAgIHByZXZBcnJvdy5vbignY2xpY2snLCBwcmV2U2VjdGlvbik7XG4gICAgICAgICAgICBuZXh0QXJyb3cub24oJ2NsaWNrJywgbmV4dFNlY3Rpb24pO1xuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbigna2V5ZG93bicsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICBpZiggZXZlbnQud2hpY2g9PSc0MCcgJiYgIW5leHRBcnJvdy5oYXNDbGFzcygnaW5hY3RpdmUnKSApIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dFNlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYoIGV2ZW50LndoaWNoPT0nMzgnICYmICghcHJldkFycm93Lmhhc0NsYXNzKCdpbmFjdGl2ZScpIHx8IChwcmV2QXJyb3cuaGFzQ2xhc3MoJ2luYWN0aXZlJykgJiYgJCh3aW5kb3cpLnNjcm9sbFRvcCgpICE9IHNlY3Rpb25zQXZhaWxhYmxlLmVxKDApLm9mZnNldCgpLnRvcCkgKSApIHtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgcHJldlNlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vc2V0IG5hdmlnYXRpb24gYXJyb3dzIHZpc2liaWxpdHlcbiAgICAgICAgICAgIGNoZWNrTmF2aWdhdGlvbigpO1xuICAgICAgICB9IGVsc2UgaWYoIE1RID09ICdtb2JpbGUnICkge1xuICAgICAgICAgICAgLy9yZXNldCBhbmQgdW5iaW5kXG4gICAgICAgICAgICByZXNldFNlY3Rpb25TdHlsZSgpO1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZignRE9NTW91c2VTY3JvbGwgbW91c2V3aGVlbCcsIHNjcm9sbEhpamFja2luZyk7XG4gICAgICAgICAgICBwcmV2QXJyb3cub2ZmKCdjbGljaycsIHByZXZTZWN0aW9uKTtcbiAgICAgICAgICAgIG5leHRBcnJvdy5vZmYoJ2NsaWNrJywgbmV4dFNlY3Rpb24pO1xuICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdrZXlkb3duJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpbml0SGlqYWNraW5nKCkge1xuXHRcdC8vIGluaXRpYWxpemUgc2VjdGlvbiBzdHlsZSAtIHNjcm9sbGhpamFja2luZ1xuXHRcdHZhciB2aXNpYmxlU2VjdGlvbiA9IHNlY3Rpb25zQXZhaWxhYmxlLmZpbHRlcignLnZpc2libGUnKSxcblx0XHRcdHRvcFNlY3Rpb24gPSB2aXNpYmxlU2VjdGlvbi5wcmV2QWxsKCcuY2Qtc2VjdGlvbicpLFxuXHRcdFx0Ym90dG9tU2VjdGlvbiA9IHZpc2libGVTZWN0aW9uLm5leHRBbGwoJy5jZC1zZWN0aW9uJyksXG5cdFx0XHRhbmltYXRpb25QYXJhbXMgPSBzZWxlY3RBbmltYXRpb24oKSxcbiAgICAgICAgICAgIGFuaW1hdGlvblZpc2libGUgPSBhbmltYXRpb25QYXJhbXNbMF0sXG4gICAgICAgICAgICBhbmltYXRpb25Ub3AgPSBhbmltYXRpb25QYXJhbXNbMV0sXG4gICAgICAgICAgICBhbmltYXRpb25Cb3R0b20gPSBhbmltYXRpb25QYXJhbXNbMl07XG5cblx0XHR2aXNpYmxlU2VjdGlvbi5jaGlsZHJlbignZGl2JykudmVsb2NpdHkoYW5pbWF0aW9uVmlzaWJsZSwgMSwgZnVuY3Rpb24oKXtcblx0XHRcdHZpc2libGVTZWN0aW9uLmNzcygnb3BhY2l0eScsIDEpO1xuXHQgICAgXHR0b3BTZWN0aW9uLmNzcygnb3BhY2l0eScsIDEpO1xuXHQgICAgXHRib3R0b21TZWN0aW9uLmNzcygnb3BhY2l0eScsIDEpO1xuXHRcdH0pO1xuXG4gICAgICAgIHRvcFNlY3Rpb24uY2hpbGRyZW4oJ2RpdicpLnZlbG9jaXR5KGFuaW1hdGlvblRvcCwgMCk7XG4gICAgICAgIGJvdHRvbVNlY3Rpb24uY2hpbGRyZW4oJ2RpdicpLnZlbG9jaXR5KGFuaW1hdGlvbkJvdHRvbSwgMCk7XG5cdH1cblxuICAgIGZ1bmN0aW9uIHNjcm9sbEhpamFja2luZyAoZXZlbnQpIHtcblxuICAgICAgICBpZighYW5pbWF0aW5nICYmICFzY3JvbGxEZWxheSl7XG4gICAgICAgICAgICAvLyBvbiBtb3VzZSBzY3JvbGwgLSBjaGVjayBpZiBhbmltYXRlIHNlY3Rpb25cbiAgICAgICAgICAgIHNjcm9sbERlbGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCl7c2Nyb2xsRGVsYXkgPSBmYWxzZTt9LCAxMCk7XG4gICAgICAgICAgICBpZiAoZXZlbnQub3JpZ2luYWxFdmVudC5kZXRhaWwgPCAwIHx8IGV2ZW50Lm9yaWdpbmFsRXZlbnQud2hlZWxEZWx0YSA+IDApIHtcbiAgICAgICAgICAgICAgICBkZWx0YS0tO1xuICAgICAgICAgICAgICAgICggTWF0aC5hYnMoZGVsdGEpID49IHNjcm9sbFRocmVzaG9sZCkgJiYgcHJldlNlY3Rpb24oKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVsdGErKztcbiAgICAgICAgICAgICAgICAoZGVsdGEgPj0gc2Nyb2xsVGhyZXNob2xkKSAmJiBuZXh0U2VjdGlvbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwcmV2U2VjdGlvbihldmVudCkge1xuICAgICAgICAvL2dvIHRvIHByZXZpb3VzIHNlY3Rpb25cbiAgICAgICAgdHlwZW9mIGV2ZW50ICE9PSAndW5kZWZpbmVkJyAmJiBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIHZhciB2aXNpYmxlU2VjdGlvbiA9IHNlY3Rpb25zQXZhaWxhYmxlLmZpbHRlcignLnZpc2libGUnKSxcbiAgICAgICAgYW5pbWF0aW9uUGFyYW1zID0gc2VsZWN0QW5pbWF0aW9uKCk7XG4gICAgICAgIC8vdW5iaW5kU2Nyb2xsKHZpc2libGVTZWN0aW9uLnByZXYoJy5jZC1zZWN0aW9uJyksIGFuaW1hdGlvblBhcmFtc1szXSk7XG5cbiAgICAgICAgaWYoICFhbmltYXRpbmcgJiYgIXZpc2libGVTZWN0aW9uLmlzKFwiOmZpcnN0LWNoaWxkXCIpICkge1xuICAgICAgICAgICAgYW5pbWF0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHZpc2libGVTZWN0aW9uLnJlbW92ZUNsYXNzKCd2aXNpYmxlJykuY2hpbGRyZW4oJ2RpdicpLnZlbG9jaXR5KGFuaW1hdGlvblBhcmFtc1syXSwgYW5pbWF0aW9uUGFyYW1zWzNdLCBhbmltYXRpb25QYXJhbXNbNF0pXG4gICAgICAgICAgICAuZW5kKCkucHJldignLmNkLXNlY3Rpb24nKS5hZGRDbGFzcygndmlzaWJsZScpLmNoaWxkcmVuKCdkaXYnKS52ZWxvY2l0eShhbmltYXRpb25QYXJhbXNbMF0gLCBhbmltYXRpb25QYXJhbXNbM10sIGFuaW1hdGlvblBhcmFtc1s0XSwgZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgIGFuaW1hdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIC8vaWYoIGhpamFja2luZyA9PSAnb2ZmJykgJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCBzY3JvbGxBbmltYXRpb24pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGFjdHVhbCA9IGFjdHVhbCAtIDE7XG4gICAgICAgIH1cblxuICAgICAgICByZXNldFNjcm9sbCgpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIG5leHRTZWN0aW9uKGV2ZW50KSB7XG4gICAgICAgIC8vZ28gdG8gbmV4dCBzZWN0aW9uXG4gICAgICAgIHR5cGVvZiBldmVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICB2YXIgdmlzaWJsZVNlY3Rpb24gPSBzZWN0aW9uc0F2YWlsYWJsZS5maWx0ZXIoJy52aXNpYmxlJyksXG5cdFx0bmV4dFNlY3Rpb24gPSB2aXNpYmxlU2VjdGlvbi5uZXh0KCcuY2Qtc2VjdGlvbicpLFxuICAgICAgICBhbmltYXRpb25QYXJhbXMgPSBzZWxlY3RBbmltYXRpb24oKTtcbiAgICAgICAgLy91bmJpbmRTY3JvbGwodmlzaWJsZVNlY3Rpb24ubmV4dCgnLmNkLXNlY3Rpb24nKSwgYW5pbWF0aW9uUGFyYW1zWzNdKTtcblxuICAgICAgICBpZighYW5pbWF0aW5nICYmICF2aXNpYmxlU2VjdGlvbi5pcyhcIjpsYXN0LW9mLXR5cGVcIikgKSB7XG4gICAgICAgICAgICBhbmltYXRpbmcgPSB0cnVlO1xuICAgICAgICAgICAgdmlzaWJsZVNlY3Rpb24ucmVtb3ZlQ2xhc3MoJ3Zpc2libGUnKS5jaGlsZHJlbignZGl2JykudmVsb2NpdHkoYW5pbWF0aW9uUGFyYW1zWzFdLCBhbmltYXRpb25QYXJhbXNbM10sIGFuaW1hdGlvblBhcmFtc1s0XSApXG4gICAgICAgICAgICAuZW5kKCkubmV4dCgnLmNkLXNlY3Rpb24nKS5hZGRDbGFzcygndmlzaWJsZScpLmNoaWxkcmVuKCdkaXYnKS52ZWxvY2l0eShhbmltYXRpb25QYXJhbXNbMF0sIGFuaW1hdGlvblBhcmFtc1szXSwgYW5pbWF0aW9uUGFyYW1zWzRdLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGFuaW1hdGluZyA9IGZhbHNlO1xuXHRcdFx0XHRzY3JvbGxFdmVudChuZXh0U2VjdGlvbik7XG4gICAgICAgICAgICAgICAgLy9pZiggaGlqYWNraW5nID09ICdvZmYnKSAkKHdpbmRvdykub24oJ3Njcm9sbCcsIHNjcm9sbEFuaW1hdGlvbik7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgYWN0dWFsID0gYWN0dWFsICsxO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzZXRTY3JvbGwoKTtcbiAgICB9XG5cblx0ZnVuY3Rpb24gc2Nyb2xsRXZlbnQoc2VjdGlvbikge1xuXHRcdGlmKHNlY3Rpb24uaGFzQ2xhc3MoJ2NkLXNlY3Rpb24tLWFib3V0Jykpe1xuXHRcdFx0JGFib3V0YmcgPSAkKFwiLmFib3V0YmdcIik7IC8vb3Igd2hhdCBlbGVtZW50IHlvdSBsaWtlXG5cdFx0XHQkYW5pbWF0ZWJvcmRlciA9ICQoXCIuYW5pbWF0ZWJvcmRlclwiKTtcblx0XHRcdCRhYm91dGJnLmFkZENsYXNzKFwiYWJvdXRiZy0tdmlzaWJsZVwiKTtcblx0XHRcdCRhbmltYXRlYm9yZGVyLmFkZENsYXNzKFwiYW5pbWF0ZWJvcmRlci0tZXhwYW5kXCIpO1xuXHRcdH1cbiAgICBcdGlmKHNlY3Rpb24uaGFzQ2xhc3MoJ2NkLXNlY3Rpb24tLWNvbnRhY3QnKSl7XG4gICAgXHRcdCRhYm91dGJnID0gJChcIi5jb250YWN0YmdcIik7IC8vb3Igd2hhdCBlbGVtZW50IHlvdSBsaWtlXG4gICAgXHRcdCRhYm91dGJnLmFkZENsYXNzKFwiY29udGFjdGJnLS12aXNpYmxlXCIpO1xuICAgIFx0fVxuXHR9XG5cbiAgICBmdW5jdGlvbiB1bmJpbmRTY3JvbGwoc2VjdGlvbiwgdGltZSkge1xuICAgICAgICAvL2lmIGNsaWNraW5nIG9uIG5hdmlnYXRpb24gLSB1bmJpbmQgc2Nyb2xsIGFuZCBhbmltYXRlIHVzaW5nIGN1c3RvbSB2ZWxvY2l0eSBhbmltYXRpb25cbiAgICAgICAgaWYoIGhpamFja2luZyA9PSAnb2ZmJykge1xuICAgICAgICAgICAgJCh3aW5kb3cpLm9mZignc2Nyb2xsJywgc2Nyb2xsQW5pbWF0aW9uKTtcbiAgICAgICAgICAgICggYW5pbWF0aW9uVHlwZSA9PSAnY2F0Y2gnKSA/ICQoJ2JvZHksIGh0bWwnKS5zY3JvbGxUb3Aoc2VjdGlvbi5vZmZzZXQoKS50b3ApIDogc2VjdGlvbi52ZWxvY2l0eShcInNjcm9sbFwiLCB7IGR1cmF0aW9uOiB0aW1lIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXRTY3JvbGwoKSB7XG4gICAgICAgIGRlbHRhID0gMDtcbiAgICAgICAgY2hlY2tOYXZpZ2F0aW9uKCk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2hlY2tOYXZpZ2F0aW9uKCkge1xuICAgICAgICAvL3VwZGF0ZSBuYXZpZ2F0aW9uIGFycm93cyB2aXNpYmlsaXR5XG4gICAgICAgICggc2VjdGlvbnNBdmFpbGFibGUuZmlsdGVyKCcudmlzaWJsZScpLmlzKCc6Zmlyc3Qtb2YtdHlwZScpICkgPyBwcmV2QXJyb3cuYWRkQ2xhc3MoJ2luYWN0aXZlJykgOiBwcmV2QXJyb3cucmVtb3ZlQ2xhc3MoJ2luYWN0aXZlJyk7XG4gICAgICAgICggc2VjdGlvbnNBdmFpbGFibGUuZmlsdGVyKCcudmlzaWJsZScpLmlzKCc6bGFzdC1vZi10eXBlJykgICkgPyBuZXh0QXJyb3cuYWRkQ2xhc3MoJ2luYWN0aXZlJykgOiBuZXh0QXJyb3cucmVtb3ZlQ2xhc3MoJ2luYWN0aXZlJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXRTZWN0aW9uU3R5bGUoKSB7XG4gICAgICAgIC8vb24gbW9iaWxlIC0gcmVtb3ZlIHN0eWxlIGFwcGxpZWQgd2l0aCBqUXVlcnlcbiAgICAgICAgc2VjdGlvbnNBdmFpbGFibGUuY2hpbGRyZW4oJ2RpdicpLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykuYXR0cignc3R5bGUnLCAnJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRldmljZVR5cGUoKSB7XG4gICAgICAgIC8vZGV0ZWN0IGlmIGRlc2t0b3AvbW9iaWxlXG4gICAgICAgIHJldHVybiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JyksICc6OmJlZm9yZScpLmdldFByb3BlcnR5VmFsdWUoJ2NvbnRlbnQnKS5yZXBsYWNlKC9cIi9nLCBcIlwiKS5yZXBsYWNlKC8nL2csIFwiXCIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHNlbGVjdEFuaW1hdGlvbigpIHtcblx0XHQvLyBzZWxlY3Qgc2VjdGlvbiBhbmltYXRpb24gLSBzY3JvbGxoaWphY2tpbmdcblx0XHR2YXIgYW5pbWF0aW9uVmlzaWJsZSA9ICd0cmFuc2xhdGVOb25lJyxcblx0XHRcdGFuaW1hdGlvblRvcCA9ICd0cmFuc2xhdGVVcCcsXG5cdFx0XHRhbmltYXRpb25Cb3R0b20gPSAndHJhbnNsYXRlRG93bicsXG5cdFx0XHRlYXNpbmcgPSAnZWFzZScsXG5cdFx0XHRhbmltRHVyYXRpb24gPSA4MDA7XG5cblx0XHRyZXR1cm4gW2FuaW1hdGlvblZpc2libGUsIGFuaW1hdGlvblRvcCwgYW5pbWF0aW9uQm90dG9tLCBhbmltRHVyYXRpb24sIGVhc2luZ107XG5cdH1cbi8vfSk7XG5cbiQuVmVsb2NpdHlcbiAgICAuUmVnaXN0ZXJFZmZlY3QoXCJ0cmFuc2xhdGVVcFwiLCB7XG4gICAgXHRkZWZhdWx0RHVyYXRpb246IDEsXG4gICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogJy0xMDAlJ30sIDFdXG4gICAgICAgIF1cbiAgICB9KTtcbiQuVmVsb2NpdHlcbiAgICAuUmVnaXN0ZXJFZmZlY3QoXCJ0cmFuc2xhdGVEb3duXCIsIHtcbiAgICBcdGRlZmF1bHREdXJhdGlvbjogMSxcbiAgICAgICAgY2FsbHM6IFtcbiAgICAgICAgICAgIFsgeyB0cmFuc2xhdGVZOiAnMTAwJSd9LCAxXVxuICAgICAgICBdXG4gICAgfSk7XG4kLlZlbG9jaXR5XG4gICAgLlJlZ2lzdGVyRWZmZWN0KFwidHJhbnNsYXRlTm9uZVwiLCB7XG4gICAgXHRkZWZhdWx0RHVyYXRpb246IDEsXG4gICAgICAgIGNhbGxzOiBbXG4gICAgICAgICAgICBbIHsgdHJhbnNsYXRlWTogJzAnLCBvcGFjaXR5OiAnMScsIHNjYWxlOiAnMScsIHJvdGF0ZVg6ICcwJywgYm94U2hhZG93Qmx1cjogJzAnfSwgMV1cbiAgICAgICAgXVxuICAgIH0pO1xuIiwiLy8oZnVuY3Rpb24oKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIC8vICdUbyBhY3R1YWxseSBiZSBhYmxlIHRvIGRpc3BsYXkgYW55dGhpbmcgd2l0aCBUaHJlZS5qcywgd2UgbmVlZCB0aHJlZSB0aGluZ3M6XG4gICAgLy8gQSBzY2VuZSwgYSBjYW1lcmEsIGFuZCBhIHJlbmRlcmVyIHNvIHdlIGNhbiByZW5kZXIgdGhlIHNjZW5lIHdpdGggdGhlIGNhbWVyYS4nXG4gICAgLy8gLSBodHRwOi8vdGhyZWVqcy5vcmcvZG9jcy8jTWFudWFsL0ludHJvZHVjdGlvbi9DcmVhdGluZ19hX3NjZW5lXG5cbiAgICB2YXIgc2NlbmUsIGNhbWVyYSwgcmVuZGVyZXI7XG5cbiAgICAvLyBJIGd1ZXNzIHdlIG5lZWQgdGhpcyBzdHVmZiB0b29cbiAgICB2YXIgY29udGFpbmVyLFxuICAgICAgICBzcGFjZVdyYXBwZXIsXG4gICAgICAgIEhFSUdIVCxcbiAgICAgICAgV0lEVEgsXG4gICAgICAgIGZpZWxkT2ZWaWV3LFxuICAgICAgICBhc3BlY3RSYXRpbyxcbiAgICAgICAgbmVhclBsYW5lLFxuICAgICAgICBmYXJQbGFuZSxcbiAgICAgICAgZ2VvbWV0cnksXG4gICAgICAgIHBhcnRpY2xlQ291bnQsXG4gICAgICAgIGksXG4gICAgICAgIGgsXG4gICAgICAgIGNvbG9yLFxuICAgICAgICBzaXplLFxuICAgICAgICBtYXRlcmlhbHMgPSBbXSxcbiAgICAgICAgbW91c2VYID0gMCxcbiAgICAgICAgbW91c2VZID0gMCxcbiAgICAgICAgd2luZG93SGFsZlgsXG4gICAgICAgIHdpbmRvd0hhbGZZLFxuICAgICAgICBjYW1lcmFaLFxuICAgICAgICBmb2dIZXgsXG4gICAgICAgIGZvZ0RlbnNpdHksXG4gICAgICAgIHBhcmFtZXRlcnMgPSB7fSxcbiAgICAgICAgcGFyYW1ldGVyQ291bnQsXG4gICAgICAgIHBhcnRpY2xlcztcblxuICAgICAgICBzcGFjZVdyYXBwZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuanMtc3BhY2Utd3JhcHBlcicpO1xuXG4gICAgLy9zcGFjZUluaXQoKTtcbi8qICAgIGFuaW1hdGUoKTsqL1xuXG4gICAgZnVuY3Rpb24gc3BhY2VJbml0KCkge1xuXG4gICAgICAgIEhFSUdIVCA9IHdpbmRvdy5pbm5lckhlaWdodDtcbiAgICAgICAgV0lEVEggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICAgICAgd2luZG93SGFsZlggPSBXSURUSCAvIDI7XG4gICAgICAgIHdpbmRvd0hhbGZZID0gSEVJR0hUIC8gMjtcblxuICAgICAgICBmaWVsZE9mVmlldyA9IDc1O1xuICAgICAgICBhc3BlY3RSYXRpbyA9IFdJRFRIIC8gSEVJR0hUO1xuICAgICAgICBuZWFyUGxhbmUgPSAxO1xuICAgICAgICBmYXJQbGFuZSA9IDEwMDAwO1xuXG4gICAgICAgIC8qIFx0ZmllbGRPZlZpZXcg4oCUIENhbWVyYSBmcnVzdHVtIHZlcnRpY2FsIGZpZWxkIG9mIHZpZXcuXG5cdCAgICAgICBhc3BlY3RSYXRpbyDigJQgQ2FtZXJhIGZydXN0dW0gYXNwZWN0IHJhdGlvLlxuXHQgICAgICAgICAgbmVhclBsYW5lIOKAlCBDYW1lcmEgZnJ1c3R1bSBuZWFyIHBsYW5lLlxuXHQgICAgICAgICAgICAgZmFyUGxhbmUg4oCUIENhbWVyYSBmcnVzdHVtIGZhciBwbGFuZS5cblxuXHQtIGh0dHA6Ly90aHJlZWpzLm9yZy9kb2NzLyNSZWZlcmVuY2UvQ2FtZXJhcy9QZXJzcGVjdGl2ZUNhbWVyYVxuXG5cdEluIGdlb21ldHJ5LCBhIGZydXN0dW0gKHBsdXJhbDogZnJ1c3RhIG9yIGZydXN0dW1zKVxuXHRpcyB0aGUgcG9ydGlvbiBvZiBhIHNvbGlkIChub3JtYWxseSBhIGNvbmUgb3IgcHlyYW1pZClcblx0dGhhdCBsaWVzIGJldHdlZW4gdHdvIHBhcmFsbGVsIHBsYW5lcyBjdXR0aW5nIGl0LiAtIHdpa2lwZWRpYS5cdFx0Ki9cblxuICAgICAgICBjYW1lcmFaID0gMTI1MDsgLypcdFNvLCAxNTAwPyBZZXMhIG1vdmUgb24hXHQqL1xuICAgICAgICBmb2dIZXggPSAweDAwMDAwMDsgLyogQXMgYmxhY2sgYXMgeW91ciBoZWFydC5cdCovXG4gICAgICAgIGZvZ0RlbnNpdHkgPSAwLjAwMTsgLyogU28gbm90IHRlcnJpYmx5IGRlbnNlPyBOTyBGT0cgSU4gU1BBQ0VcdCovXG5cbiAgICAgICAgY2FtZXJhID0gbmV3IFRIUkVFLlBlcnNwZWN0aXZlQ2FtZXJhKGZpZWxkT2ZWaWV3LCBhc3BlY3RSYXRpbywgbmVhclBsYW5lLCBmYXJQbGFuZSk7XG4gICAgICAgIGNhbWVyYS5wb3NpdGlvbi56ID0gY2FtZXJhWjtcblxuICAgICAgICBzY2VuZSA9IG5ldyBUSFJFRS5TY2VuZSgpO1xuICAgICAgICBzY2VuZS5mb2cgPSBuZXcgVEhSRUUuRm9nRXhwMihmb2dIZXgsIGZvZ0RlbnNpdHkpO1xuXG4gICAgICAgIGNvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zcGFhYWNlJyk7XG5cbiAgICAgICAgZ2VvbWV0cnkgPSBuZXcgVEhSRUUuR2VvbWV0cnkoKTsgLypcdE5PIE9ORSBTQUlEIEFOWVRISU5HIEFCT1VUIE1BVEghIFVHSCFcdCovXG5cbiAgICAgICAgcGFydGljbGVDb3VudCA9IDkwMDAwOyAvKiBMZWFndWVzIHVuZGVyIHRoZSBzZWEgKi9cblxuICAgICAgICAvKlxuICAgICAgICBIb3BlIHlvdSB0b29rIHlvdXIgbW90aW9uIHNpY2tuZXNzIHBpbGxzO1xuXHQgICAgV2UncmUgYWJvdXQgdG8gZ2V0IGxvb3B5LlxuICAgICAgICBnZW5lcmF0ZSBjb29yZGluYXRlcyBmb3Igb3VyIHBhcnRpY2xlc1xuICAgICAgICAgKi9cblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcGFydGljbGVDb3VudDsgaSsrKSB7XG5cbiAgICAgICAgICAgIHZhciB2ZXJ0ZXggPSBuZXcgVEhSRUUuVmVjdG9yMygpO1xuICAgICAgICAgICAgLyp2ZXJ0ZXgueCA9IE1hdGgucmFuZG9tKCkgKiAyMDAwIC0gMTAwMDtcbiAgICAgICAgICAgIHZlcnRleC55ID0gTWF0aC5yYW5kb20oKSAqIDIwMDAgLSAxMDAwO1xuICAgICAgICAgICAgdmVydGV4LnogPSBNYXRoLnJhbmRvbSgpICogMjAwMCAtIDEwMDA7ICovXG5cbiAgICAgICAgICAgIHZlcnRleC54ID0gTWF0aC5yYW5kb20oKSAqIDIwMDAgLSAxMDAwO1xuICAgICAgICAgICAgdmVydGV4LnkgPSBNYXRoLnJhbmRvbSgpICogMjAwMCAtIDEwMDA7XG4gICAgICAgICAgICB2ZXJ0ZXgueiA9IE1hdGgucmFuZG9tKCkgKiAxMDAwMCAtIDEwMDA7XG5cbiAgICAgICAgICAgIGdlb21ldHJ5LnZlcnRpY2VzLnB1c2godmVydGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qXHRXZSBjYW4ndCBzdG9wIGhlcmUsIHRoaXMgaXMgYmF0IGNvdW50cnkhXHQqL1xuXG4gICAgICAgIC8vZ2VuZXJhdGUgcGFydGljbGUgc2l6ZSBhbmQgb3BhY2l0eSBmb3IgNSBkaWZmZXJlbmNlIHBvaW50IGNsb3Vkc1xuICAgICAgICBwYXJhbWV0ZXJzID0gW1xuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFsxLCAxLCAxXSwgMlxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBbMC45NSwgMSwgMV0sIDJcbiAgICAgICAgICAgIF0sXG5cbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBbMC45NSwgMSwgMV0sIDFcbiAgICAgICAgICAgIF0sXG5cbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBbMC45LCAxLCAwLjldLCAxXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgIFswLjgsIDEsIDAuOF0sIDFcbiAgICAgICAgICAgIF1cbiAgICAgICAgXTtcblxuICAgICAgICBwYXJhbWV0ZXJDb3VudCA9IHBhcmFtZXRlcnMubGVuZ3RoO1xuXG4gICAgICAgIC8qXHRJIHRvbGQgeW91IHRvIHRha2UgdGhvc2UgbW90aW9uIHNpY2tuZXNzIHBpbGxzLlxuXHQgICAgICAgQ2xlYW4gdGhhdCB2b21taXQgdXAsIHdlJ3JlIGdvaW5nIGFnYWluIVx0Ki9cbiAgICAgICAgLy9sb29wIG92ZXIgdGhlIG9hcmFtZXRlcnMgdG8gcmVuZGVkIHRoZSA1IGRpZmZlcmVudCBjbG91ZHMgYW5kIGFwcGx5IGEgcmFuZG9tIHJvdGF0aW9uIHRvIGVhY2ggb25lXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBwYXJhbWV0ZXJDb3VudDsgaSsrKSB7XG5cbiAgICAgICAgICAgIGNvbG9yID0gcGFyYW1ldGVyc1tpXVswXTtcbiAgICAgICAgICAgIHNpemUgPSBwYXJhbWV0ZXJzW2ldWzFdO1xuXG4gICAgICAgICAgICBtYXRlcmlhbHNbaV0gPSBuZXcgVEhSRUUuUG9pbnRzTWF0ZXJpYWwoe1xuICAgICAgICAgICAgICAgIHNpemU6IHNpemUsXG4gICAgICAgICAgICAgICAgbWFwOiBUSFJFRS5JbWFnZVV0aWxzLmxvYWRUZXh0dXJlKFxuICAgICAgICAgICAgICAgICAgXCJhc3NldHMvaW1nL3BhcnRpY2xlMi5wbmdcIlxuICAgICAgICAgICAgICAgICksXG4gICAgICAgICAgICAgICAgYmxlbmRpbmc6IFRIUkVFLkFkZGl0aXZlQmxlbmRpbmcsXG4gICAgICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IHRydWVcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvL2VhY2ggY2xvdWQgdGFrZXMgdGhlIGdlb21ldHJ5IHBvaW50cyBnZW5lcmF0ZWQgZWFybGllciBhbmQgdGhlIHNpemUgZnJvbSB0aGUgYXJyYXkgd2UncmUgbG9vcGluZyBvdmVyXG4gICAgICAgICAgICBwYXJ0aWNsZXMgPSBuZXcgVEhSRUUuUG9pbnRzKGdlb21ldHJ5LCBtYXRlcmlhbHNbaV0pO1xuXG4gICAgICAgICAgICBwYXJ0aWNsZXMuc29ydFBhcnRpY2xlcyA9IHRydWU7XG5cbiAgICAgICAgICAgIC8vcmFuZG9tbHkgcm90YXRlIGVhY2ggY2xvdWQgc28gdGhlIHBvaW50cyBhcmVuJ3QgYWxsIG9uIHRvcCBvZiBlYWNoIG90aGVyXG4gICAgICAgICAgICBwYXJ0aWNsZXMucm90YXRpb24ueCA9IE1hdGgucmFuZG9tKCkgKiA2O1xuICAgICAgICAgICAgcGFydGljbGVzLnJvdGF0aW9uLnkgPSBNYXRoLnJhbmRvbSgpICogNjtcbiAgICAgICAgICAgIHBhcnRpY2xlcy5yb3RhdGlvbi56ID0gTWF0aC5yYW5kb20oKSAqIDY7XG5cbiAgICAgICAgICAgIHNjZW5lLmFkZChwYXJ0aWNsZXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLypcdElmIG15IGNhbGN1bGF0aW9ucyBhcmUgY29ycmVjdCwgd2hlbiB0aGlzIGJhYnkgaGl0cyA4OCBtaWxlcyBwZXIgaG91ci4uLlxuXHR5b3UncmUgZ29ubmEgc2VlIHNvbWUgc2VyaW91cyBzaGl0Llx0Ki9cblxuICAgICAgICByZW5kZXJlciA9IG5ldyBUSFJFRS5XZWJHTFJlbmRlcmVyKCB7IGFscGhhOiB0cnVlIH0pOyAvKlx0UmVuZGVyZXJlcmVyZXJzIHBhcnRpY2xlcy4gQWxwaGEgYWxsb3dzIGZvciBhIHRyYW5zcGFyZW50IGJnXHQqL1xuICAgICAgICByZW5kZXJlci5zZXRQaXhlbFJhdGlvKHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTsgLypcdFByb2JhYmx5IDE7IHVubGVzcyB5b3UncmUgZmFuY3kuXHQqL1xuICAgICAgICByZW5kZXJlci5zZXRTaXplKFdJRFRILCBIRUlHSFQpOyAvKlx0RnVsbCBzY3JlZW4gYmFieSBXb29vb28hXHQqL1xuXG4gICAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChyZW5kZXJlci5kb21FbGVtZW50KTsgLyogTGV0J3MgYWRkIGFsbCB0aGlzIGNyYXp5IGp1bmsgdG8gdGhlIHBhZ2UuXHQqL1xuXG4gICAgICAgIC8qXHRJIGRvbid0IGtub3cgYWJvdXQgeW91LCBidXQgSSBsaWtlIHRvIGtub3cgaG93IGJhZCBteVxuXHRcdGNvZGUgaXMgd3JlY2tpbmcgdGhlIHBlcmZvcm1hbmNlIG9mIGEgdXNlcidzIG1hY2hpbmUuXG5cdFx0TGV0J3Mgc2VlIHNvbWUgZGFtbiBzdGF0cyFcdCovXG5cbiAgICAgICAgLyogRXZlbnQgTGlzdGVuZXJzICovXG5cbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIG9uV2luZG93UmVzaXplLCBmYWxzZSk7XG4gICAgICAgIC8veXVwLCBtb3VzZW1vdmUgZnVuY3Rpb25cbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgb25Eb2N1bWVudE1vdXNlTW92ZSwgZmFsc2UpO1xuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Eb2N1bWVudFRvdWNoU3RhcnQsIGZhbHNlKTtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Eb2N1bWVudFRvdWNoTW92ZSwgZmFsc2UpO1xuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gYW5pbWF0ZSgpIHtcblxuICAgICAgICB2YXIgc2NlbmVWaXNpYmxlID0gY2hlY2tWaXNpYmxlKCk7XG4gICAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShhbmltYXRlKTtcblxuICAgICAgICBpZihzY2VuZVZpc2libGUpe1xuICAgICAgICAgICAgcmVuZGVyKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBjaGVja1Zpc2libGUoKSB7XG5cbiAgICAgICAgdmFyIGVsZW1lbnRWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgaWYoc3BhY2VXcmFwcGVyLmNsYXNzTGlzdC5jb250YWlucygndmlzaWJsZScpKXtcbiAgICAgICAgICAgIGVsZW1lbnRWaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnRWaXNpYmxlID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZihlbGVtZW50VmlzaWJsZSl7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyKCkge1xuICAgICAgICB2YXIgdGltZSA9IERhdGUubm93KCkgKiAwLjAwMDA1O1xuXG4gICAgICAgIC8vc2V0IGNhbWVyYSBmYWNpbmcgYmFzZWQgb24gbW91c2UgcG9zaXRpb25cbiAgICAgICAgLy8gbW91c2VYICYgbW91c2VZIHJldHJlaXZlZCB1c2luZyB0aGUgZnVuY3Rpb24gY2FsbGVkIG9uIG1vdXNlbW92ZVxuICAgICAgICAvLyB0aGUgbXVsdGlwbGljYXRpb24gYnkgMC4wNSBnaXZlcyBpdCB0aGUgZmVlbGluZyBvZiBhY2NlbGVyYXRpb24gYXMgaXQgbW92ZXMgdGhlIGNhbWVyYSBpbmNyZW1lbnRhbGxseSBtb3JlIHRoYW4gdGhlIG1vdXNlXG4gICAgICAgIGNhbWVyYS5wb3NpdGlvbi54ICs9IChtb3VzZVgvMjUgLSBjYW1lcmEucG9zaXRpb24ueCkgKiAwLjAyNTtcbiAgICAgICAgY2FtZXJhLnBvc2l0aW9uLnkgKz0gKC1tb3VzZVkvMjUgLSBjYW1lcmEucG9zaXRpb24ueSkgKiAwLjAyNTtcbiAgICAgICAgLy9jYW1lcmEucG9zaXRpb24ueiArPSAoLW1vdXNlWC8xMCAtIGNhbWVyYS5wb3NpdGlvbi54KSAqIDAuMDI1O1xuICAgICAgICAvL2NhbWVyYS5wb3NpdGlvbi56ICs9IChtb3VzZVkvMTAgLSBjYW1lcmEucG9zaXRpb24ueSkgKiAwLjAyNTtcblxuICAgICAgICBjYW1lcmEucG9zaXRpb24ueiAtPSAyLjY7XG4gICAgICAgIC8vY2FtZXJhLnBvc2l0aW9uLnogKz0gMTtcblxuXG5cbiAgICAgICAgY2FtZXJhLmxvb2tBdChzY2VuZS5wb3NpdGlvbik7XG5cbiAgICAgICAgLy9pZGtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHNjZW5lLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIHZhciBvYmplY3QgPSBzY2VuZS5jaGlsZHJlbltpXTtcblxuICAgICAgICAgICAgaWYgKG9iamVjdCBpbnN0YW5jZW9mIFRIUkVFLlBvaW50Q2xvdWQpIHtcblxuICAgICAgICAgICAgICAgIC8vd3RmIGhhbHAgcGx6XG4gICAgICAgICAgICAgICAgb2JqZWN0LnJvdGF0aW9uLnkgPSB0aW1lICogKGkgPCA0ID8gaSArIDEgOiAtKGkgKyAxKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvL2FwcGxpZXMgZGlmZmVyZXQgY29sb3VyaW5nIG92ZXIgdGltZVxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbWF0ZXJpYWxzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgICAgIGNvbG9yID0gcGFyYW1ldGVyc1tpXVswXTtcblxuICAgICAgICAgICAgaCA9ICgzNjAgKiAoY29sb3JbMF0gKyB0aW1lKSAlIDM2MCkgLyAzNjA7XG4gICAgICAgICAgICBtYXRlcmlhbHNbaV0uY29sb3Iuc2V0SFNMKGgsIGNvbG9yWzFdLCBjb2xvclsyXSk7XG4gICAgICAgIH1cblxuXG4gICAgICAgIHJlbmRlcmVyLnJlbmRlcihzY2VuZSwgY2FtZXJhKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBvbkRvY3VtZW50TW91c2VNb3ZlKGUpIHtcbiAgICAgICAgbW91c2VYID0gZS5jbGllbnRYIC0gd2luZG93SGFsZlg7XG4gICAgICAgIG1vdXNlWSA9IGUuY2xpZW50WSAtIHdpbmRvd0hhbGZZO1xuICAgICAgICAvL21vdXNlWCA9IGUuY2xpZW50WDtcbiAgICAgICAgLy9tb3VzZVkgPSBlLmNsaWVudFk7XG4gICAgfVxuXG4gICAgLypcdE1vYmlsZSB1c2Vycz8gIEkgZ290IHlvdXIgYmFjayBob21leVx0Ki9cblxuICAgIGZ1bmN0aW9uIG9uRG9jdW1lbnRUb3VjaFN0YXJ0KGUpIHtcblxuICAgICAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCA9PT0gMSkge1xuXG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBtb3VzZVggPSBlLnRvdWNoZXNbMF0ucGFnZVggLSB3aW5kb3dIYWxmWDtcbiAgICAgICAgICAgIG1vdXNlWSA9IGUudG91Y2hlc1swXS5wYWdlWSAtIHdpbmRvd0hhbGZZO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gb25Eb2N1bWVudFRvdWNoTW92ZShlKSB7XG5cbiAgICAgICAgaWYgKGUudG91Y2hlcy5sZW5ndGggPT09IDEpIHtcblxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgbW91c2VYID0gZS50b3VjaGVzWzBdLnBhZ2VYIC0gd2luZG93SGFsZlg7XG4gICAgICAgICAgICBtb3VzZVkgPSBlLnRvdWNoZXNbMF0ucGFnZVkgLSB3aW5kb3dIYWxmWTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIG9uV2luZG93UmVzaXplKCkge1xuXG4gICAgICAgIHdpbmRvd0hhbGZYID0gd2luZG93LmlubmVyV2lkdGggLyAyO1xuICAgICAgICB3aW5kb3dIYWxmWSA9IHdpbmRvdy5pbm5lckhlaWdodCAvIDI7XG5cbiAgICAgICAgY2FtZXJhLmFzcGVjdCA9IHdpbmRvdy5pbm5lcldpZHRoIC8gd2luZG93LmlubmVySGVpZ2h0O1xuICAgICAgICBjYW1lcmEudXBkYXRlUHJvamVjdGlvbk1hdHJpeCgpO1xuICAgICAgICByZW5kZXJlci5zZXRTaXplKHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIH1cbi8vfSkoKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgICBpbml0U2Nyb2xsamFjayhNUSwgdHJ1ZSk7XG4gICAgc3BhY2VJbml0KCk7XG4gICAgYW5pbWF0ZShzcGFjZVdyYXBwZXIpO1xufSkoKTtcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcbiAgICAvLyBpbml0IGpxdWVyeSBzbW9vdGhzY3JvbGwgYW5kIHNsaWRlclxuICAkKCcucG9ydGZvbGlvX19zbGlkZXItanMnKS5zbGljayh7XG4gICAgICBzcGVlZDoxMDAwLFxuICAgICAgcHJldkFycm93OicucG9ydGZvbGlvLW5hdl9fbGluay0tbGVmdCcsXG4gICAgICBuZXh0QXJyb3c6Jy5wb3J0Zm9saW8tbmF2X19saW5rLS1yaWdodCdcbiAgfSk7XG5cbiAgJCgnYVtocmVmKj1cIiNcIl0nKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgLy8gcHJldmVudCBkZWZhdWx0IGFjdGlvbiBhbmQgYnViYmxpbmdcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAvLyBzZXQgdGFyZ2V0IHRvIGFuY2hvcidzIFwiaHJlZlwiIGF0dHJpYnV0ZVxuICAgICAgdmFyIHRhcmdldCA9ICQodGhpcykuYXR0cignaHJlZicpO1xuICAgICAgLy8gc2Nyb2xsIHRvIGVhY2ggdGFyZ2V0XG4gICAgICAkKHRhcmdldCkudmVsb2NpdHkoJ3Njcm9sbCcsIHtcbiAgICAgICAgICBkdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICBlYXNpbmc6ICdlYXNlLWluLW91dCdcbiAgICAgIH0pO1xuICB9KTtcblxufSk7XG5cbihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXIgcG9ydGZvbGlvQ29udGFpbmVyLFxuICAgIGFib3V0Q29udGFpbmVyLFxuICAgIGNvbnRhY3RDb250YWluZXIsXG4gICAgSEVJR0hULFxuICAgIFdJRFRIO1xuXG4gICAgaW5pdCgpO1xuXG4gICAgZnVuY3Rpb24gaW5pdCgpe1xuICAgICAgICBIRUlHSFQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgICAgIFdJRFRIID0gd2luZG93LmlubmVyV2lkdGg7XG5cbiAgICAgICAgcG9ydGZvbGlvQ29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnBvcnRmb2xpby1qcycpO1xuICAgICAgICBhYm91dENvbnRhaW5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5hYm91dC1qcycpO1xuICAgICAgICBjb250YWN0Q29udGFpbmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmNvbnRhY3QtanMnKTtcblxuICAgICAgICBwb3J0Zm9saW9Db250YWluZXIuc3R5bGUuaGVpZ2h0ID0gSEVJR0hUO1xuICAgICAgICBhYm91dENvbnRhaW5lci5zdHlsZS5oZWlnaHQgPSBIRUlHSFQ7XG4gICAgICAgIGNvbnRhY3RDb250YWluZXIuc3R5bGUuaGVpZ2h0ID0gSEVJR0hUO1xuXG4gICAgfVxuXG59KSgpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
