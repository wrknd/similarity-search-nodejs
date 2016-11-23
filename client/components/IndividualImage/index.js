/* eslint jsx-a11y/href-no-hash: off */

const React = require('react');
const Api = require('../../utilities/api');
const Icon = require('watson-react-components').Icon;
const SimilarImage = require('../SimilarImages/Image');
const JsonLink = require('watson-react-components').JsonLink;

const IndividualImage = React.createClass({
  propTypes: {
    image: React.PropTypes.object.isRequired,
    onGoBackClick: React.PropTypes.func.isRequired,
  },

  getInitialState() {
    return {
      loading: true,
    };
  },

  componentDidMount() {
    Api.getImage(this.props.image)
    .done(selectedImage =>
      Api.findSimilar({ url: selectedImage.metadata.image_link })
      .done(similarImages => {
        const data = selectedImage;
        data.similar_images = similarImages.similar_images.slice(1, 6);
        return this.setState({ data, loading: false });
      })
      .fail(error => {
        let errorMessage = 'There was a problem with the request, please try again';
        if (error.responseJSON && error.responseJSON.error) {
          errorMessage = error.responseJSON.error;
        }
        this.setState({
          error: error.status === 0 ? null : errorMessage,
          loading: false,
          data: null,
        });
      })
    );

    window.onhashchange = (() => {
      if (location.hash.replace(/^#/, '') === '') {
        this.props.onGoBackClick();
      }
    // eslint-disable-next-line
    }).bind(this);
  },

  componentWillUnmount() {
    Api.abortRequests();
    window.onhashchange = null;
  },

  onSimilarImageClick() { /* on similar image click */ },

  render() {
    return (
      <div>
        <section className="_full-width-row individual-page">
          <div className="_container _container_large">
            <div className="go-back">
              <a
                href="#"
                onClick={this.props.onGoBackClick}
                className="base--a go-back--link"
              >
                <Icon type="back" size="small" />
                <span className="go-back--link-span">Top 100 Similar Images</span>
              </a>
            </div>
            {(this.state.loading && !this.state.error) ?
              <div className="similar-images--loading" style={{ height: '30rem' }}>
                <div className="loader-container loader-container_small">
                  <Icon type="loader" size="large" />
                </div>
              </div>
              : null
            }

            {this.state.error ?
              <div className="similar-images--error">
                <Icon type="error" />
                <p className="base--p service-error--message">{this.state.error}</p>
              </div>
               : null
            }

            {this.state.data ?
              <div className="individual-item">
                <div className="row">
                  <div className="individual-item--display">
                    <div className="individual-item--json">
                      <JsonLink json={this.state.data} />
                    </div>
                    <div className="individual-item--image-container">
                      <div className="content">
                        <img
                          className="individual-item--image"
                          src={this.state.data.metadata.image_link}
                          alt="Similarity result"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="individual-item--data">
                    <h3 className="base--h3 individual-item--header">
                      Similarity&nbsp;
                      <a
                        href="http://www.ibm.com/watson/developercloud/doc/visual-recognition/understand-scores.shtml"
                        className="base--a individual-item--header-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >Score</a>
                    </h3>
                    <div className="individual-item--graph">
                      <div className="individual-item--graph-bar">
                        <div
                          className="individual-item--graph-percent"
                          style={{ width: `${Math.round(this.props.image.score * 100)}%` }}
                        />
                      </div>
                      <div className="individual-item--label">
                        {Math.round(this.props.image.score * 100) / 100}
                      </div>
                    </div>
                    <h3 className="base--h3 individual-item--header">Metadata</h3>
                    <div className="individual-item--tags">
                      <p>{this.state.data.metadata.long_description}</p>
                      <p>{this.state.data.metadata.material}</p>
                    </div>
                  </div>
                </div>
                <div className="similar-images">
                  <h3 className="base--h3 similar-images--title">Similar Images</h3>
                  <div className="similar-images--results-container">
                    {this.state.data.similar_images.map((image) =>
                      <SimilarImage
                        onSimilarImageClick={this.onSimilarImageClick}
                        image_file={image.metadata.image_link}
                        image_id={image.image_id}
                        score={image.score}
                        key={image.image_id}
                        isClickable={false}
                      />
                    )}
                  </div>
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
              </div>
          : null }
          </div>
        </section>
      </div>
    );
  },
});

module.exports = IndividualImage;
