import {
  Server,
  Cpu,
  Database,
  CheckCircle,
} from "lucide-react";

function SystemCard() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">

      <div className="mb-6 flex items-center gap-3">

        <Server className="text-green-600" />

        <h2 className="text-xl font-semibold">
          System Information
        </h2>

      </div>

      <div className="space-y-4">

        <div className="flex justify-between">

          <span>Backend</span>

          <span className="flex items-center gap-2 text-green-600">

            <CheckCircle size={16} />

            Connected

          </span>

        </div>

        <div className="flex justify-between">

          <span>Framework</span>

          <span>FastAPI</span>

        </div>

        <div className="flex justify-between">

          <span>Frontend</span>

          <span>React + Vite</span>

        </div>

        <div className="flex justify-between">

          <span>Database</span>

          <span className="flex items-center gap-2">

            <Database size={16} />

            MySQL

          </span>

        </div>

        <div className="flex justify-between">

          <span>Authentication</span>

          <span>JWT</span>

        </div>

        <div className="flex justify-between">

          <span>AI Engine</span>

          <span className="flex items-center gap-2">

            <Cpu size={16} />

            Enabled

          </span>

        </div>

      </div>

    </div>
  );
}

export default SystemCard;