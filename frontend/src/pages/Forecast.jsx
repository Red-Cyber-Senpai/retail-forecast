import { useState } from "react";
import toast from "react-hot-toast";

import Loader from "../components/common/Loader";
import ErrorState from "../components/common/ErrorState";

import ForecastToolbar from "../components/forecast/ForecastToolbar";
import ForecastSummary from "../components/forecast/ForecastSummary";
import ForecastChart from "../components/forecast/ForecastChart";
import AIRecommendation from "../components/forecast/AIRecommendation";

import { getForecast } from "../services/forecast";

function Forecast() {
  const [productId, setProductId] = useState("");
  const [days, setDays] = useState(7);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateForecast() {
    if (!productId) {
      toast.error("Please enter Product ID");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await getForecast(productId, days);
      setForecast(data);

      toast.success("Forecast generated successfully.");

      window.scrollTo({
        top: 320,
        behavior: "smooth",
      });
    } catch (err) {
      console.error(err);

      setForecast(null);

      const message =
        err.response?.data?.detail ||
        "Unable to generate forecast.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <ForecastToolbar
        productId={productId}
        setProductId={setProductId}
        days={days}
        setDays={setDays}
        onGenerate={generateForecast}
        loading={loading}
      />

      {loading && <Loader />}

      {!loading && error && <ErrorState message={error} />}

      {!loading && forecast && (
        <>
          <ForecastSummary forecast={forecast} />
          <ForecastChart forecast={forecast} />
          <AIRecommendation forecast={forecast} />
        </>
      )}
    </div>
  );
}

export default Forecast;