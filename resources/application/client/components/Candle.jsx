import './Candle.css'

function Candle() {
  return (
    <div className="candle">
      <div className="candle-flame">
        <div className="candle-flame-big"></div>
        <div className="candle-flame-small"></div>
      </div>

      <div className="candle-body"></div>

      <div className="candle-circles">
        <div className="candle-base-star candle-star-1"></div>
        <div className="candle-base-star candle-star-2"></div>
        <div className="candle-base-star candle-star-3"></div>
        <div className="candle-base-star candle-star-4"></div>
        <div className="candle-base-star candle-star-5"></div>
        <div className="candle-base-star candle-star-6"></div>
      </div>
    </div>
  )
}

export default Candle