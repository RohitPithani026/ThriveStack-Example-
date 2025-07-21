!(function (window) {
    /**
     * ThriveStack Analytics Platform
     * Comprehensive web analytics tracking with privacy-first approach
     * @version 2.0.1
     */
    class ThriveStack {
        /**
         * Initialize ThriveStack with configuration options
         * @param {Object} options - Configuration options
         * @param {string} options.apiKey - Your ThriveStack API key
         * @param {string} [options.apiEndpoint] - Custom API endpoint (defaults to dev environment)
         * @param {boolean} [options.trackClicks=true] - Whether to track click events
         * @param {boolean} [options.trackForms=false] - Whether to track form interactions
         * @param {boolean} [options.respectDoNotTrack=true] - Whether to respect browser's DNT setting
         * @param {boolean} [options.enableConsent=false] - Enable consent-based tracking
         * @param {number} [options.batchSize=10] - Maximum events to batch in one request
         * @param {number} [options.batchInterval=2000] - Milliseconds to wait before sending batched events
         * @param {string} [options.geoIpServiceUrl] - URL for IP geolocation service
         * @param {string} [options.source] - Source identifier for tracking
         */
        constructor(options) {
            // Handle string API key for backward compatibility
            if (typeof options === 'string') {
                options = {
                    apiKey: options
                };
            }

            // Core settings
            this.apiKey = options.apiKey;
            this.apiEndpoint = options.apiEndpoint || "https://api.app.thrivestack.ai/api";
            this.respectDoNotTrack = options.respectDoNotTrack !== false;
            this.trackClicks = options.trackClicks === true;
            this.trackForms = options.trackForms === true;
            this.enableConsent = options.enableConsent === true;

            // Add source parameter
            this.source = options.source || "";

            // Geo IP service URL - defaults to free ipinfo.io service
            this.geoIpServiceUrl = "https://ipinfo.io/json";

            // IP and location information storage
            this.ipAddress = null;
            this.locationInfo = null;

            // Event batching
            this.eventQueue = [];
            this.queueTimer = null;
            this.batchSize = options.batchSize || 10;
            this.batchInterval = options.batchInterval || 2000;

            // Analytics state
            this.interactionHistory = [];
            this.maxHistoryLength = 20;

            // Consent settings (default to functional only)
            this.consentCategories = {
                functional: true, // Always needed
                analytics: options.defaultConsent === true,
                marketing: options.defaultConsent === true
            };

            // Load userId and groupId from cookies if available
            this.userId = this.getUserIdFromCookie() || "";
            this.groupId = this.getGroupIdFromCookie() || "";

            // Device ID management
            this.deviceId = null;
            this.deviceIdReady = false;
            this.fpPromise = null;

            // Session configuration
            this.sessionTimeout = options.sessionTimeout || (30 * 60 * 1000); // 30 minutes
            // this.sessionTimeout = (2 * 60 * 1000); // Force 2 minutes for testing

            this.debounceDelay = options.debounceDelay || 2000; // 2 seconds
            this.sessionUpdateTimer = null;

            // Initialize device ID (check cookie first, then FingerprintJS if needed)
            this.initializeDeviceId();

            // Fetch IP and location data on initialization
            this.fetchIpAndLocationInfo();

            // Setup session tracking
            this.setupSessionTracking();

            // Initialize automatically if tracking is allowed
            if (this.shouldTrack()) {
                this.autoCapturePageVisit();

                if (this.trackClicks) {
                    this.autoCaptureClickEvents();
                }

                if (this.trackForms) {
                    this.autoCaptureFormEvents();
                }
            }
        }

        /**
         * Initialize device ID with proper fallback logic
         * @returns {Promise<void>}
         */
        async initializeDeviceId() {
            try {
                // First, check if we already have a device ID in cookie
                const existingDeviceId = this.getDeviceIdFromCookie();

                if (existingDeviceId) {
                    // Use existing device ID from cookie
                    this.deviceId = existingDeviceId;
                    this.deviceIdReady = true;
                    console.debug("Using existing device ID from cookie:", this.deviceId);

                    // Process any queued events now that device ID is ready
                    this.processQueueIfReady();
                    return;
                }

                // If no existing device ID, try to generate one with FingerprintJS
                console.debug("No existing device ID found, initializing FingerprintJS...");
                await this.initFingerprintJS();

            } catch (error) {
                console.warn("Failed to initialize device ID:", error.message);
                // Fallback to random device ID
                this.deviceId = this.generateRandomDeviceId();
                this.deviceIdReady = true;
                this.setDeviceIdCookie(this.deviceId);
                console.debug("Using fallback random device ID:", this.deviceId);

                // Process any queued events now that device ID is ready
                this.processQueueIfReady();
            }
        }

        /**
         * Initialize FingerprintJS
         * @returns {Promise<void>}
         */
        async initFingerprintJS() {
            try {
                // Load FingerprintJS from CDN
                this.fpPromise = import('https://openfpcdn.io/fingerprintjs/v4')
                    .then(FingerprintJS => FingerprintJS.load());

                // Get and store the visitor identifier
                const fp = await this.fpPromise;
                const result = await fp.get();

                // Store the visitor identifier as our device ID
                this.deviceId = result.visitorId;
                this.deviceIdReady = true;

                // Store in cookie for persistence
                this.setDeviceIdCookie(this.deviceId);

                console.debug("FingerprintJS initialized with device ID:", this.deviceId);

                // Process any queued events now that device ID is ready
                this.processQueueIfReady();

            } catch (error) {
                console.warn("Failed to initialize FingerprintJS:", error.message);
                // Fallback to random ID method
                this.deviceId = this.generateRandomDeviceId();
                this.deviceIdReady = true;
                this.setDeviceIdCookie(this.deviceId);
                console.debug("Using fallback random device ID:", this.deviceId);

                // Process any queued events now that device ID is ready
                this.processQueueIfReady();
                throw error; // Re-throw to let caller handle
            }
        }

        /**
         * Generate a random device ID as fallback
         * @returns {string} Random device ID
         */
        generateRandomDeviceId() {
            return 'device_' + Math.random().toString(36).substring(2, 15) +
                Math.random().toString(36).substring(2, 15);
        }

        /**
         * Set device ID in cookie
         * @param {string} deviceId - Device identifier to store
         */
        setDeviceIdCookie(deviceId) {
            if (!deviceId) return;

            const cookieName = 'thrivestack_device_id';

            // Set cookie with a 2 year expiration (in seconds)
            const expiryDate = new Date();
            expiryDate.setTime(expiryDate.getTime() + (730 * 24 * 60 * 60 * 1000)); // 730 days

            // Set secure and SameSite attributes for better security
            const cookieValue = `${cookieName}=${deviceId};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax`;

            try {
                document.cookie = cookieValue;
            } catch (e) {
                console.warn('Could not store device ID in cookie:', e);
            }
        }

        /**
         * Fetch IP address and location information with cookie caching
         * @returns {Promise<void>}
         */
        async fetchIpAndLocationInfo() {
            try {
                // First, try to get cached data from cookie
                const cachedData = this.getLocationInfoFromCookie();

                if (cachedData) {
                    // Use cached data
                    this.ipAddress = cachedData.ip || null;
                    this.locationInfo = {
                        city: cachedData.city || null,
                        region: cachedData.region || null,
                        country: cachedData.country || null,
                        postal: cachedData.postal || null,
                        loc: cachedData.loc || null,
                        timezone: cachedData.timezone || null
                    };

                    console.debug("Using cached IP and location info from cookie");

                    // If a page visit was already captured before this data was available,
                    // we might want to capture it again with the location data
                    // if (this.shouldTrack() && this.locationInfo) {
                    //     this.capturePageVisit();
                    // }
                    return;
                }

                // If no cached data, fetch from API
                console.debug("No cached location data found, fetching from API...");
                const response = await fetch(this.geoIpServiceUrl);
                if (!response.ok) {
                    throw new Error(`HTTP error ${response.status}`);
                }

                const data = await response.json();

                // Store IP and location data
                this.ipAddress = data.ip || null;
                this.locationInfo = {
                    city: data.city || null,
                    region: data.region || null,
                    country: data.country || null,
                    postal: data.postal || null,
                    loc: data.loc || null, // Format: "lat,long"
                    timezone: data.timezone || null
                };

                // Cache the data in cookie for future use
                this.setLocationInfoCookie(data);

                // If a page visit was already captured before this data was available,
                // we might want to capture it again with the location data
                //if (this.shouldTrack() && this.locationInfo) {
                //    this.capturePageVisit();
                //}
            } catch (error) {
                console.warn("Failed to fetch IP and location info:", error.message);
                // Set fallback values
                this.ipAddress = null;
                this.locationInfo = null;
            }
        }

        /**
         * Set location info in cookie with Base64 encoding
         * @param {Object} locationData - Location data to store
         */
        setLocationInfoCookie(locationData) {
            if (!locationData) return;

            const cookieName = 'thrivestack_location_info';

            try {
                // Encode data as Base64
                const encodedData = btoa(JSON.stringify(locationData));

                // Set cookie with 24 hour expiration
                const expiryDate = new Date();
                expiryDate.setTime(expiryDate.getTime() + (24 * 60 * 60 * 1000)); // 24 hours

                const cookieValue = `${cookieName}=${encodedData};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax`;

                document.cookie = cookieValue;
                console.debug("Location info cached in cookie");
            } catch (e) {
                console.warn('Could not store location info in cookie:', e);
            }
        }

        /**
         * Get location info from cookie with Base64 decoding
         * @returns {Object|null} Location data if found, null otherwise
         */
        getLocationInfoFromCookie() {
            const cookieName = 'thrivestack_location_info';

            try {
                const cookies = document.cookie.split(';');

                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.indexOf(cookieName + '=') === 0) {
                        const encodedValue = cookie.substring(cookieName.length + 1);

                        // Decode Base64 and parse JSON
                        const decodedValue = atob(encodedValue);
                        const locationData = JSON.parse(decodedValue);

                        return locationData;
                    }
                }
            } catch (e) {
                console.warn('Could not read location info from cookie:', e);
                // If cookie is corrupted, remove it
                this.removeLocationInfoCookie();
            }

            return null;
        }

        /**
         * Remove location info cookie (used when cookie is corrupted)
         */
        removeLocationInfoCookie() {
            const cookieName = 'thrivestack_location_info';
            try {
                document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Lax`;
            } catch (e) {
                console.warn('Could not remove location info cookie:', e);
            }
        }

        /**
         * Initialize ThriveStack and start tracking
         * @param {string} [userId] - Optional user ID to associate with tracking
         * @param {string} [source] - Optional source to associate with tracking
         * @returns {Promise<void>}
         */
        async init(userId = "", source = "") {
            try {
                if (userId) {
                    this.setUserId(userId);
                }

                if (source) {
                    this.source = source;
                }

                // Removed the duplicated page visit tracking call:
                // this.capturePageVisit();

            } catch (error) {
                console.error("Failed to initialize ThriveStack:", error);
            }
        }

        /**
         * Check if tracking is allowed based on DNT and consent settings
         * @returns {boolean} Whether tracking is allowed
         */
        shouldTrack() {
            // Check Do Not Track setting if enabled
            if (this.respectDoNotTrack && (
                navigator.doNotTrack === "1" ||
                navigator.doNotTrack === "yes" ||
                window.doNotTrack === "1"
            )) {
                console.warn("User has enabled Do Not Track. Tracking is disabled.");
                return false;
            }

            // Always allow functional tracking
            return true;
        }

        /**
         * Check if specific tracking category is allowed
         * @param {string} category - Category to check ("functional", "analytics", or "marketing")
         * @returns {boolean} Whether tracking in this category is allowed
         */
        isTrackingAllowed(category) {
            if (!this.shouldTrack()) return false;

            if (this.enableConsent) {
                return this.consentCategories[category] === true;
            }

            return true;
        }

        /**
         * Update consent settings for a tracking category
         * @param {string} category - Category to update
         * @param {boolean} hasConsent - Whether consent is granted
         */
        setConsent(category, hasConsent) {
            if (this.consentCategories.hasOwnProperty(category)) {
                this.consentCategories[category] = hasConsent;
            }
        }

        /**
         * Set user ID for tracking
         * @param {string} userId - User identifier
         */
        setUserId(userId) {
            this.userId = userId;
            this.setUserIdCookie(userId);
        }

        /**
         * Set groupId in instance and cookie
         * @param {string} groupId - Group identifier
         */
        setGroupId(groupId) {
            this.groupId = groupId;
            this.setGroupIdCookie(groupId);
        }

        /**
         * Set source for tracking
         * @param {string} source - Source identifier
         */
        setSource(source) {
            this.source = source;
            // Update global variable
            //window.thriveStackSource = source;
        }

        setUserIdCookie(userId) {
            if (!userId) return;

            const cookieName = 'thrivestack_user_id';

            // Set cookie with a 1 year expiration (in seconds)
            const expiryDate = new Date();
            expiryDate.setTime(expiryDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 365 days

            // Set secure and SameSite attributes for better security
            const cookieValue = `${cookieName}=${encodeURIComponent(userId)};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax`;

            try {
                document.cookie = cookieValue;
            } catch (e) {
                console.warn('Could not store user ID in cookie:', e);
            }
        }

        /**
         * Get userId from cookie
         * @returns {string|null} User ID if found, null otherwise
         */
        getUserIdFromCookie() {
            const cookieName = 'thrivestack_user_id';

            // Get value from cookies
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.indexOf(cookieName + '=') === 0) {
                    const value = cookie.substring(cookieName.length + 1);
                    return decodeURIComponent(value);
                }
            }

            return null;
        }

        /**
         * Set groupId in cookie
         * @param {string} groupId - Group identifier to store
         */
        setGroupIdCookie(groupId) {
            if (!groupId) return;

            const cookieName = 'thrivestack_group_id';

            // Set cookie with a 1 year expiration (in seconds)
            const expiryDate = new Date();
            expiryDate.setTime(expiryDate.getTime() + (365 * 24 * 60 * 60 * 1000)); // 365 days

            // Set secure and SameSite attributes for better security
            const cookieValue = `${cookieName}=${encodeURIComponent(groupId)};expires=${expiryDate.toUTCString()};path=/;SameSite=Lax`;

            try {
                document.cookie = cookieValue;
            } catch (e) {
                console.warn('Could not store group ID in cookie:', e);
            }
        }
        /**
         * Get groupId from cookie
         * @returns {string|null} Group ID if found, null otherwise
         */
        getGroupIdFromCookie() {
            const cookieName = 'thrivestack_group_id';
            // Get value from cookies
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();

                if (cookie.indexOf(cookieName + '=') === 0) {
                    const value = cookie.substring(cookieName.length + 1);
                    return decodeURIComponent(value);
                }
            }
            return null;
        }

        /**
         * Queue an event for batched sending
         * @param {Array|Object} events - Event data to queue
         */
        queueEvent(events) {
            // Handle both single events and arrays
            if (!Array.isArray(events)) {
                events = [events];
            }

            // Add events to queue
            this.eventQueue.push(...events);

            // Only process queue if device ID is ready
            if (this.deviceIdReady) {
                this.processQueueIfReady();
            } else {
                console.debug("Device ID not ready, keeping events in queue");
            }
        }

        /**
         * Process queue only if device ID is ready
         */
        processQueueIfReady() {
            if (!this.deviceIdReady || this.eventQueue.length === 0) {
                return;
            }

            // Process queue if we've reached the batch size
            if (this.eventQueue.length >= this.batchSize) {
                this.processQueue();
            } else if (!this.queueTimer) {
                // Start timer to process queue after delay
                this.queueTimer = setTimeout(() => this.processQueue(), this.batchInterval);
            }
        }

        /**
         * Process and send queued events
         */
        processQueue() {
            if (this.eventQueue.length === 0 || !this.deviceIdReady) return;

            const events = [...this.eventQueue];
            const updatedEvents = events.map(event => ({
                ...event,
                context: {
                    ...event.context,
                    device_id: this.deviceId
                }
            }));

            this.eventQueue = [];
            clearTimeout(this.queueTimer);
            this.queueTimer = null;

            this.track(updatedEvents).catch(error => {
                console.error("Failed to send batch events:", error);
                // Add events back to front of queue for retry
                this.eventQueue.unshift(...events);
            });
        }

        /**
         * Track events by sending to ThriveStack API
         * @param {Array} events - Events to track
         * @returns {Promise<Object>} API response
         */
        async track(events) {
            if (!this.apiKey) {
                throw Error("Initialize the ThriveStack instance before sending telemetry data.");
            }

            // Clean events of PII before sending
            const cleanedEvents = events.map(event => this.cleanPIIFromEventData(event));

            // Add retry logic for network errors
            let retries = 3;
            while (retries > 0) {
                try {
                    let response = await fetch(`${this.apiEndpoint}/track`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "x-api-key": `${this.apiKey}`
                        },
                        body: JSON.stringify(cleanedEvents)
                    });

                    if (!response.ok) {
                        throw Error(`HTTP error ${response.status}: ${await response.text()}`);
                    }

                    let data = await response.json();
                    return data;
                } catch (error) {
                    retries--;
                    if (retries === 0) {
                        console.error("Failed to send telemetry after multiple attempts:", error.message);
                        throw error;
                    }

                    // Wait before retrying (exponential backoff)
                    await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
                }
            }
        }

        /**
         * Send user identification data
         * @param {Object} data - User data
         * @returns {Promise<Object>} API response
         */
        async identify(data) {
            if (!this.apiKey) {
                throw Error("Initialize the ThriveStack instance before sending telemetry data.");
            }

            try {
                let userId = "";
                if (Array.isArray(data) && data.length > 0) {
                    const lastElement = data[data.length - 1];
                    userId = lastElement.user_id || "";
                } else {
                    // Keep original logic for non-array data
                    userId = data.userId || data.user_id || "";
                }
                // Set userId in instance and cookie
                if (userId) {
                    this.setUserId(userId);
                }
                // Send data to API
                let response = await fetch(`${this.apiEndpoint}/identify`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": `${this.apiKey}`
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw Error(`HTTP error ${response.status}: ${await response.text()}`);
                }

                let result = await response.json();
                return result;
            } catch (error) {
                console.error("Failed to send identification data:", error.message);
                throw error;
            }
        }

        /**
         * Send group data
         * @param {Object} data - Group data
         * @returns {Promise<Object>} API response
         */
        async group(data) {
            if (!this.apiKey) {
                throw Error("Initialize the ThriveStack instance before sending telemetry data.");
            }

            try {
                // Extract groupId from data
                let groupId = "";
                if (Array.isArray(data) && data.length > 0) {
                    const lastElement = data[data.length - 1];
                    groupId = lastElement.group_id || "";
                } else {
                    // Keep original logic for non-array data
                    groupId = data.group_id || "";
                }
                // Store groupId in instance and cookie
                if (groupId) {
                    this.setGroupId(groupId);
                }
                // Send data to API
                let response = await fetch(`${this.apiEndpoint}/group`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": `${this.apiKey}`
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    throw Error(`HTTP error ${response.status}: ${await response.text()}`);
                }

                let result = await response.json();
                return result;
            } catch (error) {
                console.error("Failed to send group data:", error.message);
                throw error;
            }
        }

        /**
         * Get UTM parameters from URL
         * @returns {Object} UTM parameters
         */
        getUtmParameters() {
            const urlParams = new URLSearchParams(window.location.search);
            return {
                utm_campaign: urlParams.get('utm_campaign') || null,
                utm_medium: urlParams.get('utm_medium') || null,
                utm_source: urlParams.get('utm_source') || null,
                utm_term: urlParams.get('utm_term') || null,
                utm_content: urlParams.get('utm_content') || null
            };
        }

        /**
         * Get device ID - now returns the actual device ID or null if not ready
         * @returns {string|null} Device ID or null if not ready
         */
        getDeviceId() {
            if (this.deviceIdReady && this.deviceId) {
                return this.deviceId;
            }
            return null;
        }

        /**
         * Get device ID from cookie
         * @returns {string|null} Device ID if found in cookie, null otherwise
         */
        getDeviceIdFromCookie() {
            const cookieName = 'thrivestack_device_id';

            // Try to get existing device ID from cookies
            const cookies = document.cookie.split(';');

            // Look for our specific cookie
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.indexOf(cookieName + '=') === 0) {
                    return cookie.substring(cookieName.length + 1);
                }
            }

            return null;
        }

        /**
         * Get session ID from cookie
         * @returns {string} Session ID
         */
        getSessionId() {
            const sessionCookieName = 'thrivestack_session';
            
            try {
                // Try to get existing session from cookies
                const cookies = document.cookie.split(';');
                let sessionCookieValue = null;

                // Look for our specific cookie
                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.indexOf(sessionCookieName + '=') === 0) {
                        sessionCookieValue = cookie.substring(sessionCookieName.length + 1);
                        break;
                    }
                }

                if (sessionCookieValue) {
                    // Try to parse as new format (Base64 JSON)
                    try {
                        const sessionData = JSON.parse(atob(sessionCookieValue));
                        
                        // Validate structure
                        if (sessionData.sessionId && sessionData.lastActivity) {
                            const lastActivity = new Date(sessionData.lastActivity);
                            const now = new Date();
                            const timeSinceLastActivity = now - lastActivity;

                            // Check if session is still valid (within timeout)
                            if (timeSinceLastActivity < this.sessionTimeout) {
                                return sessionData.sessionId;
                            } else {
                                // Session expired, create new one
                                console.debug("Session expired, creating new session");
                                return this.createNewSession();
                            }
                        } else {
                            // Invalid structure, create new session
                            return this.createNewSession();
                        }
                    } catch (parseError) {
                        // Not Base64 JSON, assume old format (plain session ID)
                        console.debug("Migrating old session format to new format");
                        return this.migrateOldSession(sessionCookieValue);
                    }
                } else {
                    // No existing session, create new one
                    return this.createNewSession();
                }
            } catch (error) {
                console.warn('Error getting session ID:', error);
                return this.createNewSession();
            }
        }

        /**
         * Create a new session
         * @returns {string} Session ID
         */
        createNewSession() {
            const sessionId = 'session_' + Math.random().toString(36).substring(2, 15);
            const now = new Date().toISOString();
            
            const sessionData = {
                sessionId: sessionId,
                startTime: now,
                lastActivity: now
            };

            this.setSessionCookie(sessionData);
            return sessionId;
        }

        /**
         * Migrate old session format
         * @param {string} oldSessionId - Old session ID
         * @returns {string} Session ID
         */
        migrateOldSession(oldSessionId) {
            const now = new Date().toISOString();
            
            const sessionData = {
                sessionId: oldSessionId,
                startTime: now, // We don't know the original start time
                lastActivity: now
            };

            this.setSessionCookie(sessionData);
            return oldSessionId;
        }

        /**
         * Set session cookie with new format
         * @param {Object} sessionData - Session data
         */
        setSessionCookie(sessionData) {
            const sessionCookieName = 'thrivestack_session';
            
            try {
                const encodedData = btoa(JSON.stringify(sessionData));
                const cookieValue = `${sessionCookieName}=${encodedData};path=/;SameSite=Lax`;
                document.cookie = cookieValue;
            } catch (error) {
                console.warn('Could not store session in cookie:', error);
            }
        }

        /**
         * Update session activity with debouncing
         */
        updateSessionActivity() {
            // Clear existing timer
            if (this.sessionUpdateTimer) {
                clearTimeout(this.sessionUpdateTimer);
            }

            // Set new debounced timer
            this.sessionUpdateTimer = setTimeout(() => {
                this.updateSessionActivityImmediate();
            }, this.debounceDelay);
        }

        /**
         * Immediate session activity update
         */
        updateSessionActivityImmediate() {
            const sessionCookieName = 'thrivestack_session';
            
            try {
                // Get current session data
                const cookies = document.cookie.split(';');
                let sessionCookieValue = null;

                for (let i = 0; i < cookies.length; i++) {
                    const cookie = cookies[i].trim();
                    if (cookie.indexOf(sessionCookieName + '=') === 0) {
                        sessionCookieValue = cookie.substring(sessionCookieName.length + 1);
                        break;
                    }
                }

                if (sessionCookieValue) {
                    try {
                        const sessionData = JSON.parse(atob(sessionCookieValue));
                        
                        // Update last activity
                        sessionData.lastActivity = new Date().toISOString();
                        
                        // Save updated session
                        this.setSessionCookie(sessionData);
                    } catch (parseError) {
                        // If parsing fails, create new session
                        this.createNewSession();
                    }
                } else {
                    // No session exists, create new one
                    this.createNewSession();
                }
            } catch (error) {
                console.warn('Could not update session activity:', error);
            }
        }

        /**
         * Setup session tracking event listeners
         */
        setupSessionTracking() {
            // Let only capture functions handle session activity updates
            // This prevents interference with session expiry validation
        }

        /**
         * Capture page visit event
         * @returns {Promise<void>}
         */
        async capturePageVisit() {
            if (!this.isTrackingAllowed('functional')) {
                return;
            }
            
            // Get device ID - return early if not ready
            const deviceId = this.getDeviceId();
            if (!deviceId) {
                console.debug("Device ID not ready, page visit will be queued");
            }

            // Get UTM parameters if marketing consent is given
            const utmParams = this.isTrackingAllowed('marketing') ?
                this.getUtmParameters() : {};

            // Validate session first, then update activity
            const sessionId = this.getSessionId();
            this.updateSessionActivity();
            
            // Get user and group IDs (from instance or cookies)
            const currentUserId = this.userId || this.getUserIdFromCookie() || "";
            const currentGroupId = this.groupId || this.getGroupIdFromCookie() || "";

            // Build event with IP and location info
            let events = [{
                event_name: "page_visit",
                properties: {
                    page_title: document.title,
                    page_url: window.location.href,
                    page_path: window.location.pathname,
                    page_referrer: document.referrer || null,
                    language: navigator.language || null,
                    ip_address: this.ipAddress,
                    city: this.locationInfo?.city || null,
                    region: this.locationInfo?.region || null,
                    country: this.locationInfo?.country || null,
                    postal: this.locationInfo?.postal || null,
                    loc: this.locationInfo?.loc || null, // Format: "lat,long"
                    timezone: this.locationInfo?.timezone || null,
                    ...utmParams
                },
                user_id: currentUserId,
                context: {
                    group_id: currentGroupId,
                    device_id: deviceId, // This will be null if not ready
                    session_id: sessionId,
                    source: this.source // Add source to context
                },
                timestamp: new Date().toISOString(),
            },];

            // Queue event instead of sending immediately
            this.queueEvent(events);

            // Add to interaction history
            this.addToInteractionHistory('page_visit', events[0].properties);
        }

        /**
         * Add event to interaction history
         * @param {string} type - Event type 
         * @param {Object} details - Event details
         */
        addToInteractionHistory(type, details) {
            // Add timestamp and sequence number
            const interaction = {
                type: type,
                details: details,
                timestamp: new Date().toISOString(),
                sequence: this.interactionHistory.length + 1
            };

            // Add to history
            this.interactionHistory.push(interaction);

            // Trim if necessary
            if (this.interactionHistory.length > this.maxHistoryLength) {
                this.interactionHistory.shift();
            }
        }

        /**
         * Capture element click event
         * @param {Event} event - Click event
         */
        captureClickEvent(event) {
            // Return early if click tracking not allowed
            if (!this.isTrackingAllowed('analytics')) {
                return;
            }

            // Throttle if too many clicks
            const now = Date.now();
            if (this.lastClickTime && now - this.lastClickTime < 300) {
                return;
            }
            this.lastClickTime = now;

            const target = event.target;
            const position = target.getBoundingClientRect();

            // Get device ID - return early if not ready
            const deviceId = this.getDeviceId();
            if (!deviceId) {
                console.debug("Device ID not ready, click event will be queued");
            }

            // Get UTM parameters if marketing consent is given
            const utmParams = this.isTrackingAllowed('marketing') ?
                this.getUtmParameters() : {};

            // Validate session first, then update activity
            const sessionId = this.getSessionId();
            this.updateSessionActivity();
            
            // Get user and group IDs (from instance or cookies)
            const currentUserId = this.userId || this.getUserIdFromCookie() || "";
            const currentGroupId = this.groupId || this.getGroupIdFromCookie() || "";

            let events = [{
                event_name: "element_click",
                properties: {
                    page_title: document.title,
                    page_url: window.location.href,
                    element_text: target.textContent?.trim() || null,
                    element_tag: target.tagName || null,
                    element_id: target.id || null,
                    element_href: target.getAttribute("href") || null,
                    element_aria_label: target.getAttribute("aria-label") || null,
                    element_class: target.className || null,
                    element_hierarchy: this.getElementHierarchy(target),
                    element_position_left: position.left || null,
                    element_position_top: position.top || null,
                    element_selector: this.getElementSelector(target),
                    viewport_height: window.innerHeight,
                    viewport_width: window.innerWidth,
                    referrer: document.referrer || null,
                    ...utmParams
                },
                user_id: currentUserId,
                context: {
                    group_id: currentGroupId,
                    device_id: deviceId, // This will be null if not ready
                    session_id: sessionId,
                    source: this.source // Add source to context
                },
                timestamp: new Date().toISOString(),
            },];

            // Queue event instead of sending immediately
            this.queueEvent(events);

            // Add to interaction history
            this.addToInteractionHistory('element_click', events[0].properties);
        }

        /**
         * Capture form events (submission, abandonment)
         * @param {Event} event - Form event
         */
        captureFormEvent(event, type) {
            // Return early if form tracking not allowed
            if (!this.isTrackingAllowed('analytics')) {
                return;
            }

            const form = event.target;

            // Get device ID - return early if not ready
            const deviceId = this.getDeviceId();
            if (!deviceId) {
                console.debug("Device ID not ready, form event will be queued");
            }

            // Validate session first, then update activity
            const sessionId = this.getSessionId();
            this.updateSessionActivity();
            
            const currentUserId = this.userId || this.getUserIdFromCookie() || "";
            const currentGroupId = this.groupId || this.getGroupIdFromCookie() || "";

            // Calculate form completion percentage
            let formData = form._trackingData || {
                filledFields: new Set()
            };
            const totalFields = Array.from(form.elements)
                .filter(e => !['submit', 'button', 'reset'].includes(e.type)).length;

            const completionPercent = Math.round(
                (formData.filledFields.size / Math.max(totalFields, 1)) * 100
            );

            let events = [{
                event_name: `form_${type}`,
                properties: {
                    page_title: document.title,
                    page_url: window.location.href,
                    form_id: form.id || null,
                    form_name: form.name || null,
                    form_action: form.action || null,
                    form_fields: totalFields,
                    form_completion: completionPercent,
                    interaction_time: formData.startTime ? Date.now() - formData.startTime : null
                },
                user_id: currentUserId,
                context: {
                    group_id: currentGroupId,
                    device_id: deviceId, // This will be null if not ready
                    session_id: sessionId,
                    source: this.source // Add source to context
                },
                timestamp: new Date().toISOString(),
            },];

            // Queue event instead of sending immediately
            this.queueEvent(events);

            // Add to interaction history
            this.addToInteractionHistory(`form_${type}`, events[0].properties);
        }

        /**
         * Set up automatic page visit tracking
         */
        autoCapturePageVisit() {
            // Track initial page load
            window.addEventListener("load", () => this.capturePageVisit());
            
            // Track navigation events
            window.addEventListener("popstate", () => this.capturePageVisit());
            
            // Track history API calls for SPA support
            const originalPushState = history.pushState;
            history.pushState = (...args) => {
                originalPushState.apply(history, args);
                this.capturePageVisit();
            };

            const originalReplaceState = history.replaceState;
            history.replaceState = (...args) => {
                originalReplaceState.apply(history, args);
                this.capturePageVisit();
            };
        }

        /**
         * Set up automatic click event tracking
         */
        autoCaptureClickEvents() {
            document.addEventListener("click", (event) => this.captureClickEvent(event));
        }

        /**
         * Set up automatic form event tracking
         */
        autoCaptureFormEvents() {
            // Track form submissions
            document.addEventListener('submit', event => {
                this.captureFormEvent(event, 'submit');
            });

            // Track form field interactions
            document.addEventListener('input', event => {
                if (event.target.form) {
                    const form = event.target.form;
                    if (!form._trackingData) {
                        form._trackingData = {
                            startTime: Date.now(),
                            filledFields: new Set()
                        };
                    }

                    // Track field completion
                    const field = event.target;
                    if (field.value.trim() !== '') {
                        form._trackingData.filledFields.add(field.name || field.id);
                    } else {
                        form._trackingData.filledFields.delete(field.name || field.id);
                    }
                }
            });

            // Track form abandonment
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    // Find forms with tracking data
                    document.querySelectorAll('form').forEach(form => {
                        if (form._trackingData && form._trackingData.filledFields.size > 0) {
                            // Create a synthetic event with the form as target
                            const event = {
                                target: form
                            };
                            this.captureFormEvent(event, 'abandoned');
                        }
                    });
                }
            });
        }

        /**
         * Get element hierarchy for DOM traversal
         * @param {Element} element - DOM element
         * @returns {string} Element hierarchy path
         */
        getElementHierarchy(element) {
            // Use a cache to improve performance
            if (!this._hierarchyCache) {
                this._hierarchyCache = new WeakMap();
            }

            // Return cached result if available
            if (this._hierarchyCache.has(element)) {
                return this._hierarchyCache.get(element);
            }

            let path = [];
            let currentElement = element;

            // Build path from element to document root
            while (currentElement && currentElement !== document) {
                let tagName = currentElement.tagName;
                let idSelector = currentElement.id ? `#${currentElement.id}` : "";
                let classSelector = currentElement.className && typeof currentElement.className === 'string' ?
                    `.${currentElement.className.trim().split(/\s+/).join(".")}` :
                    "";

                path.unshift(`${tagName}${idSelector}${classSelector}`);
                currentElement = currentElement.parentElement;
            }

            const result = path.join(" > ");

            // Cache the result
            this._hierarchyCache.set(element, result);

            return result;
        }

        /**
         * Get CSS selector for element
         * @param {Element} element - DOM element
         * @returns {string} CSS selector
         */
        getElementSelector(element) {
            let idSelector = element.id ? `#${element.id}` : "";
            let classSelector = element.className && typeof element.className === 'string' ?
                `.${element.className.trim().split(/\s+/).join(".")}` :
                "";

            return `${element.tagName}${idSelector}${classSelector}`;
        }

        /**
         * Automatically detect and clean PII from event data
         * @param {Object} eventData - Event data to clean
         * @returns {Object} Cleaned event data
         */
        cleanPIIFromEventData(eventData) {
            // Deep clone to avoid modifying original
            const cleanedData = JSON.parse(JSON.stringify(eventData));
            return cleanedData;
        }

        /**
         * Set user information and optionally make identify API call
         * @param {string} userId - User identifier
         * @param {string} emailId - User email address
         * @param {Object} properties - Additional user properties
         * @returns {Promise<Object|null>} API response or null if skipped
         */
        async setUser(userId, emailId, properties = {}) {
            if (!userId) {
                console.warn("setUser: userId is required");
                return null;
            }

            // Check if we need to make API call
            const currentUserId = this.getUserIdFromCookie();
            const shouldMakeApiCall = !currentUserId || currentUserId !== userId;

            // Always update local state and cookie
            this.setUserId(userId);

            if (shouldMakeApiCall) {
                try {
                    // Prepare identify payload
                    const identifyData = [{
                        "user_id": userId,
                        "traits": {
                            "user_email": emailId,
                            "user_name": emailId,
                            ...properties

                        },
                        "timestamp": new Date().toISOString()
                    }]

                    console.debug("Making identify API call for user:", userId);
                    const result = await this.identify(identifyData);
                    console.debug("Identify API call successful");
                    return result;
                } catch (error) {
                    console.error("Failed to make identify API call:", error);
                    throw error;
                }
            } else {
                console.debug("Skipping identify API call - user already set in cookie:", userId);
                return null;
            }
        }

        /**
         * Set group information and optionally make group API call
         * @param {string} groupId - Group identifier
         * @param {string} groupDomain - Group domain
         * @param {string} groupName - Group name
         * @param {Object} properties - Additional group properties
         * @returns {Promise<Object|null>} API response or null if skipped
         */
        async setGroup(groupId, groupDomain, groupName, properties = {}) {
            if (!groupId) {
                console.warn("setGroup: groupId is required");
                return null;
            }

            // Check if we need to make API call
            const currentGroupId = this.getGroupIdFromCookie();
            const shouldMakeApiCall = !currentGroupId || currentGroupId !== groupId;

            // Always update local state and cookie
            this.setGroupId(groupId);

            if (shouldMakeApiCall) {
                try {
                    // Prepare group payload
                    const groupData = [{
                        group_id: groupId,
                        user_id: this.userId || this.getUserIdFromCookie(),
                        traits: {
                            group_type: "Account",
                            account_domain: groupDomain,
                            account_name: groupName,
                            ...properties
                        },
                        timestamp: new Date().toISOString()
                    }];

                    console.debug("Making group API call for group:", groupId);
                    const result = await this.group(groupData);
                    console.debug("Group API call successful");
                    return result;
                } catch (error) {
                    console.error("Failed to make group API call:", error);
                    throw error;
                }
            } else {
                console.debug("Skipping group API call - group already set in cookie:", groupId);
                return null;
            }
        }

        /**
         * Enable debug mode for troubleshooting
         */
        enableDebugMode() {
            this.debugMode = true;

            // Override track method to log events
            const originalTrack = this.track;
            this.track = async function (events) {
                console.group('ThriveStack Debug: Sending Events');
                console.log('Events:', JSON.parse(JSON.stringify(events)));
                console.groupEnd();

                return originalTrack.call(this, events);
            }.bind(this);

            console.log('ThriveStack debug mode enabled');
        }
    }

    /**
     * Load FingerprintJS script
     * @returns {Promise<void>}
     */
    function loadFingerprintJSScript() {
        return new Promise((resolve, reject) => {
            // Check if already loaded
            if (window.FingerprintJS) {
                resolve();
                return;
            }

            // Create script element
            const script = document.createElement('script');
            script.src = 'https://openfpcdn.io/fingerprintjs/v4/iife.min.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load FingerprintJS script'));

            // Add to document
            document.head.appendChild(script);
        });
    }

    /**
     * Auto-initialize ThriveStack when script loads
     */
    (function () {

        // Pre-load FingerprintJS for faster initialization
        loadFingerprintJSScript().catch(error => {
            console.warn('Failed to pre-load FingerprintJS:', error.message);
        });

        let script = document.currentScript || Array.from(document.getElementsByTagName("script")).pop();

        // Priority order: data-api-key, then api-key (for backward compatibility)
        let apiKey = script.getAttribute("data-api-key") || script.getAttribute("api-key");

        // Priority order: data-source, then source (for backward compatibility)
        let source = script.getAttribute("data-source") || script.getAttribute("source");

        if (apiKey && source) {
            let thriveStack = new ThriveStack({
                apiKey: apiKey,
                trackClicks: script.getAttribute("data-track-clicks") === "true" || script.getAttribute("track-clicks") === "true",
                trackForms: script.getAttribute("data-track-forms") === "true" || script.getAttribute("track-forms") === "true",
                respectDoNotTrack: script.getAttribute("data-respect-dnt") !== "false" && script.getAttribute("respect-dnt") !== "false",
                source: source // Pass source from script attribute
            });

            // Note: We still call init() to set userId if provided,
            // but it no longer triggers a duplicate page visit
            thriveStack.init().catch((error) => {
                console.error("Failed to initialize ThriveStack:", error);
            });

            // Make instance available globally
            window.thriveStack = thriveStack;
        } else {
            if (!apiKey) {
                console.error("Missing required API key for ThriveStack initialization. Use data-api-key or api-key attribute.");
            }
            if (!source) {
                console.error("Missing required source for ThriveStack initialization. Use data-source or source attribute.");
            }
        }
    })();
})(this);
