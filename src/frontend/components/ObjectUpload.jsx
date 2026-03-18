import { useRef, useState } from "react";

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export default function ObjectUpload({ onSave }) {
  const formRef = useRef(null);
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim() || !file) {
      setMessage("Please provide object name and image.");
      return;
    }

    setIsUploading(true);
    setMessage("");

    try {
      const image = await toBase64(file);
      const result = await onSave({ name: name.trim(), image });
      setName("");
      setFile(null);
      formRef.current?.reset();
      setMessage(result?.warning || "Object saved successfully.");
    } catch (error) {
      setMessage(error?.message || "Failed to save object.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="object-upload-form">
      <div className="object-field">
        <label htmlFor="object-image" className="object-label">
          Image
        </label>
        <input
          id="object-image"
          type="file"
          accept="image/*"
          onChange={(event) => setFile(event.target.files?.[0] || null)}
          className="object-input-file"
          disabled={isUploading}
        />
      </div>

      <div className="object-field">
        <label htmlFor="object-name" className="object-label">
          Object Name
        </label>
        <input
          id="object-name"
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="e.g. house keys"
          className="object-input-text"
          disabled={isUploading}
        />
      </div>

      <button
        type="submit"
        className="primary-btn settings-primary-btn"
        disabled={isUploading}
      >
        {isUploading ? "Saving..." : "Save Object"}
      </button>

      {message && <p className="object-message">{message}</p>}
    </form>
  );
}
