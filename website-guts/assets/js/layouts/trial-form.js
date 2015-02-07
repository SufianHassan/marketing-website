w.optly.mrkt.inlineFormLabels();

if(!w.optly.mrkt.isMobile()){
  $('#url').focus();
}

$('[name="hidden"]').val('touched');

document.querySelector('[name="hidden"]').value = 'touched';

var xhrInitiationTime;

//track focus on form fields
$('#seo-form input:not([type="hidden"])').each(function(){
  $(this).one('focus', function(){
    //put all the information in the event because we'll want to use this as a goal in optimizely
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
$('#seo-form input:not([type="hidden"])').each(function(){
  $(this).one('blur', function(){
    //put all the information in the event because we'll want to use this as a goal in optimizely
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

//form
w.optly.mrkt.trialForm = new Oform({
  selector: '#seo-form',
  customValidation: {
    'url-input': function(element){
      console.log('value: ' + element.value);
      var urlRegex = /.+\..+/;
      return urlRegex.test(element.value);
    }
  }
})
.on('before', function(){
  w.analytics.track('/free-trial/submit', {
    category: 'account',
    label: w.optly.mrkt.utils.trimTrailingSlash(w.location.pathname)
  }, {
    integrations: {
      'Marketo': false
    }
  });
  xhrInitiationTime = new Date();
  return w.optly.mrkt.Oform.before();
})
.on('validationerror', w.optly.mrkt.Oform.validationError)
.on('error', function(){
  $('#seo-form .error-message').text('An unknown error occured.');
  $('body').addClass('oform-error').removeClass('oform-processing');
})
.on('load', function(event){
  var xhrElapsedTime,
      response;
  xhrElapsedTime = new Date() - xhrInitiationTime;
  try {
    response = JSON.parse(event.target.responseText);
  } catch(error){
    w.analytics.track(w.optly.mrkt.utils.trimTrailingSlash(w.location.pathname), {
      category: 'api error',
      label: 'json parse error: ' + error,
    }, {
      integrations: {
        'Marketo': false
      }
    });
  }
  w.ga('send', {
    'hitType': 'timing',
    'timingCategory': 'api response time',
    'timingVar': '/account/free_trial_create',
    'timingValue': xhrElapsedTime,
    'page': w.optly.mrkt.utils.trimTrailingSlash(w.location.pathname)
  });
  if(response){
    if(event.target.status === 200){
      //remove error class from body?
      w.optly.mrkt.Oform.trackLead({
        email: d.getElementById('email').value,
        url: d.getElementById('url').value,
        name: d.getElementById('name').value,
        phone: d.getElementById('phone').value
      }, event);
      w.analytics.track('seo-form success after error ' + w.optly.mrkt.formHadError, {
        category: 'form'
      }, {
        integrations: {
          Marketo: false
        }
      });
      /* legacy reporting - to be deprecated */
      w.analytics.track('/free-trial/success', {
        category: 'account',
        label: w.location.pathname
      }, {
        'Marketo': false
      });
      w.Munchkin.munchkinFunction('visitWebPage', {
        url: '/free-trial/success'
      });
      w.analytics.page('/account/create/success', {
        integrations: {
          'Marketo': false
        }
      });
      w.analytics.page('/free-trial/success', {
        integrations: {
          'Marketo': false
        }
      });

      //for phantom tests
      document.body.dataset.formSuccess = document.getElementById('seo-form').getAttribute('action');

      setTimeout(function(){
        var redirectURL;
        if(/^www\.optimizely\./.test(window.location.hostname)){
          redirectURL = '/';
        } else {
          redirectURL = 'https://www.optimizely.com/edit?url=';
        }
        w.location = redirectURL + encodeURIComponent(d.getElementById('url').value);
      }, 1000);

    } else {
      w.analytics.track(w.optly.mrkt.utils.trimTrailingSlash(w.location.pathname), {
        category: 'api error',
        label: 'status not 200: ' + event.target.status
      }, {
        integrations: {
          'Marketo': false
        }
      });
      if(response.error && typeof response.error === 'string'){
        //update error message, apply error class to body
        $('#seo-form .error-message').text(response.error);
        $('body').addClass('oform-error').removeClass('oform-processing');
        w.analytics.track(w.optly.mrkt.utils.trimTrailingSlash(w.location.pathname), {
          category: 'api error',
          label: 'response.error: ' + response.error
        }, {
          integrations: {
            'Marketo': false
          }
        });
      } else {
        $('#seo-form .error-message').text('An unknown error occured.');
        $('body').addClass('oform-error').removeClass('oform-processing');
      }
    }
  } else {
    $('#seo-form .error-message').text('An unknown error occured.');
    $('body').addClass('oform-error').removeClass('oform-processing');
  }
})
.on('done', function(){
  if($('body').hasClass('oform-error')){
    $('body').removeClass('oform-processing');
    //report that there were errors in the form
    w.analytics.track('seo-form validation error', {
      category: 'form error',
      label: $('input.oform-error-show').length + ' errors',
    }, {
      integrations: {
        'Marketo': false
      }
    });
  }
});

var validateOnBlur = function(isValid, element){
  w.optly.mrkt.trialForm.options.adjustClasses(element, isValid);
  var elementValue = $(element).val();
  var elementHasValue = elementValue ? 'has value' : 'no value';
  if(!isValid){
    w.optly.mrkt.formHadError = true;
    w.analytics.track($(element).closest('form').attr('id') + ' ' + $(element).attr('name') + ' error blur', {
      category: 'form error',
      label: elementHasValue,
      value: elementValue.length
    }, {
      integrations: {
        Marketo: false
      }
    });
  }
};

$('#seo-form [name="name"]').blur(function(){
  validateOnBlur(w.optly.mrkt.trialForm.options.validate.text(this), this);
});

$('#seo-form [name="url-input"]').blur(function(){
  validateOnBlur(w.optly.mrkt.trialForm.options.customValidation['url-input'](this), this);
});

$('#seo-form [name="email"]').blur(function(){
  validateOnBlur(w.optly.mrkt.trialForm.options.validate.email( $(this).val() ), this);
});
