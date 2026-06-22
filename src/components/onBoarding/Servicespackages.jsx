/* eslint-disable react/prop-types */
import { useState, useRef, useEffect } from "react";

// ── Edit Service Modal ────────────────────────────────────────────────────────
const EditServiceModal = ({
  isOpen,
  onClose,
  onSave,
  initial = null,
  variant = "dark",
}) => {
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const fileRef = useRef();
  useEffect(() => {
    setServiceName(initial?.serviceName || "");
    setPrice(initial?.price || "");
    setDescription(initial?.description || "");
    setImages(initial?.images || []);
  }, [initial, isOpen]);

  const isDark = variant === "dark";

  if (!isOpen) return null;

  const handleFiles = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (!selectedFiles.length) return;

    const remainingSlots = 5 - images.length;

    if (remainingSlots <= 0) {
      e.target.value = "";
      return;
    }

    const filesToAdd = selectedFiles.slice(0, remainingSlots);

    const readFile = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();

        reader.onload = (event) => {
          resolve({
            id: `${Date.now()}-${Math.random()}`,
            url: event.target.result,
            name: file.name,
          });
        };

        reader.readAsDataURL(file);
      });

    const newImages = await Promise.all(filesToAdd.map(readFile));

    setImages((prev) => [...prev, ...newImages]);

    e.target.value = "";
  };

  const deleteImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const replaceImage = (index, e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      setImages((prev) => {
        const updated = [...prev];

        updated[index] = {
          ...updated[index],
          url: event.target.result,
          name: file.name,
        };

        return updated;
      });
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleSave = () => {
    if (!serviceName.trim()) return;

    onSave({
      serviceName,
      price,
      description,
      images,
    });

    onClose();
  };

  const inputStyles = isDark
    ? `
      bg-white/10
      text-white
      border border-white/20
      placeholder:text-gray-300
      focus:border-white/40
    `
    : `
      bg-white
      text-gray-800
      border border-gray-300
      placeholder:text-gray-400
      focus:border-[#012C57]
    `;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm px-4">
      <div
        className={`rounded-[20px] w-full max-w-[400px] p-6 shadow-2xl ${isDark ? "bg-[#0F172A]" : "bg-white"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2
            className={`text-[22px] font-bold ${isDark ? "text-white" : "text-gray-900"
              }`}
          >
            Edit Service
          </h2>

          <button
            type="button"
            onClick={onClose}
            className={`text-2xl leading-none ${isDark
              ? "text-gray-400 hover:text-white"
              : "text-gray-400 hover:text-gray-700"
              }`}
          >
            ×
          </button>
        </div>

        {/* Service Name */}
        <div className="mb-4">
          <label
            className={`block text-[13px] font-semibold mb-1.5 ${isDark ? "text-white" : "text-gray-800"
              }`}
          >
            Service Name
          </label>

          <input
            type="text"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="Food and Drink Package"
            className={`w-full rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all ${inputStyles}`}
          />
        </div>

        {/* Price */}
        <div className="mb-4">
          <label
            className={`block text-[13px] font-semibold mb-1.5 ${isDark ? "text-white" : "text-gray-800"
              }`}
          >
            Price
          </label>

          <div
            className={`flex items-center rounded-xl px-4 py-2.5 transition-all ${inputStyles}`}
          >
            <span
              className={`text-[13px] mr-1 ${isDark ? "text-gray-300" : "text-gray-500"
                }`}
            >
              $
            </span>

            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className={`flex-1 text-[13px] outline-none bg-transparent ${isDark
                ? "text-white placeholder:text-gray-300"
                : "text-gray-800 placeholder:text-gray-400"
                }`}
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label
            className={`block text-[13px] font-semibold mb-1.5 ${isDark ? "text-white" : "text-gray-800"
              }`}
          >
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your service"
            rows={4}
            className={`w-full rounded-xl px-4 py-2.5 text-[13px] outline-none resize-none transition-all ${inputStyles}`}
          />
        </div>

        {/* Images */}
        <div className="mb-6">
          <label
            className={`block text-[13px] font-semibold mb-1.5 ${isDark ? "text-white" : "text-gray-800"
              }`}
          >
            Service Images{" "}
            <span
              className={`font-normal ${isDark ? "text-gray-400" : "text-gray-500"
                }`}
            >
              (Optional - {images.length}/5)
            </span>
          </label>

          {images.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-3">
              {images.map((img, i) => (
                <div key={img.id || `${img.name}-${i}`} className="relative">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="h-16 w-16 object-cover rounded-lg border border-gray-300"
                  />

                  <button
                    type="button"
                    onClick={() => deleteImage(i)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold transition-colors"
                  >
                    ×
                  </button>

                  <label className="absolute inset-0 rounded-lg bg-black/0 hover:bg-black/30 flex items-center justify-center cursor-pointer transition-colors opacity-0 hover:opacity-100">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => replaceImage(i, e)}
                    />

                    <span className="text-white text-xs font-semibold">
                      Replace
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}

          {images.length < 5 ? (
            <div
              onClick={() => fileRef.current.click()}
              className={`rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all ${isDark
                ? "border border-white/20 hover:bg-white/5"
                : "border border-gray-300 hover:bg-gray-50"
                }`}
            >
              <p
                className={`text-[12px] ${isDark ? "text-gray-300" : "text-gray-600"
                  }`}
              >
                <span
                  className={`font-semibold ${isDark ? "text-white" : "text-gray-800"
                    }`}
                >
                  choose file
                </span>{" "}
                to upload
              </p>
            </div>
          ) : (
            <div className="text-center text-[12px] text-red-500">
              Maximum 5 images allowed
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />
        </div>

        {/* Save */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full bg-[#012C57] text-white font-semibold text-[15px] py-3.5 rounded-2xl hover:bg-[#01243f] transition-colors"
        >
          Save
        </button>
      </div>
    </div>
  );
};

// ── Service Card ──────────────────────────────────────────────────────────────
const ServiceCard = ({ service, onEdit, onDelete, variant = "dark" }) => {
  const isDark = variant === "dark";

  return (
    <div
      className={`rounded-2xl p-4 mb-3 ${isDark
        ? "bg-white/10 backdrop-blur-[28px] border border-white/10"
        : "bg-white border border-gray-200 shadow-sm"
        }`}
    >
      {/* Top Row */}
      <div
        className={`flex items-center justify-between mb-2 pb-2 ${isDark ? "border-b border-white/10" : "border-b border-gray-200"
          }`}
      >
        <div
          className={`flex items-center gap-3 text-[13px] font-medium ${isDark ? "text-white" : "text-gray-800"
            }`}
        >
          <span>{service.serviceName}</span>

          <span className={isDark ? "text-white/40" : "text-gray-400"}>|</span>

          <span>{service.price ? `$${service.price}` : "—"}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className={`transition-colors ${isDark
              ? "text-white/60 hover:text-white"
              : "text-gray-500 hover:text-gray-800"
              }`}
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-1.06 1.06-2.829-2.828 1.061-1.06zm-2.475 2.475L3 14.172V17h2.828l8.111-8.111-2.828-2.828z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="text-red-400 hover:text-red-500 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Description */}
      {service.description && (
        <p
          className={`text-[12px] leading-relaxed mb-3 ${isDark ? "text-white/70" : "text-gray-600"
            }`}
        >
          {service.description}
        </p>
      )}

      {/* Images */}
      {service.images?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {service.images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={img.name}
              className="h-[52px] w-[52px] object-cover rounded-xl"
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function AddServicesAndPackages({
  services = [],
  onChange,
  variant = "dark",
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const isDark = variant === "dark";

  const openAdd = () => {
    setEditIndex(null);
    setModalOpen(true);
  };

  const openEdit = (i) => {
    setEditIndex(i);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    if (editIndex !== null) {
      const updatedServices = services.map((s, i) =>
        i === editIndex ? data : s,
      );

      onChange(updatedServices);
    } else {
      onChange([...services, data]);
    }
  };

  const handleDelete = (i) => {
    onChange(services.filter((_, idx) => idx !== i));
  };

  return (
    <div>
      <div className="w-full max-w-[440px]">
        {/* Title */}
        <h2
          className={`text-[14px] font-medium mb-1.5 ${isDark ? "text-white" : "text-gray-800"
            }`}
        >
          Add Services And Packages
        </h2>

        {/* Input Trigger */}
        <div
          className={`flex items-center text-sm rounded-[14px] overflow-hidden p-[3px] mb-4 ${isDark
            ? "border border-gray-600 bg-white/10 backdrop-blur-[28px]"
            : "border border-gray-300 bg-white"
            }`}
        >
          <div
            className={`flex-1 px-3 py-1.5 text-[12px] font-[300] ${isDark ? "text-[#E6E6F0]" : "text-gray-400"
              }`}
          >
            Add services & packages
          </div>

          <button
            type="button"
            onClick={openAdd}
            className={`p-1 rounded-md transition-colors ${isDark ? "bg-white text-[#012C57]" : "bg-[#012C57] text-white"
              }`}
          >
            <svg
              className="h-6 w-6 p-[2px]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 5a1 1 0 00-1 1v3H6a1 1 0 000 2h3v3a1 1 0 002 0V11h3a1 1 0 100-2h-3V6a1 1 0 00-1-1z" />
            </svg>
          </button>
        </div>

        {/* Cards */}
        {services.map((svc, i) => (
          <ServiceCard
            key={i}
            service={svc}
            onEdit={() => openEdit(i)}
            onDelete={() => handleDelete(i)}
            variant={variant}
          />
        ))}

        {/* Modal */}
        <EditServiceModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          initial={editIndex !== null ? services[editIndex] : null}
          variant={variant}
        />
      </div>
    </div>
  );
}

AddServicesAndPackages.defaultProps = {
  services: [],
  onChange: () => { },
};
