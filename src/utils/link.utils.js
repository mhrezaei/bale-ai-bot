/**
 * Link Utility (The Link Engine)
 * Dynamically generates VLESS and Subscription links by parsing X-UI inbound streamSettings.
 * Perfectly mirrors the X-UI frontend JavaScript logic in a Node.js backend environment.
 * Supports: TCP, WS, GRPC, HTTPUpgrade, XHTTP with Reality/TLS/None security models.
 */
class LinkUtils {

    /**
     * Helper method to extract a specific header value from an X-UI headers array.
     * @param {Array} headers - Array of header objects {name, value}.
     * @param {string} targetName - The name of the header to find (e.g., 'host').
     * @returns {string|null} The header value or null if not found.
     */
    _getHeaderValue(headers, targetName) {
        if (!Array.isArray(headers)) return null;
        const header = headers.find(h => h.name.toLowerCase() === targetName.toLowerCase());
        return header ? header.value : null;
    }

    /**
     * Builds a standard, fully qualified VLESS link by deeply parsing inbound configurations.
     * Mimics `genVLESSLink` from X-UI frontend.
     * * @param {Object} inbound - The raw inbound object from X-UI API.
     * @param {Object} client - The specific client object (with id, email, flow).
     * @param {string} fallbackHost - Fallback host if externalProxy or listen is not set.
     * @returns {string} The fully qualified vless:// link.
     */
    buildVlessLink(inbound, client, fallbackHost = '127.0.0.1') {
        let streamSettings;
        let inboundSettings;

        try {
            streamSettings = typeof inbound.streamSettings === 'string' ? JSON.parse(inbound.streamSettings) : inbound.streamSettings;
            inboundSettings = typeof inbound.settings === 'string' ? JSON.parse(inbound.settings) : inbound.settings;
        } catch (e) {
            console.error('[LinkUtils] Failed to parse inbound settings:', e);
            return '';
        }

        const network = streamSettings.network || "tcp";
        let security = streamSettings.security || "none";

        // 1. Determine Address, Port, and Security (Prioritize External Proxy for NAT/CDN routing)
        // X-UI listens on 0.0.0.0 by default, fallback to server host if listen is empty
        let address = (inbound.listen && inbound.listen !== "0.0.0.0") ? inbound.listen : fallbackHost;
        let port = inbound.port;

        if (streamSettings.externalProxy && Array.isArray(streamSettings.externalProxy) && streamSettings.externalProxy.length > 0) {
            const ep = streamSettings.externalProxy[0];
            address = ep.dest || address;
            port = ep.port || port;
            // Handle forceTls override logic from X-UI
            security = (!ep.forceTls || ep.forceTls === 'same') ? security : ep.forceTls;
        }

        // 2. Initialize Parameters Map
        const params = new URLSearchParams();
        params.set("type", network);

        // VLESS encryption is usually 'none', but we fetch it dynamically just in case
        const encryption = inboundSettings.decryption || inboundSettings.encryption || "none";
        params.set("encryption", encryption);

        // 3. Network Specific Configurations (TCP, WS, GRPC, HTTPUpgrade, XHTTP)
        switch (network) {
            case "tcp":
                const tcp = streamSettings.tcpSettings || {};
                if (tcp.header && tcp.header.type === 'http') {
                    const req = tcp.header.request || {};
                    if (Array.isArray(req.path) && req.path.length > 0) {
                        params.set("path", req.path.join(','));
                    }
                    const tcpHost = this._getHeaderValue(req.headers, 'host');
                    if (tcpHost) params.set("host", tcpHost);
                    params.set("headerType", 'http');
                }
                break;

            case "ws":
                const ws = streamSettings.wsSettings || {};
                if (ws.path) params.set("path", ws.path);
                const wsHost = ws.host || this._getHeaderValue(ws.headers, 'host');
                if (wsHost) params.set("host", wsHost);
                break;

            case "grpc":
                const grpc = streamSettings.grpcSettings || {};
                if (grpc.serviceName) params.set("serviceName", grpc.serviceName);
                if (grpc.authority) params.set("authority", grpc.authority);
                if (grpc.multiMode) params.set("mode", "multi");
                break;

            case "httpupgrade":
                const httpupgrade = streamSettings.httpupgradeSettings || {};
                if (httpupgrade.path) params.set("path", httpupgrade.path);
                const huHost = httpupgrade.host || this._getHeaderValue(httpupgrade.headers, 'host');
                if (huHost) params.set("host", huHost);
                break;

            case "xhttp":
                const xhttp = streamSettings.xhttpSettings || {};
                if (xhttp.path) params.set("path", xhttp.path);
                const xHost = xhttp.host || this._getHeaderValue(xhttp.headers, 'host');
                if (xHost) params.set("host", xHost);
                if (xhttp.mode) params.set("mode", xhttp.mode);
                break;
        }

        // 4. Security Specific Configurations (TLS vs Reality)
        if (security === 'tls') {
            params.set("security", "tls");
            const tls = streamSettings.tlsSettings || {};
            const tlsSets = tls.settings || {};

            if (tlsSets.fingerprint) params.set("fp", tlsSets.fingerprint);
            if (Array.isArray(tls.alpn) && tls.alpn.length > 0) params.set("alpn", tls.alpn.join(','));
            if (tlsSets.allowInsecure) params.set("allowInsecure", "1");
            if (tls.serverName) params.set("sni", tls.serverName);
            if (tlsSets.echConfigList) params.set("ech", tlsSets.echConfigList);

            // Flow is only applicable for TCP + TLS/Reality
            if (network === "tcp" && client.flow) params.set("flow", client.flow);

        } else if (security === 'reality') {
            params.set("security", "reality");
            const reality = streamSettings.realitySettings || {};
            const realSets = reality.settings || {};

            if (realSets.publicKey) params.set("pbk", realSets.publicKey);
            if (realSets.fingerprint) params.set("fp", realSets.fingerprint);

            // serverNames and shortIds are comma-separated strings or arrays in X-UI config
            let serverNamesArr = [];
            if (Array.isArray(reality.serverNames)) serverNamesArr = reality.serverNames;
            else if (typeof reality.serverNames === 'string') serverNamesArr = reality.serverNames.split(',');

            if (serverNamesArr.length > 0 && serverNamesArr[0]) {
                params.set("sni", serverNamesArr[0]);
            }

            let shortIdsArr = [];
            if (Array.isArray(reality.shortIds)) shortIdsArr = reality.shortIds;
            else if (typeof reality.shortIds === 'string') shortIdsArr = reality.shortIds.split(',');

            if (shortIdsArr.length > 0 && shortIdsArr[0]) {
                params.set("sid", shortIdsArr[0]);
            }

            if (realSets.spiderX) params.set("spx", realSets.spiderX);
            if (realSets.mldsa65Verify) params.set("pqv", realSets.mldsa65Verify);

            // Flow is only applicable for TCP + TLS/Reality
            if (network === "tcp" && client.flow) params.set("flow", client.flow);

        } else {
            params.set("security", "none");
        }

        // 5. Final Assembly: vless://uuid@address:port?params#remark
        const baseUrl = `vless://${client.id}@${address}:${port}`;
        const encodedRemark = encodeURIComponent(client.email || 'Hedioum-Client');

        // Note: URLSearchParams automatically URL-encodes values (e.g. spx=/)
        return `${baseUrl}?${params.toString()}#${encodedRemark}`;
    }

    /**
     * Builds the subscription link based on the client's subId and server's specific base URL.
     * @param {string} subId - The 16-character subscription ID generated by X-UI.
     * @param {string} subBaseUrl - The subscription base URL specific to the server (from DB).
     * @param {string} clientEmail - The client's email/name to be displayed as the profile name in the V2ray client.
     * @returns {string} Fully qualified subscription link.
     */
    buildSubLink(subId, subBaseUrl, clientEmail) {
        if (!subBaseUrl) {
            // Fallback in case subBaseUrl is missing from server configuration
            subBaseUrl = 'https://sub.default.com/';
        }

        let base = subBaseUrl;
        if (!base.endsWith('/')) {
            base += '/';
        }

        // [ENHANCEMENT] Use the client's email/name for the app display name instead of the raw hash
        const displayName = clientEmail ? encodeURIComponent(clientEmail) : subId;

        // Follows X-UI standard format: subURI + subID + ?name=displayName
        return `${base}${subId}?name=${displayName}`;
    }

    /**
     * Generates a Telegram 'Share' link.
     * Used to forward configs seamlessly to end-users without the "Forwarded from Bot" tag.
     * @param {string} text - The compiled config message to be shared.
     * @returns {string} The t.me share URL.
     */
    getTelegramShareUrl(text) {
        return `https://t.me/share/url?url=${encodeURIComponent(' ')}&text=${encodeURIComponent(text)}`;
    }
}

module.exports = new LinkUtils();