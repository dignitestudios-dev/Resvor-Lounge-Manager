import { useState, useRef } from "react";

// ── Edit Service Modal ────────────────────────────────────────────────────────
const EditServiceModal = ({ isOpen, onClose, onSave, initial = null }) => {
  const [serviceName, setServiceName] = useState(initial?.serviceName || "");
  const [price, setPrice] = useState(initial?.price || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [images, setImages] = useState(initial?.images || []);
  const fileRef = useRef();

  if (!isOpen) return null;

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) =>
        setImages((prev) => [
          ...prev,
          { url: ev.target.result, name: file.name },
        ]);
      reader.readAsDataURL(file);
    });
  };

  const handleSave = () => {
    if (!serviceName.trim()) return;
    onSave({ serviceName, price, description, images });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-xs px-4">
      <div className="bg-white rounded-[20px] w-full max-w-[400px] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[22px] font-bold text-gray-900">Edit Service</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Service Name */}
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
            Service Name
          </label>
          <input
            type="text"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="Food and Drink Package"
            className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 outline-none focus:border-[#012C57] placeholder:text-gray-400"
          />
        </div>

        {/* Price */}
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
            Price
          </label>
          <div className="flex items-center border border-gray-300 rounded-xl px-4 py-2.5 focus-within:border-[#012C57]">
            <span className="text-gray-500 text-[13px] mr-1">$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              className="flex-1 text-[13px] text-gray-800 outline-none placeholder:text-gray-400 bg-transparent"
            />
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your service"
            rows={4}
            className="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-2.5 text-[13px] text-gray-800 outline-none focus:border-[#012C57] placeholder:text-gray-400 resize-none"
          />
        </div>

        {/* Service Images */}
        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-gray-800 mb-1.5">
            Service Images{" "}
            <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <div
            onClick={() => fileRef.current.click()}
            className="border border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
          >
            {images.length > 0 ? (
              <div className="flex flex-wrap gap-2 justify-center">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img.url}
                    alt={img.name}
                    className="h-14 w-14 object-cover rounded-lg"
                  />
                ))}
                <div className="h-14 w-14 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-xl">
                  +
                </div>
              </div>
            ) : (
              <>
                {/* upload icon */}
                <svg
                  className="w-9 h-9 text-gray-400 mb-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="4"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 17l4-4 4 4M12 13V7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-[12px] text-gray-500">
                  <span className="font-semibold text-gray-700">
                    choose file
                  </span>{" "}
                  to upload
                </p>
              </>
            )}
          </div>
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
const ServiceCard = ({ service, onEdit, onDelete }) => (
  <div className="border-gray-200 bg-white/10 backdrop-blur-[28.9px] rounded-2xl p-4 mb-3">
    {/* Top row */}
    <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
      <div className="flex items-center gap-3 text-white text-[13px] font-medium">
        <span>{service.serviceName}</span>
        <span className="text-white/40">|</span>
        <span>{service.price ? `$${service.price}` : "—"}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onEdit}
          className="text-white/60 hover:text-white transition-colors"
        >
          {/* pencil */}
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-1.06 1.06-2.829-2.828 1.061-1.06zm-2.475 2.475L3 14.172V17h2.828l8.111-8.111-2.828-2.828z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="text-red-400 hover:text-red-300 transition-colors"
        >
          {/* trash */}
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>

    {/* Description */}
    {service.description && (
      <p className="text-white/70 text-[12px] leading-relaxed mb-3">
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

// ── Main Component ────────────────────────────────────────────────────────────
export default function AddServicesAndPackages({ services = [], onChange }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

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
        {/* Section title */}
        <h2 className="text-white text-[16px] font-semibold mb-3">
          Add Services And Packages
        </h2>

        {/* Input trigger */}
        <div className="flex items-center border border-gray-600 bg-white/10 backdrop-blur-[28.9px] text-sm rounded-[14px] overflow-hidden p-[3px] mb-4">
          <div className="flex-1 px-3 py-1.5 text-[12px] text-[#E6E6F0] font-[300]">
            add services &amp; packages
          </div>
          <button
            onClick={openAdd}
            className="bg-white text-[#012C57] p-1 rounded-md"
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

        {/* Service cards */}
        {services.map((svc, i) => (
          <ServiceCard
            key={i}
            service={svc}
            onEdit={() => openEdit(i)}
            onDelete={() => handleDelete(i)}
          />
        ))}

        {/* Modal */}
        <EditServiceModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
          initial={editIndex !== null ? services[editIndex] : null}
        />
      </div>
    </div>
  );
}

AddServicesAndPackages.defaultProps = {
  services: [],
  onChange: () => {},
};
