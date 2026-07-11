function ImagePreview({ image }) {
  if (!image) return null;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-xl font-semibold">
        Image Preview
      </h2>

      <img
        src={URL.createObjectURL(image)}
        alt="Preview"
        className="mx-auto max-h-[400px] rounded-xl"
      />
    </div>
  );
}

export default ImagePreview;