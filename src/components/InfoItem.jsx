const InfoItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-800">
        {value || "—"}
      </p>
    </div>
  );
};

export default InfoItem;