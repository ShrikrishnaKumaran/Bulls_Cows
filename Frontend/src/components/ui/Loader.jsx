const Loader = ({ size = 'medium', text = 'Loading...' }) => {
  return (
    <div className={`loader loader-${size}`}>
      <div className="spinner"></div>
      {text && <p>{text}</p>}
    </div>
  );
};

export default Loader;
