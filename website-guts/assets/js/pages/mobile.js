function smoothScroll(e) {
  var scrlId = $(this).attr('href'),
    targetElmPos = $(scrlId).offset().top;

  e.preventDefault();

  $('html,body').animate({
    scrollTop: targetElmPos
  }, 1000);

}

/*
* GIF Animation
*
*/
var imgArr = [
  '//d1qmdf3vop2l07.cloudfront.net/optimizely-marketer-assets.cloudvent.net/raw/mobile-mvpp/editor-gifs/dynamic/visual-editor-1.gif',
 '//d1qmdf3vop2l07.cloudfront.net/optimizely-marketer-assets.cloudvent.net/raw/mobile-mvpp/editor-gifs/dynamic/developer-tools-2.gif',
 '//d1qmdf3vop2l07.cloudfront.net/optimizely-marketer-assets.cloudvent.net/raw/mobile-mvpp/editor-gifs/dynamic/instant-rollout-3.gif',
 '//d1qmdf3vop2l07.cloudfront.net/optimizely-marketer-assets.cloudvent.net/raw/mobile-mvpp/editor-gifs/dynamic/multi-exp-4.gif',
 '//d1qmdf3vop2l07.cloudfront.net/optimizely-marketer-assets.cloudvent.net/raw/mobile-mvpp/editor-gifs/dynamic/mobile-metrics-5.gif',
 '//d1qmdf3vop2l07.cloudfront.net/optimizely-marketer-assets.cloudvent.net/raw/mobile-mvpp/use-case/dynamic/feature.gif',
 '//d1qmdf3vop2l07.cloudfront.net/optimizely-marketer-assets.cloudvent.net/raw/mobile-mvpp/use-case/dynamic/input.gif',
 '//d1qmdf3vop2l07.cloudfront.net/optimizely-marketer-assets.cloudvent.net/raw/mobile-mvpp/use-case/dynamic/onboard.gif',
 '//d1qmdf3vop2l07.cloudfront.net/optimizely-marketer-assets.cloudvent.net/raw/mobile-mvpp/use-case/dynamic/permission.gif',
 '//d1qmdf3vop2l07.cloudfront.net/optimizely-marketer-assets.cloudvent.net/raw/mobile-mvpp/use-case/dynamic/re-engage-2.gif',
 '//d1qmdf3vop2l07.cloudfront.net/optimizely-marketer-assets.cloudvent.net/raw/mobile-mvpp/use-case/dynamic/rollout-2.gif'
];

//preload GIF's
for(var i = 0; i < imgArr.length; i+=1) {
  var img = new Image();
  img.src= imgArr[i];
}

//keep track of what GIF is currently playing
var lastPlayed = {};
function toggleSrc(tracker, overRide) {
  if(lastPlayed.index !== tracker.index || ( overRide && !tracker.playing )) {
    if(lastPlayed.elm) {
      lastPlayed.elm.src = lastPlayed.static;
      lastPlayed.playing = false;
    }

    //inject the moving GIF
    if(!tracker.playing) {
      tracker.elm.src = tracker.dynamic;
      tracker.playing = true;
      setTimeout(function() {
        tracker.playing = false;
      }, 4000);

      lastPlayed = tracker;
    }
  }
}

function initiateScrollListener(imgCache) {
  var lastWindowPos = 0;
  $(window).on('scroll', function() {
    var visiblePanels = [];
    var windowBottom = $(window).scrollTop() + window.innerHeight;
    var scrollingDown = windowBottom > lastWindowPos;
    var windowMiddle = $(window).scrollTop() + ( window.innerHeight / 2 );

    if(scrollingDown) {
      $.each(imgCache, function(i, tracker) {
        var trackerTop = $(tracker.elm).offset().top;
        var trackerBottom = trackerTop + $(tracker.elm).outerHeight();
        var trackerMiddle = trackerTop + ( Math.abs(trackerTop - trackerBottom) / 2 );

        if(windowBottom >= trackerTop && scrollingDown) {
          visiblePanels.push(Math.abs(windowMiddle - trackerMiddle));
        }

      });
    }

    if(visiblePanels.length > 0) {
      var closestToMiddle = imgCache[ visiblePanels.indexOf( Math.min.apply(Math, visiblePanels) ) ];
      toggleSrc(closestToMiddle);
    }
    lastWindowPos = windowBottom;
  });
}

/*
* Video Player
*
*/
var player;
var tag = document.createElement('script');

tag.src = 'https://www.youtube.com/iframe_api';
var scriptTags = document.getElementsByTagName('script');
var lastScriptTag = scriptTags[scriptTags.length - 1];
lastScriptTag.parentNode.insertBefore(tag, lastScriptTag.nextSibling);

window.onYouTubeIframeAPIReady = function () {
  player = new window.YT.Player('player', {
    height: '390',
    width: '640',
    videoId: 'pjnHonrJykg'
  });
};


$(function() {
   var videoPlayed = false,
    playerSupported = false;

  //video player open and autoplay
  $('[data-show-video]').on('click', function(e) {
    e.preventDefault();
    window.optly.mrkt.modal.open({modalType: 'video-modal'});
    if(typeof player === 'object' && typeof player.getPlayerState === 'function') {
      playerSupported = true;
      //deal with the lack of autoplay upon inital open for mobile
      if(!window.optly.mrkt.isMobile() || videoPlayed) {
        var playerInt = window.setInterval(function() {
          if(player.getPlayerState() !== 1) {
            player.playVideo();
          } else {
            window.clearInterval(playerInt);
          }
        }, 10);
      }
    } else {
      if(!videoPlayed) {
        $('#player').css({display: 'none'});
        $('.fallback-player').addClass('show-fallback');
      }
      $('.fallback-player').attr('src', 'https://www.youtube.com/embed/pjnHonrJykg?autoplay=1');
    }
    if(!videoPlayed) {
      videoPlayed = true;
    }
  });

  $('[data-optly-modal="video-modal"]').on('click', function(e) {
    e.preventDefault();
    if(playerSupported) {
      player.stopVideo();
    } else {
      $('.fallback-player').attr('src', '');
    }
  });

  //listen for smooth scrolling
  $('[smooth-scroll]').on('click', smoothScroll);

  //deal with placeholder icons
  window.optly.mrkt.anim.placeholderIcons({inputs: $('.panel input')});

  //inject GIF src when they are scrolled into
  var imgCache = [];
  var $images = $('[data-interactive-panel] img');

  $.each($images, function(i, elm) {
    var elmCache = {};
    var dataSet = $(elm).data();
    elmCache.elm = elm;
    elmCache.index = dataSet.imgIndex;
    elmCache.playing = false;
    elmCache.static = dataSet.static;
    elmCache.dynamic = dataSet.dynamic;
    imgCache.push(elmCache);
  });

  initiateScrollListener(imgCache);

  $images.on('click mouseover', function() {
    var imgIndex = $(this).data('imgIndex');
    toggleSrc(imgCache[imgIndex], true);
  });

  //custom validation error reporting handler
  var validationErrorCustom = function(element){
    var elementName = element.getAttribute('name');
    var elementValue = $(element).val();
    var elementHasValue = elementValue ? 'has value' : 'no value';
    w.analytics.track('mobile-signup-form ' + elementName + ' error submit', {
      category: 'form error',
      label: elementHasValue,
      value: elementValue.length
    });
  };

   //Oform for signup top
  var signupMobileMvppTopHelperInst = window.optly.mrkt.form.mobileMvpp({formId: 'mobile-signup-form-top'});

  var signupFormTop = new Oform({
    selector: '#mobile-signup-form-top',
    customValidation: {
      password1: function(elm) {
        return signupMobileMvppTopHelperInst.passwordValidate(elm);
      }
    },
    middleware: w.optly.mrkt.Oform.defaultMiddleware
  });

  signupFormTop.on('before', function() {
    signupMobileMvppTopHelperInst.formElm.querySelector('input[name="hidden"]').value = 'touched';
    signupMobileMvppTopHelperInst.processingAdd();
    signupMobileMvppTopHelperInst.removeErrors();
    signupMobileMvppTopHelperInst.optionsErrorElm.innerHTML = signupMobileMvppTopHelperInst.errorMessages.DEFAULT;
    w.analytics.track('/mobile/submit', {
      category: 'account',
      label: w.optly.mrkt.utils.trimTrailingSlash(w.location.pathname)
    }, {
      integrations: {
        'Marketo': false
      }
    });
    return true;
  });

  signupFormTop.on('validationerror', function(elm){
    validationErrorCustom(elm);
    w.optly.mrkt.Oform.validationError(elm);
    signupMobileMvppTopHelperInst.showOptionsError();
  });

  signupFormTop.on('error', function() {
    signupMobileMvppTopHelperInst.processingRemove({callee: 'error'});
    signupMobileMvppTopHelperInst.showOptionsError({error: 'UNEXPECTED'});
    signupMobileMvppTopHelperInst.showErrorDialog({error: 'DIALOG_ACCOUNT'});
    window.analytics.track('create account xhr error', {
      category: 'account',
      label: w.location.pathname
    }, {
      integrations: {
        Marketo: false
      }
    });
  }.bind(signupMobileMvppTopHelperInst));

  signupFormTop.on('load', signupMobileMvppTopHelperInst.success.bind(signupMobileMvppTopHelperInst));

  signupFormTop.on('done', function() {
    if(document.body.classList.contains('oform-error')) {
      signupMobileMvppTopHelperInst.processingRemove({callee: 'done'});
    }
  }.bind(signupMobileMvppTopHelperInst));

  //Oform for signup bottom
  var signupMobileMvppBottomHelperInst = window.optly.mrkt.form.mobileMvpp({formId: 'mobile-signup-form-bottom'});

  var signupFormBottom = new Oform({
    selector: '#mobile-signup-form-bottom',
    customValidation: {
      password1: function(elm) {
        return signupMobileMvppBottomHelperInst.passwordValidate(elm);
      }
    },
    middleware: w.optly.mrkt.Oform.defaultMiddleware
  });

  signupFormBottom.on('before', function() {
    signupMobileMvppBottomHelperInst.formElm.querySelector('input[name="hidden"]').value = 'touched';
    signupMobileMvppBottomHelperInst.processingAdd();
    signupMobileMvppBottomHelperInst.removeErrors();
    signupMobileMvppBottomHelperInst.optionsErrorElm.innerHTML = signupMobileMvppBottomHelperInst.errorMessages.DEFAULT;
    w.analytics.track('/mobile/submit', {
      category: 'account',
      label: w.optly.mrkt.utils.trimTrailingSlash(w.location.pathname)
    }, {
      integrations: {
        'Marketo': false
      }
    });
    return true;
  });

  signupFormBottom.on('validationerror', function(elm) {
    validationErrorCustom(elm);
    w.optly.mrkt.Oform.validationError(elm);
    signupMobileMvppBottomHelperInst.showOptionsError();
  });

  signupFormBottom.on('error', function() {
    signupMobileMvppBottomHelperInst.processingRemove({callee: 'error'});
    signupMobileMvppBottomHelperInst.showOptionsError({error: 'DEFAULT'});
    signupMobileMvppBottomHelperInst.showErrorDialog({error: 'DIALOG_ACCOUNT'});
    window.analytics.track('create account xhr error', {
      category: 'account',
      label: w.location.pathname
    }, {
      integrations: {
        Marketo: false
      }
    });
  }.bind(signupMobileMvppBottomHelperInst));

  signupFormBottom.on('load', signupMobileMvppBottomHelperInst.success.bind(signupMobileMvppBottomHelperInst));

  signupFormBottom.on('done', function() {
    if(document.body.classList.contains('oform-error')) {
      signupMobileMvppBottomHelperInst.processingRemove({callee: 'done'});
    }
  }.bind(signupMobileMvppBottomHelperInst));


});

//track focus on form fields
$('#mobile-signup-form-bottom input:not([type="hidden"]), #mobile-signup-form-top input:not([type="hidden"])').each(function(){
  $(this).one('focus', function(){
    //put all the information in the event because we'll want to use this as a goal in optimizely
    //send a general focus event to track focus for either the top or bottom form
    w.analytics.track('mobile-signup-form ' + $(this).attr('name') + ' focus',
    {
      category: 'forms'
    },
    {
      integrations: {
        'Marketo': false
      }
    });
    //send a specific focus event to track focus on either the top or bottom form
    w.analytics.track($(this).closest('form').attr('id') + ' ' + $(this).attr('name') + ' focus',
    {
      category: 'forms'
    },
    {
      integrations: {
        'Marketo': false
      }
    });
  });
});

//track blur on form fields
$('#mobile-signup-form-bottom input:not([type="hidden"]), #mobile-signup-form-top input:not([type="hidden"])').each(function(){
  $(this).one('blur', function(){
    //put all the information in the event because we'll want to use this as a goal in optimizely
    //send a general focus event to track focus for either the top or bottom form
    w.analytics.track('mobile-signup-form ' + $(this).attr('name') + ' blur',
    {
      category: 'forms'
    },
    {
      integrations: {
        'Marketo': false
      }
    });
    //send a specific focus event to track focus on either the top or bottom form
    w.analytics.track($(this).closest('form').attr('id') + ' ' + $(this).attr('name') + ' blur',
    {
      category: 'forms'
    },
    {
      integrations: {
        'Marketo': false
      }
    });
  });
});
