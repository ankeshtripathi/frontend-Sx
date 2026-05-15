const InfoItem = ({ label, value }) => {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">
        {value || "—"}
      </p>
    </div>
  );
};

export default InfoItem;