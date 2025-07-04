import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import styles from './NotificationManager.module.css';

const NotificationContext = createContext();

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
    }
    return context;
};

const NotificationItem = ({ notification, onRemove }) => {
    const timeoutRef = useRef(null);

    useEffect(() => {
        if (notification.duration !== Infinity) {
            timeoutRef.current = setTimeout(() => {
                onRemove(notification.id);
            }, notification.duration);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [notification.id, notification.duration, onRemove]);

    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return <CheckCircle size={20} />;
            case 'error':
                return <XCircle size={20} />;
            case 'warning':
                return <AlertTriangle size={20} />;
            default:
                return <Info size={20} />;
        }
    };

    const getTypeStyles = () => {
        switch (notification.type) {
            case 'success':
                return styles.success;
            case 'error':
                return styles.error;
            case 'warning':
                return styles.warning;
            default:
                return styles.info;
        }
    };

    return (
        <motion.div
            className={`${styles.notification} ${getTypeStyles()}`}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            layout
        >
            <div className={styles.iconContainer}>
                {getIcon()}
            </div>
            
            <div className={styles.content}>
                <h4 className={styles.title}>{notification.title}</h4>
                {notification.message && (
                    <p className={styles.message}>{notification.message}</p>
                )}
            </div>
            
            <motion.button
                className={styles.closeButton}
                onClick={() => onRemove(notification.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <X size={16} />
            </motion.button>
        </motion.div>
    );
};

const NotificationContainer = ({ notifications, onRemove }) => {
    return (
        <div className={styles.container}>
            <AnimatePresence mode="popLayout">
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onRemove={onRemove}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const nextId = useRef(1);

    const addNotification = useCallback((message, type = 'info', options = {}) => {
        const id = nextId.current++;
        const notification = {
            id,
            title: options.title || type.toUpperCase(),
            message,
            type,
            duration: options.duration || 5000,
            timestamp: Date.now()
        };

        setNotifications(prev => [...prev, notification]);

        // Limitar o número de notificações
        if (notifications.length >= 5) {
            setNotifications(prev => prev.slice(1));
        }
    }, [notifications.length]);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, []);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const contextValue = {
        notifications,
        addNotification,
        removeNotification,
        clearAllNotifications
    };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            <NotificationContainer
                notifications={notifications}
                onRemove={removeNotification}
            />
        </NotificationContext.Provider>
    );
};