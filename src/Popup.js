import React, { useEffect, useState } from 'react';

const Popup = () => {
  const [timeWasted, setTimeWasted] = useState({});

  useEffect(() => {
    const updateWastedTime = () => {
      chrome.storage.local.get(['timeWasted'], (result) => {
        setTimeWasted(result.timeWasted || {});
      });
    };

    updateWastedTime(); // Update immediately when the popup is opened

    const interval = setInterval(updateWastedTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const totalTime = Object.values(timeWasted).reduce((sum, time) => sum + time, 0);

  const formatTime = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);

    return [
      days > 0 ? `${days}D` : '',
      hours > 0 ? `${hours}H` : '',
      minutes > 0 ? `${minutes}M` : '',
      seconds > 0 ? `${seconds}S` : '',
    ]
      .filter(Boolean)
      .join(' ');
  };

  return (
    <div
      className='p-8 text-center bg-white shadow-lg rounded-lg'
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
        width: '400px',
        height: '300px',
      }}
    >
      <h1 className='text-4xl font-extrabold mb-8 text-gray-800' style={{ color: '#1D1D1F' }}>
        Time Wasted
      </h1>
      <div
        className='text-2xl mb-6 text-gray-600'
        style={{ color: '#86868B' }}
      >{`Total time wasted: ${formatTime(totalTime)}`}</div>
      <div
        className='w-full bg-gray-300 rounded-full h-12 overflow-hidden flex'
        style={{ backgroundColor: '#E5E5EA' }}
      >
        {Object.entries(timeWasted).map(([site, time]) => {
          const percentage = (time / totalTime) * 100;
          const color =
            site === 'youtube.com' ? '#FF0000' : site === 'facebook.com' ? '#1877F2' : '#FF4500';
          return (
            <div
              key={site}
              className='h-full text-white text-center flex items-center justify-center'
              style={{
                width: `${percentage}%`,
                backgroundColor: color,
                color: '#FFFFFF',
                transition: 'width 0.5s ease-in-out',
              }}
            >
              {`${site.split('.')[0]}: ${percentage.toFixed(2)}%`}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Popup;
