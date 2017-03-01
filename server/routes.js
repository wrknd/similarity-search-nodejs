require('babel-register');

const fs = require('fs');
const multer = require('multer');
const os = require('os');
const path = require('path');
const request = require('request');
const express = require('express');
const router = express.Router();
const extend = require('extend');

// react
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const Home = React.createFactory(require('../client/components/Home'));
const homeHtml = ReactDOMServer.renderToString(Home({}));

// watson
const VisualRecognition = require('watson-developer-cloud/visual-recognition/v3');
const visualRecognition = new VisualRecognition({
  version_date: '2016-05-19',
  path: { collection_id: process.env.COLLECTION_ID },
});

const removeDuplicates = (images) =>
  images.filter((elem, index, self) =>
    index === self.map((image) =>
      image.metadata.image_link).indexOf(elem.metadata.image_link)
  );
/**
 * Parse the required parameters for find_similar
 * When using a 'url', the app will download the image locally and send the image file
 * @param req.body.url The image url
 * @param req.body.image The image file
 * @param callback error first callback
 */
const parseRequestParameters = (req, callback) => {
  const params = { url: null, image: null };

  if (req.file) {
    // 1. file image
    params.image_file = fs.createReadStream(req.file.path);
    callback(null, params);
  } else if (req.body.url && req.body.url.indexOf('/images') === 0) {
    // 2. sample image
    params.image_file = fs.createReadStream(path.join(__dirname, '../static', req.body.url));
    callback(null, params);
  } else if (req.body.url) {
    // 3. image url
    if ((/^data:/gi).test(req.body.url)) {
      callback({ error: 'The Data protocol is not supported.', code: 400 });
    } else if ((/^file:\/\/\//gi).test(req.body.url)) {
      callback({ error: 'The File protocol is not supported.', code: 400 });
    } else {
      delete params.url;
      const tmpFile = `${os.tmpdir()}/${Date.now()}.png`;
      const stream = request(req.body.url)
      .on('error', () =>
        callback({ error: 'Error getting the image from the URL.', code: 400 })
      )
      .on('response', response => {
        const fileSize = response.headers['content-length'];
        if (fileSize > 2000000) {
          callback({ error: 'Ensure the image is under 2mb.', code: 400 });
        }
      })
      .pipe(fs.createWriteStream(tmpFile));

      stream.on('finish', () => {
        params.image_file = fs.createReadStream(tmpFile);
        callback(null, params);
      });
      stream.on('error', callback);
    }
  } else {
    // 4. image_file and url are null
    callback({ error: 'image_file or url need to be specified.', code: 400 });
  }
};

// Setup the upload mechanism
// images will be stored in a temp folder
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, os.tmpdir());
    },
    filename(req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

/**
 * Find similar images based on a given image
 *
 * @param req.body.url The URL for an image either.
 *                     images/test.jpg or https://example.com/test.jpg
 * @param req.file The image file.
 */
router.post('/api/find_similar', upload.single('image'), (req, res, next) => {
  parseRequestParameters(req, (error, params) => {
    if (error) {
      return next(error);
    }
    return visualRecognition.findSimilar(extend({ limit: 100 }, params), (err, data) => {
      if (!req.body.url || req.body.url.indexOf('/images') !== 0) {
        fs.unlink(params.image_file.path);
      }
      if (err) {
        return next(err);
      }
      const result = data;
      result.similar_images = removeDuplicates(data.similar_images);
      return res.json(result);
    });
  });
});

/**
 * Returns the image information based on the image_id
 *
 * @param req.params.image_id The image_id
 */
router.get('/api/images/:image_id', (req, res, next) =>
  visualRecognition.getImage(req.params, (err, data) => {
    if (err) {
      return next(err);
    }
    return res.json(data);
  })
);

router.get('/*', (req, res) => res.render('index',
  {
    react: homeHtml,
    ga: process.env.GOOGLE_ANALYTICS || 'Insert Google Analytics ID here',
    bluemixAnalytics: process.env.BLUEMIX_ANALYTICS,
  }
));

module.exports = router;
