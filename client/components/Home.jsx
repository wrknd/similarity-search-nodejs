const React = require('react');
const $ = require('jquery');
const { Header, Jumbotron, Footer } = require('watson-react-components');

const SimilarImages = require('./SimilarImages');
const IndividualImage = require('./IndividualImage');
const ImagePicker = require('./ImagePicker');
const scrollTo = require('../utilities/scrollTo');
const Api = require('../utilities/api');

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

  onClassify(image) {
    this.setState({ imagesShown: 15 });
    Api.findSimilar(image)
    .done((data) => {
      this.setState({ data, loading: false, error: null });
    })
    .fail((error) => {
      let errorMessage = 'There was a problem with the request, please try again';
      if (error.responseJSON && error.responseJSON.error) {
        errorMessage = error.responseJSON.error;
      }
      this.setState({
        error: error.status === 0 ? null : errorMessage,
        loading: false,
        data: null,
      });
    });

    this.setState({
      loading: true,
      error: null,
      similarImage: null,
      selectedImage: image,
    });
    scrollTo('.similar-images');
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

  onError(errorMessage) {
    this.setState({ error: errorMessage });
  },

  render() {
    return (
      <div>
        <Header
          mainBreadcrumbs="Visual Recognition"
          mainBreadcrumbsUrl="http://www.ibm.com/watson/developercloud/visual-recognition.html"
          subBreadcrumbs="Similarity Search"
        />
        {!this.state.similarImage ? (
          <div style={{ marginTop: '0rem' }}>
            <Jumbotron
              serviceName="Similarity Search"
              repository="http://github.com/watson-developer-cloud/similarity-search-nodejs"
              documentation="http://www.ibm.com/watson/developercloud/doc/visual-recognition/"
              apiReference="http://www.ibm.com/watson/developercloud/visual-recognition/api/v3"
              version="Beta"
              description="Visual Recognition’s Similarity Search provides the ability to find
              related images based on visual input and scores. This capability presents new
              possibilities to discover relevant content through image based search."
            />
            <section className="_full-width-row home">
              <div className="_container _container_large">
                <ImagePicker
                  onClassify={this.onClassify}
                  selectedImage={this.state.data ? this.state.selectedImage : null }
                  userImage={this.state.error ? null : this.state.userImage}
                  onError={this.onError}
                  preview={this.state.error === null}
                />
                <SimilarImages
                  images={this.state.data ? this.state.data.similar_images : null}
                  loading={this.state.loading}
                  error={this.state.error}
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
