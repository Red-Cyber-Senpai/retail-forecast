import { useState } from "react";
import toast from "react-hot-toast";

import ImageUploader from "../components/scanner/ImageUploader";
import ImagePreview from "../components/scanner/ImagePreview";
import ScanButton from "../components/scanner/ScanButton";
import DetectionResults from "../components/scanner/DetectionResults";

import { scanImage } from "../services/scanner";

function Scanner() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  async function handleScan() {
    if (!image) {
      toast.error("Please upload an image first.");
      return;
    }

    try {
      setLoading(true);

      const data = await scanImage(image);

      setResult(data);

      toast.success("Scan completed successfully.");
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.detail ||
          "Scan failed."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setImage(null);
    setResult(null);
  }

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-4xl font-bold">
          AI Shelf Scanner
        </h1>

        <p className="mt-2 text-gray-500">
          Upload a product image and let AI identify it.
        </p>
      </div>

      <ImageUploader
        onImageSelect={setImage}
        disabled={loading}
      />

      <ImagePreview image={image} />

      <div className="flex gap-3">
        <ScanButton
          loading={loading}
          onClick={handleScan}
        />

        {(image || result) && (
          <button
            onClick={handleReset}
            className="rounded-xl bg-gray-200 px-6 py-3 hover:bg-gray-300"
          >
            Reset
          </button>
        )}
      </div>

      <DetectionResults result={result} />

    </div>
  );
}

export default Scanner;