const React = require('react');

function Image(prop) {
  let scoreTransformed = (Math.round(prop.score * 100) / 100).toString();
  if (prop.score < 1) {
    scoreTransformed = scoreTransformed.slice(1, scoreTransformed.length);
  } else if (prop.score === 1) {
    scoreTransformed = '1.00';
  }

  return (
    <div className="similar-images--tile">
      {prop.isClickable ? (
        <a
          href={`#images/${prop.image_id}`}
          // eslint-disable-next-line
          onClick={prop.onSimilarImageClick.bind(null, { image_id: prop.image_id, score: prop.score })}
        >
          <div className="similar-images--tile-image-container">
            <div className="content">
              <img
                className="similar-images--tile-image"
                src={prop.image_file || '/images/sample-image.jpg'}
                alt={prop.image_id}
              />
            </div>
          </div>
        </a>
      ) : (
        <div className="similar-images--tile-image-container">
          <div className="content">
            <img
              className="similar-images--tile-image"
              src={prop.image_file || '/images/sample-image.jpg'}
              alt={prop.image_id}
            />
          </div>
        </div>
      )}
      <div className="similar-images--graph">
        <div className="similar-images--graph-bar">
          <div
            className="similar-images--graph-percent"
            style={{ width: `${Math.round(prop.score * 100)}%` }}
          />
        </div>
        <div className="similar-images--label">{scoreTransformed}</div>
      </div>
    </div>
  );
}

Image.propTypes = {
  image_file: React.PropTypes.string.isRequired,
  image_id: React.PropTypes.string.isRequired,
  score: React.PropTypes.number.isRequired,
  onSimilarImageClick: React.PropTypes.func.isRequired,
  isClickable: React.PropTypes.bool,
};

Image.defaultProps = {
  isClickable: true,
};

module.exports = Image;
