const InfoItem = ({ label, value }) => {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-bold text-slate-900">
        {value || "—"}
      </p>
    </div>
  );
};

export default InfoItem;