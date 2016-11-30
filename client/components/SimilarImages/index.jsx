const React = require('react');
const Icon = require('watson-react-components').Icon;

const SimilarImage = require('./Image');

function SimilarImages(prop) {
  return (
    <div className="similar-images">
      {(prop.images && !prop.loading && !prop.error) ?
        (
        <h3 className="base--h3 similar-images--title">Top 100 Similar Images
          <span className="similar-images--sub-title">
            (1.5 million image corpus provided by&nbsp;
            <a
              href="http://www.ynap.com"
              className="base--a similar-images--courtesy-message-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              YNAP
            </a>)
          </span>
        </h3>
        ) : null
      }

      {(prop.images && prop.images.length > 0 && !prop.loading && !prop.error) ?
        <div>
          <div className="similar-images--results-container">
            {prop.images.slice(0, prop.imagesShown).map((image) =>
              <SimilarImage
                onSimilarImageClick={prop.onSimilarImageClick}
                image_file={image.metadata.image_link}
                image_id={image.image_id}
                score={image.score}
                key={image.image_id}
              />
            )}
          </div>
        </div>
      : null}

      {(prop.loading && !prop.error) ?
        <div className="similar-images--loading">
          <div className="loader-container loader-container_small">
            <Icon type="loader" size="large" />
          </div>
        </div>
        : null
      }
    </div>
  );
}

SimilarImages.propTypes = {
  images: React.PropTypes.arrayOf(React.PropTypes.shape({
    image_file: React.PropTypes.string.isRequired,
    image_id: React.PropTypes.string.isRequired,
  })),
  onSimilarImageClick: React.PropTypes.func.isRequired,
  imagesShown: React.PropTypes.number,
};

SimilarImages.defaultProps = {
  imagesShown: 15,
};

module.exports = SimilarImages;
