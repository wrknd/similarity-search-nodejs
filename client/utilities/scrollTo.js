const $ = require('jquery');

module.exports = (selector) => {
  $('html, body').animate({
    scrollTop: $(selector).offset().top,
  }, 500);
};
