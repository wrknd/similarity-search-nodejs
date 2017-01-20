const React = require('react');
const $ = require('jquery');
const { Header, Jumbotron, Footer, ImagePicker } = require('watson-react-components');

const SimilarImages = require('./SimilarImages');
const IndividualImage = require('./IndividualImage');
const scrollTo = require('../utilities/scrollTo');
const Api = require('../utilities/api');

const sampleImages = [0, 1, 2, 3].map((_, i) => {
  return {
    url: `/images/samples/${i}.png`,
    alt: `Sample-${i}`,
  };
});

module.exports = React.createClass({
  getInitialState() {
    return {
      loading: false,
      imagesShown: 15,
    };
  },

  componentDidMount() {
    window.addEventListener('scroll', this.onScrollEvent);
  },

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScrollEvent);
  },

  // infinite scrolling reveals more results
  onScrollEvent(event) {
    const target = event.srcElement || event.target;
    const bodyHeight = target.body.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop >= bodyHeight - windowHeight && !this.state.loading) {
      this.setState({ imagesShown: this.state.imagesShown + 15 });
    }
  },

  onClickTile(image, index) {
    this.onClassify(sampleImages[index]);
  },

  onClassify(image, errorType) {
    this.setState({ imagesShown: 15 });
    Api.findSimilar(image)
    .done((data) => {
      this.setState({ data, loading: false, error: null, fileError: null, urlError: null });
    })
    .fail((error) => {
      let errorMessage = 'There was a problem with the request, please try again';
      if (error.responseJSON && error.responseJSON.error) {
        errorMessage = error.responseJSON.error;
      }
      this.onError(error.status === 0 ? null : errorMessage, errorType);
      this.setState({
        loading: false,
        data: null,
      });
    });

    this.setState({
      loading: true,
      error: null,
      fileError: null,
      urlError: null,
      similarImage: null,
      selectedImage: image,
    });
    scrollTo('.similar-images');
  },

  onDropAccepted(image) {
    const formData = new FormData();
    formData.append('image', image);
    this.onClassify(formData);
    $('.dropzone').removeClass('dropzone_on-drag');
  },

  onDropRejected(image) {
    if (image.type !== 'image/png' &&
        image.type !== 'image/x-png' &&
        image.type !== 'image/jpeg' &&
        image.type !== 'image/jpg' &&
        image.type !== 'image/gif') {
      this.onError('Only JPGs, PNGs, and GIFs are supported', 1);
    }
    if (image.size > 2000000) {
      this.onError('Ensure the image is under 2mb', 1);
    }
    $('.dropzone').removeClass('dropzone_on-drag');
  },

  onUrlSubmit(url) {
    this.onClassify(url, 2);
  },

  onClosePreview() {
    this.setState({
      data: null,
    });
  },

  onGoBackClick() {
    this.setState({ similarImage: null });
  },

  onSimilarImageClick(image) {
    this.setState({ similarImage: image });
  },

  onRevealMoreImages() {
    let moreImages = this.state.imagesShown + 15;
    if (moreImages > 100) {
      moreImages = 100;
    }
    this.setState({ imagesShown: moreImages });
  },

  /**
   * errorType is 0, 1, or 2, where 0 = error, 1 = fileError, 2 = urlError
   */
  onError(errorMessage, errorType) {
    if (typeof errorType === 'undefined') {
      errorType = 0;
    }
    this.setState({
      error: errorType === 0 ? errorMessage : null,
      fileError: errorType === 1 ? errorMessage : null,
      urlError: errorType === 2 ? errorMessage : null,
    });
  },

  render() {
    return (
      <div>
        <Header
          mainBreadcrumbs="Visual Recognition"
          mainBreadcrumbsUrl="http://www.ibm.com/watson/developercloud/visual-recognition.html"
          subBreadcrumbs="Similarity Search"
          subBreadcrumbsUrl="https://similarity-search-demo.mybluemix.net"
        />
        {!this.state.similarImage ? (
          <div style={{ marginTop: '0rem' }}>
            <Jumbotron
              serviceName="Similarity Search"
              repository="http://github.com/watson-developer-cloud/similarity-search-nodejs"
              documentation="http://www.ibm.com/watson/developercloud/doc/visual-recognition/"
              apiReference="http://www.ibm.com/watson/developercloud/visual-recognition/api/v3"
              version="Beta"
              startInBluemix="https://console.ng.bluemix.net/registration/?target=/catalog/services/visual-recognition/"
              description="Visual Recognition’s Similarity Search provides the ability to find
              related images based on visual input and scores. This capability presents new
              possibilities to discover relevant content through image based search."
            />
            <section className="_full-width-row home">
              <div className="_container _container_large">
                <ImagePicker
                  images={sampleImages}
                  onClickTile={this.onClickTile}
                  onDropAccepted={this.onDropAccepted}
                  onDropRejected={this.onDropRejected}
                  onUrlSubmit={this.onUrlSubmit}
                  onClosePreview={this.onClosePreview}
                  selectedImage={this.state.data ? this.state.selectedImage : null }
                  userImage={this.state.error ? null : this.state.userImage}
                  preview={this.state.error === null}
                  error={this.state.error}
                  fileError={this.state.fileError}
                  urlError={this.state.urlError}
                  multiple={false}
                  maxSize={2000000}
                  accept=".png, .gif, .jpg, .jpeg,
                    image/png, image/x-png, image/gif, image/jpeg, image/jpg"
                />
                <SimilarImages
                  images={this.state.data ? this.state.data.similar_images : null}
                  loading={this.state.loading}
                  error={this.state.error || this.state.fileError || this.state.urlError}
                  onSimilarImageClick={this.onSimilarImageClick}
                  imagesShown={this.state.imagesShown}
                />
                <div className="similar-images--courtesy-message">
                  Images courtesy of IBM Watson partner&nbsp;
                  <a
                    href="http://www.ynap.com"
                    className="base--a similar-images--courtesy-message-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    YNAP
                  </a>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <IndividualImage
            onGoBackClick={this.onGoBackClick}
            image={this.state.similarImage}
          />
        )}
        <Footer />
      </div>
    );
  },
});
