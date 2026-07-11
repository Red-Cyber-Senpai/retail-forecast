import { Info } from "lucide-react";

function AboutCard() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <div className="mb-6 flex items-center gap-3">

        <Info className="text-blue-600" />

        <h2 className="text-xl font-semibold">
          About SelfStack
        </h2>

      </div>

      <div className="space-y-3 text-gray-700">

        <p>

          <strong>Application</strong>

          <br />

          SelfStack AI Retail Supply Chain

        </p>

        <p>

          <strong>Version</strong>

          <br />

          1.0.0

        </p>

        <p>

          <strong>Frontend</strong>

          <br />

          React + Vite + TailwindCSS

        </p>

        <p>

          <strong>Backend</strong>

          <br />

          FastAPI + SQLAlchemy + MySQL

        </p>

        <p>

          <strong>AI Modules</strong>

          <br />

          Product Recognition

          <br />

          Demand Forecasting

          <br />

          Analytics

        </p>

        <p>

          Developed as an AI-powered Retail Supply Chain Management platform.

        </p>

      </div>

    </div>
  );
}

export default AboutCard;