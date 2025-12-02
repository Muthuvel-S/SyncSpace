import React from "react";

const Maintenance = () => {
  return (
    <div className="fixed inset-0 bg-black/80 text-white flex flex-col items-center justify-center z-50 px-4">
      <h1 className="text-3xl font-bold mb-4 text-center">
        🚧 Sorry for the inconvenience
      </h1>
      <p className="text-lg text-center max-w-md">
        The website is currently undergoing updates.  
        Please check back after some time.
      </p>
    </div>
  );
};

export default Maintenance;
