const $ = require('jquery');

let findSimilarRequest = null;
let getImageRequest = null;

module.exports = {

  findSimilar(image) {
    if (findSimilarRequest) {
      findSimilarRequest.abort();
    }

    const params = {
      url: '/api/find_similar',
      type: 'POST',
      data: image,
      cache: false,
      dataType: 'json',
    };

    // disable contentType if is a file upload
    if (!image.url) {
      params.processData = false;
      params.contentType = false;
    }
    findSimilarRequest = $.ajax(params);
    return findSimilarRequest;
  },

  getImage(image) {
    if (getImageRequest) {
      getImageRequest.abort();
    }
    getImageRequest = $.get(`/api/images/${image.image_id}`);
    return getImageRequest;
  },

  abortRequests() {
    if (getImageRequest) {
      getImageRequest.abort();
    }
    if (findSimilarRequest) {
      findSimilarRequest.abort();
    }
  },
};
