import React, { createContext, useContext, useState } from 'react';
import styles from './NotificationManager.module.css';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, color = '#007bff') => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, color }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    }, 3000);
  };

  return (
    <NotificationContext.Provider value={addNotification}>
      {children}
      {}
      <div className={styles.container}>
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={styles.notification}
            style={{ backgroundColor: notif.color }}
          >
            {notif.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};