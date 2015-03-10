window.optly.mrkt.form = window.optly.mrkt.form || {};

var eventsFormHelper = {

  success: function(returnData) {
    var parsedResp = this.parseResponse(returnData),
        form = this.formElm.getAttribute('id');

    if(parsedResp){
      w.optly.mrkt.Oform.trackLead({
        form: form,
        response: parsedResp,
        requestPayload: returnData.requestPayload
      });
    }
  },

  error: function() {
    this.showOptionsError({error: 'UNEXPECTED'});
    $('body').addClass('oform-error').removeClass('oform-processing');
  },

  done: function() {
  }
};

window.optly.mrkt.form.eventsForm = function(argumentsObj) {
  var constructorArgs = {
    formId: argumentsObj.formId,
    prototype: eventsFormHelper
  };

  return window.optly.mrkt.form.HelperFactory(constructorArgs);

};