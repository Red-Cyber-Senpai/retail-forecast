function AIRecommendation({ forecast }) {
  if (!forecast) return null;

  const confidence = Number(
    forecast.forecast_confidence || 0
  );

  return (
    <div className="p-6 bg-white shadow-md rounded-2xl">
      <h2 className="mb-5 text-2xl font-bold">
        AI Recommendation
      </h2>

      <div className="space-y-5">
        <div className="p-4 border-l-4 border-blue-600 rounded-lg bg-blue-50">
          <strong>Product</strong>
          <p>{forecast.product_name}</p>
        </div>

        <div className="p-4 border-l-4 border-green-600 rounded-lg bg-green-50">
          <strong>Recommended Supplier</strong>
          <p>{forecast.recommended_supplier || "No Supplier Found"}</p>
        </div>

        <div className="p-4 border-l-4 border-purple-600 rounded-lg bg-purple-50">
          <strong>Recommendation</strong>
          <p>{forecast.ai_recommendation}</p>
        </div>

        <div className="p-4 border-l-4 border-orange-500 rounded-lg bg-orange-50">
          <strong>Forecast Confidence</strong>
          <p>{(confidence * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}

export default AIRecommendation;