const Spinner = ({ color }) => {
  return (
    <div className="flex justify-center items-center">
      <div
        className="animate-spin h-6 w-6 border-4 border-t-transparent rounded-full"
        style={{ borderColor: color, borderTopColor: "transparent" }}
      ></div>
    </div>
  );
};

export default Spinner;